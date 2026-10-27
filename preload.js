/* =============================================
   ConvertX – Electron Preload Script
   Safely exposes Node.js APIs to the renderer
   ============================================= */

const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe, limited API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('get-version'),
  platform: process.platform,

  // Let renderer know it's running in Electron
  isElectron: true,

  // Conversion APIs
  convertImage: (data) => ipcRenderer.invoke('convert-image', data),
  convertPdf: (data) => ipcRenderer.invoke('convert-pdf', data),
});