console.log('Electron Main Script Starting...');
const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true, // Minimalist approach: hide menu bar
        title: 'Deskta',
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            spellcheck: false, // Enteng: disable spellcheck
        },
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5180');
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Optional: Only show devtools in dev mode
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
}

// Stability: Disable GPU and sandbox if hardware/driver issues occur (Must be top-level)
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-background-timer-throttling');

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
