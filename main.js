/* =============================================
   ConvertX – Electron Main Process
   ============================================= */

const { app, BrowserWindow, shell, Menu, ipcMain } = require('electron');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const os = require('os');
const docxPdf = require('docx-pdf');

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

// ─── Image Conversion Handler (Sharp) ────────────────────────────────────────
ipcMain.handle('convert-image', async (event, { inputPath, outputBuffer, outputPath, targetFormat }) => {
  try {
    let format = targetFormat.toLowerCase().replace('.', '');
    if (format === 'jpg') format = 'jpeg';
    if (format === 'tif') format = 'tiff';

    // Accept either a file path or a base64 buffer sent from renderer
    const src = inputPath ? sharp(inputPath) : sharp(Buffer.from(outputBuffer, 'base64'));

    await src.toFormat(format).toFile(outputPath);
    return { success: true, outputPath };
  } catch (error) {
    console.error('Sharp Image Conversion Error:', error);
    return { success: false, error: error.message };
  }
});

// ─── PDF → Image Conversion Handler (pdfjs-dist + sharp) ────────────────────
ipcMain.handle('convert-pdf', async (event, { inputPath, outputPath, targetFormat }) => {
  try {
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
    const { createCanvas } = require('canvas');

    const data = new Uint8Array(fs.readFileSync(inputPath));
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDoc = await loadingTask.promise;

    const page = await pdfDoc.getPage(1); // render first page
    const viewport = page.getViewport({ scale: 2.0 }); // 2x for quality

    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;

    // Save canvas as PNG first, then use sharp to convert to target format
    const pngBuffer = canvas.toBuffer('image/png');
    let fmt = targetFormat.toLowerCase().replace('.', '');
    if (fmt === 'jpg') fmt = 'jpeg';

    await sharp(pngBuffer).toFormat(fmt).toFile(outputPath);
    return { success: true, outputPath };
  } catch (error) {
    console.error('PDF Conversion Error:', error.message);
    // Fallback: try without canvas (pdfjs NodeCanvas workaround)
    try {
      // If canvas module not available, return a meaningful error
      return { success: false, error: `PDF conversion failed: ${error.message}. Try installing the 'canvas' npm package.` };
    } catch (e2) {
      return { success: false, error: error.message };
    }
  }
});

// ─── Document Conversion Handler (DOCX/DOC → PDF) ────────────────────────────
ipcMain.handle('convert-doc', async (event, { inputPath, outputPath, targetFormat }) => {
  try {
    const fmt = targetFormat.toLowerCase();

    if (fmt === 'pdf') {
      // Use docx-pdf for DOCX/DOC → PDF
      await new Promise((resolve, reject) => {
        docxPdf(inputPath, outputPath, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      return { success: true, outputPath };
    }

    // TXT → any text format (simple copy/rename)
    const ext = path.extname(inputPath).toLowerCase();
    if (ext === '.txt' && fmt === 'txt') {
      fs.copyFileSync(inputPath, outputPath);
      return { success: true, outputPath };
    }

    return { success: false, error: `Document conversion from ${ext} to ${fmt} is not yet supported.` };
  } catch (error) {
    console.error('Doc Conversion Error:', error);
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
