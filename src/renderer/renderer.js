// Các phần tử DOM
const connectionForm = document.getElementById("connection-form");
const hostInput = document.getElementById("host");
const portInput = document.getElementById("port");
const passwordInput = document.getElementById("password");
const connectBtn = document.getElementById("connect-btn");
const disconnectBtn = document.getElementById("disconnect-btn");
const commandInput = document.getElementById("command-input");
const sendCommandBtn = document.getElementById("send-command-btn");
const consoleOutput = document.getElementById("console-output");
const connectionStatus = document.getElementById("connection-status");
const recentList = document.getElementById("recent-list");
const notification = document.getElementById("notification");
const mapSelect = document.getElementById("map-select");
const changeMapBtn = document.getElementById("change-map-btn");

// Biến trạng thái
let isConnected = false;

// Hàm hiển thị thông báo
function showNotification(message, type = "info") {
  notification.textContent = message;
  notification.className = `notification show ${type}`;

  setTimeout(() => {
    notification.className = "notification";
  }, 3000);
}

// Hàm thêm nội dung vào console
function addToConsole(content, type = "info") {
  const logEntry = document.createElement("div");
  logEntry.className = `log-entry log-${type}`;

  const timestamp = new Date().toLocaleTimeString();
  const timeSpan = document.createElement("span");
  timeSpan.className = "log-time";
  timeSpan.textContent = `[${timestamp}] `;

  logEntry.appendChild(timeSpan);
  logEntry.appendChild(document.createTextNode(content));

  consoleOutput.appendChild(logEntry);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Hàm cập nhật trạng thái kết nối UI
function updateConnectionUI(connected) {
  isConnected = connected;

  if (connected) {
    connectionStatus.textContent = "Connected";
    connectionStatus.className = "status connected";

    // Kích hoạt các nút điều khiển
    disconnectBtn.disabled = false;
    commandInput.disabled = false;
    sendCommandBtn.disabled = false;

    // Kích hoạt tất cả các nút lệnh
    document.querySelectorAll("[data-command]").forEach((btn) => {
      btn.disabled = false;
    });

    // Kích hoạt chọn bản đồ
    mapSelect.disabled = false;
    changeMapBtn.disabled = false;

    // Add success message to console
    addToConsole("Successfully connected to RCON server", "success");
  } else {
    connectionStatus.textContent = "Not Connected";
    connectionStatus.className = "status disconnected";

    // Vô hiệu hóa các nút
    disconnectBtn.disabled = true;
    commandInput.disabled = true;
    sendCommandBtn.disabled = true;

    // Vô hiệu hóa tất cả các nút lệnh
    document.querySelectorAll("[data-command]").forEach((btn) => {
      btn.disabled = true;
    });

    // Vô hiệu hóa chọn bản đồ
    mapSelect.disabled = true;
    changeMapBtn.disabled = true;
  }
}

// Theme toggle functionality
const themeToggleBtn = document.getElementById("theme-toggle");
const htmlElement = document.documentElement;

// Kiểm tra theme từ localStorage hoặc system preference
function getThemePreference() {
  if (
    localStorage.getItem("theme") === "dark" ||
    (!localStorage.getItem("theme") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    return "dark";
  }
  return "light";
}

// Áp dụng theme
function applyTheme(theme) {
  if (theme === "dark") {
    htmlElement.classList.add("dark");
  } else {
    htmlElement.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
}

// Toggle theme
function toggleTheme() {
  if (htmlElement.classList.contains("dark")) {
    applyTheme("light");
  } else {
    applyTheme("dark");
  }
}

// Khi trang được tải
document.addEventListener("DOMContentLoaded", async () => {
  // Thiết lập giá trị mặc định
  portInput.value = "25575";

  // Áp dụng theme từ trước
  applyTheme(getThemePreference());

  // Lắng nghe sự kiện toggle theme
  themeToggleBtn.addEventListener("click", toggleTheme);

  // Tải danh sách kết nối gần đây
  await loadRecentConnections();

  // Setup auto-reconnect event listener
  window.rconAPI.onAutoReconnect(() => {
    updateConnectionUI(true);
    addToConsole("Auto-reconnected after map change", "info");
    showNotification("Auto-reconnected to server", "success");
  });
});

// Kết nối đến RCON server
connectionForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const host = hostInput.value.trim();
  const port = parseInt(portInput.value, 10);
  const password = passwordInput.value;

  // Vô hiệu hóa nút kết nối trong khi đang xử lý
  connectBtn.disabled = true;
  connectBtn.textContent = "Connecting...";

  try {
    addToConsole(`Connecting to ${host}:${port}...`, "info");

    const result = await window.rconAPI.connect({ host, port, password });

    if (result.success) {
      updateConnectionUI(true);
      showNotification("Connection successful!", "success");
    } else {
      addToConsole(`Connection error: ${result.error}`, "error");
      showNotification(`Connection error: ${result.error}`, "error");
    }
  } catch (error) {
    addToConsole(`Error: ${error.message}`, "error");
    showNotification(`Error: ${error.message}`, "error");
  } finally {
    connectBtn.disabled = false;
    connectBtn.textContent = "Connect";

    // Tải lại danh sách kết nối gần đây
    await loadRecentConnections();
  }
});

// Ngắt kết nối khỏi RCON server
disconnectBtn.addEventListener("click", async () => {
  try {
    const result = await window.rconAPI.disconnect();

    if (result.success) {
      updateConnectionUI(false);
      addToConsole("Disconnected from server", "info");
      showNotification("Disconnected", "info");
    } else {
      addToConsole(`Disconnection error: ${result.error}`, "error");
      showNotification(`Disconnection error: ${result.error}`, "error");
    }
  } catch (error) {
    addToConsole(`Error: ${error.message}`, "error");
    showNotification(`Error: ${error.message}`, "error");
  }
});

// Gửi lệnh đến RCON server
async function sendCommand(command) {
  if (!isConnected || !command) return;

  try {
    // Hiển thị lệnh đã gửi
    addToConsole(`> ${command}`, "command");

    // Gửi lệnh đến server
    const result = await window.rconAPI.sendCommand(command);

    if (result.success) {
      // Hiển thị phản hồi từ server
      if (command.startsWith("mp_freezetime")) {
        // Special handling for mp_freezetime command
        const time = command.split(" ")[1];
        if (!result.response || result.response === "(no response)") {
          // If no response, create a clear notification
          addToConsole(`Set freeze time to: ${time} seconds`, "response");
        } else {
          // If there's a response, display it normally
          addToConsole(result.response, "response");
        }
      } else {
        // Normal handling for other commands
        addToConsole(result.response, "response");
      }
    } else {
      addToConsole(`Error: ${result.error}`, "error");
      showNotification(`Error: ${result.error}`, "error");
    }
  } catch (error) {
    addToConsole(`Error: ${error.message}`, "error");
    showNotification(`Error: ${error.message}`, "error");
  }
}

// Xử lý gửi lệnh khi nhấn nút Gửi
sendCommandBtn.addEventListener("click", () => {
  const command = commandInput.value.trim();

  if (command) {
    sendCommand(command);
    commandInput.value = "";
  }
});

// Xử lý gửi lệnh khi nhấn Enter
commandInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const command = commandInput.value.trim();

    if (command) {
      sendCommand(command);
      commandInput.value = "";
    }
  }
});

