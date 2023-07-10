<script setup lang="ts">
import { ref } from "vue";

let id = ref(0);
let enable = ref(false);
let interval = ref(1);

async function getState() {
  await getTabId();
  await getAlarm();
  await refreshBadge();
}

getState();

async function getTabId() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  typeof tab.id === "number" ? (id.value = tab.id) : (id.value = 0);
}

async function getAlarm() {
  await chrome.alarms.get(id.value.toString(), function (alarm) {
    if (alarm != undefined) {
      enable.value = true;
      typeof alarm.periodInMinutes === "number"
        ? (interval.value = alarm.periodInMinutes)
        : (interval.value = 1);
    }
  });
}

function modifyEvent() {
  chrome.runtime.sendMessage(
    { id: id.value, enable: enable.value, interval: interval.value },
    function (_) {}
  );
  refreshBadge();
}

// BrowserAction内で変更時にバッチの値も変更する
// TODO: background.tsの部分といい感じに統合したい
async function refreshBadge() {
  await chrome.action.setBadgeBackgroundColor({ color: [0, 0, 0, 0] });
  let text = enable.value ? interval.value.toString() : "";
  await chrome.action.setBadgeText({ text: text, tabId: id.value });
}
</script>

<template>
  <v-layout>
    <v-app-bar title="Tab Reloader"></v-app-bar>
    <v-main style="min-width: 300px">
      <!-- v-modelと@changeの併用は良くないと言っている人もいるので後で確認 https://qiita.com/simezi9/items/c27d69f17d2d08722b3a#v-model%E3%81%A8change%E3%82%92%E4%B8%A1%E6%96%B9%E6%9B%B8%E3%81%8F -->
      <v-switch
        label="自動更新"
        color="success"
        v-model="enable"
        @change="modifyEvent"
      ></v-switch>
      <div v-if="enable">
        <v-label>更新間隔: {{ interval }}[分]</v-label>
        <v-slider
          :min="1"
          :max="10"
          :step="1"
          thumb-label
          v-model="interval"
          show-ticks="always"
          tick-size="4"
          @end="modifyEvent"
        ></v-slider>
      </div>
      <!--            for debug -->
      <!--            <p>tabId: {{ id }}</p>-->
      <!--            <p>enable: {{ enable }}</p>-->
      <!--            <p>interval: {{ interval }}</p>-->
    </v-main>
  </v-layout>
</template>

<style scoped></style>
