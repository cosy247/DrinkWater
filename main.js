const { app, BrowserWindow, Tray, Menu, Notification, ipcMain, screen } = require('electron');
const path = require('path');

/**
 * @description: 创建主窗口
 * @author: 李永强
 * @return {BrowserWindow}: 主窗口
 * @datetime: 2023-03-01 15:53:35
 */
// function createMainWindow() {
//     const win = new BrowserWindow({
//         width: 800,
//         height: 600,
//         webPreferences: {
//             webviewTag: true,
//             preload: './preload.js',
//         },
//     });
//     win.loadURL('http://localhost:7000/');
//     win.hide();
//     win.on('close', (event) => {
//         event.preventDefault();
//         win.hide();
//     });
//     return win;
// }

const W_WIDTH = 400;
const W_HEIGHT = 300;

/**
 * @description: 创建复制功能窗口
 * @author: 李永强
 * @return {BrowserWindow}: 复制功能窗口
 * @datetime: 2023-03-01 15:53:35
 */
function createCopyWindow() {
    const SCREEN_WIDTH = parseInt(screen.getPrimaryDisplay().workAreaSize.width);
    const win = new BrowserWindow({
        width: W_WIDTH,
        height: W_HEIGHT,
        frame: false,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    win.setPosition(SCREEN_WIDTH - 1, 100);
    win.setAlwaysOnTop(true);
    win.setSkipTaskbar(true);
    win.loadFile('./copy/index.html');
    return win;
}

/**
 * @description: 设置菜单栏
 * @author: 李永强
 * @datetime: 2023-03-01 16:46:58
 */
function setMenu(params) {
    Menu.setApplicationMenu(null); //取消菜单栏
}

/**
 * @description: 设置托盘
 * @author: 李永强
 * @datetime: 2023-03-01 15:53:50
 */
function createTray(win) {
    const tray = new Tray('./public/icons/icon.png');
    tray.setToolTip('Miguu');
    // 载入托盘菜单
    tray.setContextMenu(
        Menu.buildFromTemplate([
            {
                label: '退出',
                click: () => {
                    win.destroy();
                },
            },
        ])
    );
    tray.on('click', () => {
        win.show();
    });
}

/**
 * @description: 提醒喝水
 * @author: 李永强
 * @datetime: 2023-03-01 15:54:04
 */
function setNotification() {
    new Notification({ title: '💧💧', body: '接点水喝吧！💧💧' }).show();
    setInterval(() => {
        new Notification({ title: '💧💧', body: '接点水喝吧！💧💧' }).show();
    }, 1000 * 60 * 30);
}

/**
 * @description:
 * @author: 李永强
 * @datetime: 2023-03-01 16:00:34
 */
function setCommunication() {
    const SCREEN_WIDTH = parseInt(screen.getPrimaryDisplay().workAreaSize.width);
    const maxPositionX = SCREEN_WIDTH - 1;
    const minPositionX = SCREEN_WIDTH - W_WIDTH + 1;
    let moveAnimation = null;

    const comunications = {
        slideOut(event) {
            moveAnimation && clearInterval(moveAnimation);
            const webContents = event.sender;
            const win = BrowserWindow.fromWebContents(webContents);
            let [x, y] = win.getPosition();
            moveAnimation = setInterval(() => {
                x -= parseInt((x - minPositionX) / 50) || 1;
                win.setBounds({
                    width: W_WIDTH,
                    height: W_HEIGHT,
                    x: x,
                    y: y,
                });
                if (x <= minPositionX) {
                    win.setBounds({
                        width: W_WIDTH,
                        height: W_HEIGHT,
                        x: minPositionX,
                        y: y,
                    });
                    clearInterval(moveAnimation);
                    moveAnimation = null;
                }
            });
        },
        slideIn(event) {
            moveAnimation && clearInterval(moveAnimation);
            const webContents = event.sender;
            const win = BrowserWindow.fromWebContents(webContents);
            let [x, y] = win.getPosition();
            setTimeout(() => {
                moveAnimation = setInterval(() => {
                    x += parseInt((maxPositionX - x) / 50) || 1;
                    win.setBounds({
                        width: W_WIDTH,
                        height: W_HEIGHT,
                        x: x,
                        y: y,
                    });
                    if (x >= maxPositionX) {
                        win.setBounds({
                            width: W_WIDTH,
                            height: W_HEIGHT,
                            x: maxPositionX,
                            y: y,
                        });
                        clearInterval(moveAnimation);
                        moveAnimation = null;
                    }
                });
            }, 500);
        },
    };
    Object.entries(comunications).forEach(([name, callback]) => typeof callback == 'function' && ipcMain.on(name, callback));
    // ipcMain.on('set-title', (event, title) => {
    //     const webContents = event.sender
    //     const win = BrowserWindow.fromWebContents(webContents)
    //     win.setTitle(title)
    //   })
}

// 初始化
app.on('ready', () => {
    // const mainWin = createMainWindow();
    const copyWin = createCopyWindow();
    setMenu();
    createTray(copyWin);
    setCommunication();
    setNotification();
});