// Xử lý các nút lệnh nhanh
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-command]");
  if (btn && btn.dataset.command && !btn.disabled) {
    sendCommand(btn.dataset.command);
  }
});

// Xử lý nút đổi bản đồ
changeMapBtn.addEventListener("click", () => {
  const selectedMap = mapSelect.value;
  if (selectedMap && isConnected) {
    // Create map change command for CS:GO
    const command = `changelevel ${selectedMap}`;

    // Notify action
    addToConsole(`Changing map to ${selectedMap}...`, "info");

    // Gửi lệnh
    sendCommand(command);
  }
});

// Tải danh sách kết nối gần đây
async function loadRecentConnections() {
  try {
    const recentConnections = await window.rconAPI.getRecentConnections();

    // Clear current list
    recentList.innerHTML = "";

    if (recentConnections.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.textContent = "No recent connections";
      emptyItem.style.cursor = "default";
      recentList.appendChild(emptyItem);
      return;
    }

    // Sort by most recent connection time
    recentConnections
      .sort((a, b) => new Date(b.lastConnected) - new Date(a.lastConnected))
      .forEach((conn) => {
        const item = document.createElement("li");
        item.textContent = `${conn.host}:${conn.port}`;

        // When item is clicked, fill form with connection info
        item.addEventListener("click", () => {
          hostInput.value = conn.host;
          portInput.value = conn.port;
          passwordInput.value = conn.password;
        });

        recentList.appendChild(item);
      });
  } catch (error) {
    console.error("Error loading recent connections:", error);
  }
}
