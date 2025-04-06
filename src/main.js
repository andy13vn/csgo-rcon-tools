const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const Store = require("electron-store");
const { Rcon } = require("rcon-client");

// Tạo store để lưu cấu hình
const store = new Store({
  defaults: {
    recentConnections: [],
    lastConnection: null,
  },
});

// Khởi tạo biến cửa sổ chính
let mainWindow;
let rconClient = null;
let reconnectTimer = null;

// Hàm tạo cửa sổ chính
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load trang HTML chính
  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));

  // Mở DevTools trong quá trình phát triển
  // mainWindow.webContents.openDevTools();
}

// Khởi tạo ứng dụng
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Đóng ứng dụng khi tất cả cửa sổ đóng (trừ macOS)
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// Xử lý kết nối RCON
ipcMain.handle("connect-rcon", async (event, { host, port, password }) => {
  try {
    // Đóng kết nối cũ nếu có
    if (rconClient) {
      // Same safe disconnection pattern
      const client = rconClient;
      rconClient = null;
      await client.end();
    }

    console.log(`RCON_CONNECTING: ${host}:${port}`);

    // Tạo kết nối mới (rcon-client sử dụng Promises)
    rconClient = await Rcon.connect({
      host,
      port: parseInt(port),
      password,
      timeout: 5000, // timeout 5 giây
    });

    console.log("RCON_CONNECTION_SUCCESS");

    // Save current connection for possible auto-reconnect
    store.set("lastConnection", { host, port, password });

    // Lưu kết nối vào danh sách gần đây
    const recentConnections = store.get("recentConnections");
    const newConnection = {
      host,
      port,
      password,
      lastConnected: new Date().toISOString(),
    };

    // Kiểm tra nếu kết nối đã tồn tại thì cập nhật, nếu không thì thêm mới
    const existingIndex = recentConnections.findIndex(
      (c) => c.host === host && c.port === port
    );
    if (existingIndex !== -1) {
      recentConnections[existingIndex] = newConnection;
    } else {
      recentConnections.push(newConnection);
    }

    // Giới hạn số lượng kết nối gần đây
    store.set("recentConnections", recentConnections.slice(-10));

    return { success: true };
  } catch (error) {
    console.error("RCON_CONNECTION_ERROR", error);
    return {
      success: false,
      error: error.message || "Không thể kết nối tới máy chủ RCON",
    };
  }
});

// Gửi lệnh đến RCON server
ipcMain.handle("send-command", async (event, command) => {
  if (!rconClient) {
    return { success: false, error: "Không có kết nối đến máy chủ RCON" };
  }

  try {
    console.log(`RCON_SENDING_COMMAND: ${command}`);

    // Kiểm tra xem có phải lệnh đổi bản đồ không
    const isChangeLevel = command.toLowerCase().startsWith("changelevel");

    let response;

    if (isChangeLevel) {
      // Đối với lệnh changelevel, thiết lập timeout ngắn vì máy chủ có thể đóng kết nối
      try {
        // Gửi lệnh đổi bản đồ với timeout 2 giây
        const promise = Promise.race([
          rconClient.send(command),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("changelevel_timeout")), 2000)
          ),
        ]);

        response = await promise;
        console.log(
          `RCON_COMMAND_RESPONSE: ${command} => ${
            response || "(không có phản hồi)"
          }`
        );
      } catch (err) {
        // Nếu timeout trong lệnh changelevel, coi như thành công
        if (err.message === "changelevel_timeout") {
          console.log(
            "RCON_CHANGELEVEL_TIMEOUT: Expected behavior, server is changing map"
          );
          response =
            "Đang tải bản đồ mới. Kết nối có thể bị đóng trong quá trình này.";
        } else {
          throw err;
        }
      }

      // Đóng kết nối sau khi gửi lệnh đổi bản đồ để tránh treo
      try {
        if (rconClient) {
          // Same pattern: save reference and clear global variable first
          const client = rconClient;
          rconClient = null;
          await client.end();

          // Schedule reconnect after map change
          console.log("RCON_SCHEDULING_RECONNECT_AFTER_MAP_CHANGE");

          // Clear any existing timer
          if (reconnectTimer) {
            clearTimeout(reconnectTimer);
          }

          // Wait 10 seconds before reconnecting (typical map load time)
          reconnectTimer = setTimeout(async () => {
            console.log("RCON_AUTO_RECONNECTING_AFTER_MAP_CHANGE");
            try {
              // Attempt to reconnect using last connection details
              const lastConnection = store.get("lastConnection");
              if (lastConnection) {
                const { host, port, password } = lastConnection;

                // Connect to the server
                rconClient = await Rcon.connect({
                  host,
                  port: parseInt(port),
                  password,
                  timeout: 5000,
                });

                console.log("RCON_AUTO_RECONNECTION_SUCCESS");

                // Notify renderer about reconnection
                if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.webContents.send("rcon-auto-reconnected");
                }
              }
            } catch (reconnectErr) {
              console.error("RCON_AUTO_RECONNECTION_ERROR", reconnectErr);
            } finally {
              reconnectTimer = null;
            }
          }, 10000);
        }
      } catch (disconnectErr) {
        console.log(
          "RCON_DISCONNECT_AFTER_CHANGELEVEL:",
          disconnectErr.message
        );
      }
    } else {
      // Các lệnh thông thường
      response = await rconClient.send(command);
      console.log(
        `RCON_COMMAND_RESPONSE: ${command} => ${
          response || "(không có phản hồi)"
        }`
      );
    }

    return {
      success: true,
      response: response || "Lệnh đã được thực thi (không có phản hồi)",
    };
  } catch (error) {
    console.error("RCON_COMMAND_ERROR", error);

    // Nếu lỗi kết nối, đóng kết nối hiện tại
    if (rconClient) {
      try {
        // Apply the same safety pattern here
        const client = rconClient;
        rconClient = null;
        await client.end();
      } catch (e) {}
    }

    return {
      success: false,
      error: error.message || "Lỗi khi gửi lệnh RCON",
    };
  }
});

// Ngắt kết nối RCON
ipcMain.handle("disconnect-rcon", async () => {
  if (rconClient) {
    try {
      // Save reference and clear global variable first to prevent race conditions
      const client = rconClient;
      rconClient = null;

      // Now we can safely end the client
      await client.end();
      return { success: true };
    } catch (error) {
      console.error("RCON_DISCONNECT_ERROR", error);
      // Client already set to null above
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: "No active connection" };
});

// Lấy danh sách kết nối gần đây
ipcMain.handle("get-recent-connections", () => {
  return store.get("recentConnections");
});
