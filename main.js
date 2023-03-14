const { app, shell, Tray, Menu, Notification, powerMonitor } = require('electron');
const fs = require('fs');
const path = require('path');

// 定义变量
const appName = 'DrinkWater';
let tray = null;
let config = {};
let nextTime = 0;
let timeoutId = null;
let isPaused = false;
let dayWaterCount = 0;

// 获取配置文件
function getConfig(callback) {
    fs.readFile(path.resolve(__dirname, './setting.json'), (err, data) => {
        if (err) app.quit();
        config = JSON.parse(data.toString());
        callback && callback();
    });
}

// 写入配置文件
function updateConfig() {
    fs.writeFile(path.resolve(__dirname, './setting.json'), JSON.stringify(config), { flag: 'w' }, (err) => {
        err && console.error(err);
    });
}

// 更新托盘标题
function updateTrayTitle() {
    tray.setToolTip(`---DrinkWarter---\n提醒间隔：${config.timeSpan}分钟\n下次提醒：${isPaused ? '已暂停' : new Date(nextTime).toString().slice(16, 21)}\n今日喝水：${config.dayWaterCount}`);
}

// 修改开机是否启动
function changeOpenAtLogin() {
    const isOpenAtLogin = app.getLoginItemSettings().openAtLogin;
    app.setLoginItemSettings({
        openAtLogin: !isOpenAtLogin,
        path: process.execPath,
    });
}

// 今日喝水加一
function dayWaterAdd() {
    config.dayWaterCount++;
    updateTrayTitle();
    updateConfig();
}

// 息屏暂停提醒
function setPauseOnScreenClosed(pause) {
    config.pauseOnScreenClosed = pause;
    updateConfig();
}

// 暂停提醒
function pauseNotify(pause) {
    isPaused = pause;
    if (pause) {
        timeoutId && clearTimeout(timeoutId);
        timeoutId = null;
    } else {
        startTime();
    }
    updateTrayTitle();
}

// 打开浏览器详情页面
function openInfoPage() {
    shell.openExternal('https://github.com/cosy247/DrinkWater#%E5%85%B3%E4%BA%8E%E5%8F%8D%E9%A6%88');
}

// 定义托盘
function initTray() {
    const isOpenAtLogin = app.getLoginItemSettings().openAtLogin;
    tray = new Tray(path.resolve(__dirname, './imgs/icon.png'));
    tray.setContextMenu(
        Menu.buildFromTemplate([
            { label: '时间间隔', icon: path.resolve(__dirname, './imgs/time.png'), enabled: false },
            {
                label: '30分钟',
                type: 'radio',
                click() {
                    startTime(30);
                },
                checked: config.timeSpan == 30,
            },
            {
                label: '35分钟',
                type: 'radio',
                click() {
                    startTime(35);
                },
                checked: config.timeSpan == 35,
            },
            {
                label: '40分钟',
                type: 'radio',
                click() {
                    startTime(40);
                },
                checked: config.timeSpan == 40,
            },
            {
                label: '45分钟',
                type: 'radio',
                click() {
                    startTime(45);
                },
                checked: config.timeSpan == 45,
            },
            {
                label: '50分钟',
                type: 'radio',
                click() {
                    startTime(50);
                },
                checked: config.timeSpan == 50,
            },
            { type: 'separator' },
            { label: '设置', icon: path.resolve(__dirname, './imgs/setting.png'), enabled: false },
            { label: '息屏暂停', type: 'checkbox', checked: false, click: setPauseOnScreenClosed },
            { label: '暂停提醒', type: 'checkbox', checked: false, click: pauseNotify },
            { label: '开机启动', type: 'checkbox', checked: isOpenAtLogin, click: changeOpenAtLogin },
            { type: 'separator' },
            { label: '喝水加一', icon: path.resolve(__dirname, './imgs/water.png'), click: dayWaterAdd },
            { type: 'separator' },
            { label: '关于&反馈', icon: path.resolve(__dirname, './imgs/info.png'), click: openInfoPage },
            { label: '退出', icon: path.resolve(__dirname, './imgs/out.png'), role: 'quit' },
        ])
    );
}

// 初始化喝水计数
function initDayWaterCount() {
    const today = new Date().toLocaleDateString();
    if (today !== config.lastDate) {
        config.lastDate = today;
        config.dayWaterCount = 0;
        updateConfig();
    }
}

// 设置循环计时流程
function startTime(time) {
    if (time == config.timeSpan) return;

    // 改变配置文件
    config.timeSpan = time || config.timeSpan;
    updateConfig();

    // 获取下一次时间并更新标题
    nextTime = new Date().getTime() + config.timeSpan * 60 * 1000;
    updateTrayTitle();

    // 开始计时
    timeoutId && clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        timeoutId = null;
        new Notification({ body: `喝点水吧！${['🍸', '🥛', '🍹', '🥤', '🧋'][Math.floor(Math.random() * 5)].repeat(2)}` }).show();
        startTime();
    }, 1000 * 60 * config.timeSpan);
}

// 监听屏幕状态
function listenerScreen() {
    powerMonitor.on('suspend', () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    });
    powerMonitor.on('resume', () => {
        timeoutId || startTime();
    });
    powerMonitor.on('lock-screen', () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    });
    powerMonitor.on('unlock-screen', () => {
        timeoutId || startTime();
    });
}

// 初始化，限制只可以开启一个程序
if (app.requestSingleInstanceLock({ myKey: 'myValue' })) {
    app.setAppUserModelId(appName);
    app.on('ready', () => {
        getConfig(() => {
            initTray();
            initDayWaterCount();
            startTime();
        });
        new Notification({ body: '启动成功！😎😎' }).show();
    });
} else {
    app.quit();
}
