import { apiPost } from "../util/FetchUtil";
import {
  deleteStorage,
  getFromStorage,
  transformStorage,
} from "../util/StorageUtil";
import { getTrackerURLs } from "./TrackerUrls";

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  switch (msg.text) {
    case "GET_TAB_ID":
      sendResponse({ tab: sender.tab?.id });
      break;

    case "PAGE_UNLOADED":
      const url = sender.tab?.url;
      getFromStorage(`pageResult-${sender.tab?.id}-${url}`).then((value) => {
        const result: string =
          value || (msg.monsterCount === 0 ? "win" : "flee");
        deleteStorage(`pageResult-${sender.tab?.id}-${url}`);
        apiPost("/battle/reportResult", true, {
          body: {
            url: url || "",
            result: result,
          },
        }).then(() => console.log("Sent result!"));
      });
      break;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  deleteStorage(`TrackerCounter-${tabId}`);
  deleteStorage(`pageScore-${tabId}`);
  deleteStorage(`pageWaves-${tabId}`);
});

chrome.webRequest.onBeforeRequest.addListener(
  (requestInfo) => {
    chrome.tabs.query(
      { active: true, lastFocusedWindow: true, currentWindow: true },
      (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && activeTab.id) {
          for (let tracker of getTrackerURLs()) {
            if (requestInfo.url.includes(tracker)) {
              console.log("DETECTED:", tracker, requestInfo.url);
              transformStorage({
                key: `TrackerCounter-${activeTab.id}`,
                modifierFn: (originalValue) => {
                  return ((originalValue || 0) as number) + 1;
                },
              });
              break;
            }
          }
        }
      }
    );
  },
  { urls: ["<all_urls>"] }
);

export default {};
