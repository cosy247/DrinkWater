const { app, Tray, Menu, Notification } = require('electron');
const fs = require('fs')

// 定义变量
let tray = null;
let config = {};
let nextTime = 0;
let timeoutId = null;
let isPaused = false;

// 获取配置文件
function getConfig(callback) {
    fs.readFile('./setting.json', (err, data) => {
        if (err) app.quit();
        config = JSON.parse(data.toString());
        callback && callback();
    })
}

// 写入配置文件
function updateConfig() {
    fs.writeFile('./setting.json', JSON.stringify(config), { flag: 'w' }, (err) => {
        err && console.error(err);
    })
}

// 定义托盘
function initTray() {
    tray = new Tray('./imgs/icon.png');
    tray.setContextMenu(
        Menu.buildFromTemplate([
            { label: '⏰时间间隔', enabled: false },
            { label: '30分钟', type: 'radio', click() { startTime(30) }, checked: true },
            { label: '35分钟', type: 'radio', click() { startTime(35) } },
            { label: '40分钟', type: 'radio', click() { startTime(40) } },
            { label: '45分钟', type: 'radio', click() { startTime(45) } },
            { label: '50分钟', type: 'radio', click() { startTime(50) } },
            { type: 'separator' },
            { label: '🌀退出', role: 'quit' }
        ])
    )
}

// 设置循环计时流程
function startTime(time) {
    if (time == config.timeSpan) return;
    
    // 改变配置文件
    config.timeSpan = time || config.timeSpan;
    updateConfig();

    // 获取下一次时间并更新标题
    nextTime = new Date().getTime() + config.timeSpan * 60 * 1000;
    tray.setToolTip(`---DrinkWarter---\n提醒间隔：${config.timeSpan}分钟\n下次提醒：${new Date(nextTime).toString().slice(16, 21)}`);

    // 开始计时
    timeoutId && clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        timeoutId = null;
        new Notification({ title: '💧💧', body: '接点水喝吧！💧💧' }).show();
        startTime();
    }, 1000 * 60 * config.timeSpan);
}
    
// 初始化
app.on('ready', () => {
    initTray();
    getConfig(startTime);
});
