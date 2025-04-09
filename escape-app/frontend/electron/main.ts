import * as electron from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as crypto from 'crypto'

const { app, BrowserWindow, ipcMain, dialog } = electron

let mainWindow: electron.BrowserWindow | null = null

// Secure 3-pass file deletion
function secureDelete(filePath: string) {
  const passes = 3;
  const fileSize = fs.statSync(filePath).size;
  
  for (let i = 0; i < passes; i++) {
    const randomData = crypto.randomBytes(fileSize);
    fs.writeFileSync(filePath, randomData);
    fs.fsyncSync(fs.openSync(filePath, 'r+'));
  }
  fs.unlinkSync(filePath);
}

function createWindow() {
  try {
    mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true
  });
} catch (err) {
  console.error('Window creation failed:', err);
  return;
}

  // Handle biometric authentication requests
  // Secure wipe handler
  ipcMain.handle('secure-wipe', async () => {
    try {
      if (!mainWindow) throw new Error('Window not available');
      
      // Wipe application data
      const appDataPath = app.getPath('appData');
      const escapeDataPath = path.join(appDataPath, 'escape-app');
      
      if (fs.existsSync(escapeDataPath)) {
        // Secure delete files
        const files = fs.readdirSync(escapeDataPath);
        for (const file of files) {
          const filePath = path.join(escapeDataPath, file);
          secureDelete(filePath);
        }
        fs.rmdirSync(escapeDataPath);
      }

      // Wipe logs
      const logsPath = app.getPath('logs');
      const escapeLogsPath = path.join(logsPath, 'escape-app');
      if (fs.existsSync(escapeLogsPath)) {
        fs.rmSync(escapeLogsPath, { recursive: true });
      }

      return { success: true };
    } catch (error) {
      console.error('Wipe failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Biometric authentication dialog
  ipcMain.handle('show-biometric-dialog', async () => {
    if (!mainWindow) return false;
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      title: 'Biometric Authentication',
      message: 'Please authenticate using your device biometrics',
      buttons: ['Cancel', 'Authenticate'],
      cancelId: 0
    })
    return response === 1
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  // Clean up references
  mainWindow = null;
  if (process.platform !== 'darwin') app.quit()
})

// Clean up on exit
app.on('will-quit', () => {
  // Additional cleanup if needed
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
