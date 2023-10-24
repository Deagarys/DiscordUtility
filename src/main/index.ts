import { app, shell, BrowserWindow, Menu, Tray } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import discord from '../../resources/discord.png?asset';
import discord16 from '../../resources/discord16.png?asset';
import { autoUpdater } from 'electron-updater';

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 900,
        height: 690,
        show: false,
        resizable: false,
        autoHideMenuBar: true,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#21222d',
            symbolColor: '#74b1be',
            height: 40
        },
        icon: discord,
        ...(process.platform === 'linux' ? { discord } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    let isQuitting = false;

    mainWindow.on('ready-to-show', () => {
        mainWindow!.show();
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: 'deny' };
    });

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    mainWindow.on('close', function (event) {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow!.hide();

            return false;
        }
        return true;
    });

    const tray: Tray = new Tray(discord);

    tray.setContextMenu(
        Menu.buildFromTemplate([
            {
                label: `Discord Utility`,
                icon: discord16,
                enabled: false
            },
            {
                type: 'separator'
            },
            {
                label: `Version: ${app.getVersion()}`,
                enabled: false
            },
            {
                type: 'separator'
            },
            {
                label: 'Show',
                click: function (): void {
                    mainWindow!.show();
                }
            },
            {
                label: 'Quit',
                click: function (): void {
                    isQuitting = true;
                    app.quit();
                }
            }
        ])
    );

    tray.setToolTip('Discord Utility');
    tray.setTitle('Discord Utility');
    tray.on('click', (): void => {
        mainWindow!.show();
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron');

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });

    createWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
    autoUpdater.checkForUpdates();
});

const sendMessageToWindow = (message: string): void => {
    if (mainWindow) {
        mainWindow.webContents.send('message', message);
    }
};

autoUpdater.on('checking-for-update', () => {
    sendMessageToWindow('Checking for update...');
});

autoUpdater.on('update-available', () => {
    sendMessageToWindow('Update available!');
});

autoUpdater.on('update-not-available', () => {
    sendMessageToWindow('Already on the newest version!');
});

autoUpdater.on('error', (error) => {
    sendMessageToWindow(`Error in auto-updater: ${error}`);
});

autoUpdater.on('download-progress', (progressObject) => {
    sendMessageToWindow(`Downloading: ${progressObject.percent}%`);
});

autoUpdater.on('update-downloaded', (info) => {
    sendMessageToWindow(`Update downloaded, will install now! Version: ${info.version}`);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
