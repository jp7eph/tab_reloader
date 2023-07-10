chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
    console.log({ request });

    if (request.enable) {
        createAlarm(request.id, request.interval);
    } else {
        clearAlarm(request.id)
    }

    sendResponse({ result: "create success" });
})

function createAlarm(id: number, interval: number) {
    chrome.alarms.create(id.toString(), { periodInMinutes: interval })
}

function clearAlarm(id: number) {
    chrome.alarms.clear(id.toString())
}

// alarms発火時のCallback
chrome.alarms.onAlarm.addListener(function (alarm) {
    console.log('[reload]' + alarm.name + ' ' + Date());
    chrome.tabs.get(Number(alarm.name), function (tab) {
        // 更新対象のタブが存在しない場合はAlarmから削除
        if (tab == undefined) {
            clearAlarm(Number(alarm.name));
        }
    });
    chrome.tabs.reload(Number(alarm.name), { bypassCache: true });
});

// タブ切替時にバッジ設定
// TODO: App.vueの部分といい感じに統合したい
chrome.tabs.onActivated.addListener(function (_tabId) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, async function (tab) {
        let text = "";
        if (tab[0].id != undefined) {
            await chrome.alarms.get(tab[0].id.toString(), function (alarm) {
                if (alarm != undefined) {
                    text = typeof alarm.periodInMinutes === "number" ? alarm.periodInMinutes.toString() : ""
                }
            });
            // TODO: 共通化したい
            await chrome.action.setBadgeBackgroundColor({ color: [0, 0, 0, 0] });
            await chrome.action.setBadgeText({ tabId: tab[0].id, text: text });
        }
    });
});

// タブ更新時にバッジ設定
// TODO: App.vueの部分といい感じに統合したい
chrome.tabs.onUpdated.addListener(async function (_tabId, _changeInfo, tab) {
    let text = "";
    if (tab.id != undefined) {
        await chrome.alarms.get(tab.id.toString(), function (alarm) {
            if (alarm != undefined) {
                text = typeof alarm.periodInMinutes === "number" ? alarm.periodInMinutes.toString() : ""
            }
        });
        // TODO: 共通化したい
        await chrome.action.setBadgeBackgroundColor({ color: [0, 0, 0, 0] });
        await chrome.action.setBadgeText({ tabId: tab.id, text: text });
    }
});
