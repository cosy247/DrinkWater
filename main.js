const { app, BrowserWindow, Tray, Menu, Notification, ipcMain, screen } = require('electron');
const path = require('path');

/**
 * @description: 设置托盘
 * @author: 李永强
 * @datetime: 2023-03-01 15:53:50
 */
function createTray() {
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

// 初始化
app.on('ready', () => {
    createTray();
    setNotification();
});
