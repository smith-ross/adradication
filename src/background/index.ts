import { transformStorage } from "../util/StorageUtil";
import TrackerURLs from "./TrackerUrls";

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.text == "getTabId") {
    sendResponse({ tab: sender.tab?.id });
  }
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    const headers = details.requestHeaders;

    headers?.push({
      name: "Referer",
      value: process.env.REACT_APP_SERVER_URL,
    });

    headers?.push({
      name: "Origin",
      value: process.env.REACT_APP_SERVER_URL,
    });
    return { requestHeaders: headers };
  },
  { urls: [process.env.REACT_APP_SERVER_URL + "/*"] },
  ["blocking", "requestHeaders", "extraHeaders"]
);

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove(`TrackerCounter-${tabId}`);
});

chrome.webRequest.onBeforeRequest.addListener(
  (requestInfo) => {
    chrome.tabs.query(
      { active: true, lastFocusedWindow: true, currentWindow: true },
      (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && activeTab.id) {
          if (
            TrackerURLs.some((trackerRegex) => {
              return trackerRegex.test(requestInfo.url);
            })
          ) {
            console.log("DETECTED:", requestInfo.url);
            transformStorage({
              key: `TrackerCounter-${activeTab.id}`,
              modifierFn: (originalValue) => {
                return ((originalValue || 0) as number) + 1;
              },
            });
          }
        }
      }
    );
  },
  { urls: ["<all_urls>"] }
);

export default {};
