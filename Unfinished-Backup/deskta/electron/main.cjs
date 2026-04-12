const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
        title: 'Deskta',
        icon: path.join(__dirname, '../public/logo smk.png'),
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            spellcheck: false,
            preload: path.join(__dirname, 'preload.cjs'),
        },
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5180');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle external links security
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });
}

// IPC Handlers
ipcMain.on('open-external', (event, url) => {
    shell.openExternal(url);
});

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    // Stability Switches
    app.disableHardwareAcceleration();
    app.commandLine.appendSwitch('disable-gpu');
    app.commandLine.appendSwitch('no-sandbox');
    app.commandLine.appendSwitch('no-zygote');
    app.commandLine.appendSwitch('disable-dev-shm-usage');
    app.commandLine.appendSwitch('disable-software-rasterizer');
    app.commandLine.appendSwitch('disable-background-timer-throttling');

    app.whenReady().then(() => {
        createWindow();

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
