import { deleteStorage, transformStorage } from "../util/StorageUtil";
import { getTrackerURLs } from "./TrackerUrls";

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.text == "getTabId") {
    sendResponse({ tab: sender.tab?.id });
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
          // if (
          //   getTrackerURLs().some((trackerRegex) => {
          //     return trackerRegex.test(requestInfo.url);
          //   })
          // ) {
          //   console.log("DETECTED:", requestInfo.url);

          // }
        }
      }
    );
  },
  { urls: ["<all_urls>"] }
);

export default {};
