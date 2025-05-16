import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.ico?asset';

ipcMain.on('do-ping', (event, arg) => {
  const [trgIp, trgPort] = arg.split(':');
  const dgram = require('dgram');
  const socket = dgram.createSocket('udp4');

  const MY_HOST = '0.0.0.0';
  const MY_PORT = 8007;

  let postCount = 0;
  let recvCount = 0;
  let timeouts = 0;
  let sendTime = [];
  let result = [];
  const self = this;


  const getPing = (idx, v) => {
    if (result[idx]) return;
    result[idx] = v;
    event.reply('result-ping', result[idx]);
  };

  socket.on('message', () => {
    if (timeouts > 0) {
      timeouts--;
      getPing(recvCount, false);
    } else {
      getPing(recvCount, (Date.now() - sendTime[recvCount]) / 16.6, false);
    }
    recvCount++;
  });

  try {
    socket.bind(MY_PORT, MY_HOST);
  } catch (e) {
    if (!e.code === 'ERR_SOCKET_ALREADY_BOUND') throw e;
  }

  const strToByte = (str) => str.match(/.{2}/g).map((s) => parseInt(s, 16));
  function intervalHelper() {
    const data = WatchBuffer1();
    socket.send(data, 0, data.length, trgPort, trgIp, (err) => {
      sendTime[postCount] = Date.now();
      setTimeout((pc) => {
        timeouts += result[pc] ? 0 : 1;
        getPing(pc, false);
      }, 1000, postCount);
      postCount++;
      if (err) {
        throw err;
      }
    });
  }

  intervalHelper();

  const timer = setInterval(intervalHelper, 1200);

  setTimeout(() => {
    clearInterval(timer);
    event.reply('result-ping', 'end');
    socket.close();
  }, 1200 * 9 - 100);

  // https://hackmd.io/@yoG90kkvSRmw42HiR0pozw/H1V3vcVTf?type=view
  function WatchBuffer1() {
    const port = trgPort.toString(16).padStart(4, '0').match(/.{2}/g);
    const ip = trgIp
      .split('.')
      .map((v) => Number(v).toString(16).padStart(2, '0'));
    const bytes = [
      ['01'],
      ['0200'],
      port,
      ip,
      ['00000000'],
      ['00000000'],
      ['02'],
      ['00'],
      port,
      ip,
      ['00000000'],
      ['00000000'],
      ['0000'],
      ['0000'],
    ];
    return Buffer.concat(
      bytes.map((byte) => Buffer.from(byte.map((s) => strToByte(s)).flat()))
    );
  }
});

async function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 624,
    height: 624,
    minWidth: 624,
    webPreferences: {
      ...(process.platform === 'linux' ? { icon } : {}),
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    }
  });
  mainWindow.setMenuBarVisibility(false);

  // mainWindow.on('ready-to-show', () => {
  //   mainWindow.show();
  // });

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
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
