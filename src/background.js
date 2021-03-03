'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
import { ipcMain } from 'electron';
const path = require('path')

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

ipcMain.on('do-ping', (event, arg) => {
  const [trgIp, trgPort] = arg.split(':')
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
    event.reply('result-ping', result[idx])
  }

  socket.on('message', () => {
    if (timeouts > 0) {
      timeouts--;
      getPing(recvCount, false)
    } else {
      getPing(recvCount, (Date.now() - sendTime[recvCount]) / 16.6, false)
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
        timeouts += result[pc] ? 0 : 1
        getPing(pc, false)
      }, 1000, postCount)
      postCount++;
      if (err) {
        throw err;
      }
    })
  }

  intervalHelper();

  const timer = setInterval(intervalHelper, 1200);

  setTimeout(() => {
    clearInterval(timer);
    event.reply('result-ping', 'end')
    socket.close()
  }, 6500);

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
  const win = new BrowserWindow({
    width: 624,
    height: 624,
    minWidth: 624,
    // NodeIntegration: true
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
    }
  })
  win.setMenuBarVisibility(false)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
