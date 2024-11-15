import { apiPost } from "../util/FetchUtil";
import {
  deleteStorage,
  getFromStorage,
  transformStorage,
  transformStorageOverwrite,
} from "../util/StorageUtil";
import { getTrackerURLs } from "./TrackerUrls";

let pageCount = 0;

interface TrackedEnemy {
  origin: number;
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  switch (msg.text) {
    case "GET_PAGE_COUNT":
      sendResponse({ pageCount: pageCount });
      break;

    case "GET_TAB_ID":
      sendResponse({ tab: sender.tab?.id });
      break;

    case "PAGE_UNLOADED":
      pageCount++;
      const url = sender.tab?.url;
      deleteStorage(`pageWaves-${sender.tab?.id}`);
      getFromStorage(`pageResult-${sender.tab?.id}-${url}`).then((value) => {
        const result: string =
          value || (msg.monsterCount === 0 ? "win" : "flee");
        deleteStorage(`pageResult-${sender.tab?.id}-${url}`);
        apiPost("/battle/reportResult", true, {
          body: {
            url: url || "",
            result: result,
            score: msg.score,
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

chrome.webRequest.onBeforeSendHeaders.addListener(
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
                  console.log(requestInfo.requestHeaders);
                  return [
                    ...((originalValue || []) as TrackedEnemy[]),
                    {
                      origin: pageCount,
                    },
                  ];
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
