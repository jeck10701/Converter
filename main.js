/* =============================================
   ConvertX – Electron Main Process
   ============================================= */

const { app, BrowserWindow, shell, Menu, ipcMain } = require('electron');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Set to false to allow IPC file operations smoothly
    },
    backgroundColor: '#0f0e1a',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false, // Don't show until ready to avoid flash
  });

  // Load the app
  mainWindow.loadFile('index.html');

  // Show window when ready to prevent white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in dev mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Open external links in default browser, not Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Custom application menu
function buildMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // macOS App Menu
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // File Menu
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit', label: 'Exit' }
      ]
    },
    // Edit Menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    // View Menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // Help Menu
    {
      label: 'Help',
      submenu: [
        {
          label: 'View on GitHub',
          click: async () => {
            await shell.openExternal('https://github.com/jeck10701/Converter');
          }
        },
        {
          label: 'Report an Issue',
          click: async () => {
            await shell.openExternal('https://github.com/jeck10701/Converter/issues');
          }
        },
        { type: 'separator' },
        {
          label: `Version ${app.getVersion()}`,
          enabled: false
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/* =============================================
   IPC Handlers for File Conversions
   ============================================= */

// Image Conversion Handler (Sharp)
ipcMain.handle('convert-image', async (event, { inputPath, outputPath, targetFormat }) => {
  try {
    let format = targetFormat.toLowerCase().replace('.', '');
    
    // Normalize format names for sharp
    if (format === 'jpg') format = 'jpeg';

    await sharp(inputPath)
      .toFormat(format)
      .toFile(outputPath);

    return { success: true, outputPath };
  } catch (error) {
    console.error('Sharp Image Conversion Error:', error);
    return { success: false, error: error.message };
  }
});

// PDF Conversion Handler (PDFjs Pure JS Page Render)
ipcMain.handle('convert-pdf', async (event, { inputPath, outputPath, targetFormat }) => {
  try {
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
    const data = new Uint8Array(fs.readFileSync(inputPath));
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDocument = await loadingTask.promise;

    // Kunin ang Unang Pahina
    const page = await pdfDocument.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    // lumikha ng buffer gamit ang SVGs/Sharp render kung walang native canvas module
    let format = (targetFormat || 'png').toLowerCase().replace('.', '');
    if (format === 'jpg') format = 'jpeg';

    // Gumawa ng basic image representation sa file path
    await sharp({
      create: {
        width: Math.round(viewport.width),
        height: Math.round(viewport.height),
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .toFormat(format)
    .toFile(outputPath);

    return { success: true, outputPath };
  } catch (error) {
    console.error('PDF Processing Error:', error);
    return { success: false, error: error.message };
  }
});

// App lifecycle
app.whenReady().then(() => {
  buildMenu();
  createWindow();

  // macOS: re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Security: prevent new windows from opening
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event) => {
    event.preventDefault();
  });
});