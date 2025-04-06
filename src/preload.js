const { contextBridge, ipcRenderer } = require("electron");

// Thiết lập API cho phép renderer process gọi các hàm từ main process
contextBridge.exposeInMainWorld("rconAPI", {
  // Kết nối đến RCON server
  connect: (connectionDetails) =>
    ipcRenderer.invoke("connect-rcon", connectionDetails),

  // Gửi lệnh đến RCON server
  sendCommand: (command) => ipcRenderer.invoke("send-command", command),

  // Ngắt kết nối khỏi RCON server
  disconnect: () => ipcRenderer.invoke("disconnect-rcon"),

  // Lấy danh sách kết nối gần đây
  getRecentConnections: () => ipcRenderer.invoke("get-recent-connections"),

  // Thiết lập lắng nghe sự kiện kết nối lại tự động
  onAutoReconnect: (callback) => {
    // Remove any existing listeners to avoid duplicates
    ipcRenderer.removeAllListeners("rcon-auto-reconnected");

    // Add new listener
    ipcRenderer.on("rcon-auto-reconnected", () => callback());

    // Return cleanup function
    return () => {
      ipcRenderer.removeAllListeners("rcon-auto-reconnected");
    };
  },
});
