import { transformStorage } from "../util/StorageUtil";
import TrackerURLs from "./TrackerUrls";

chrome.webNavigation.onCommitted.addListener(() => {
  transformStorage({
    key: "TrackerCounter",
    modifierFn: (originalValue) => {
      return 0;
    },
  });
});

chrome.webRequest.onBeforeRequest.addListener(
  (requestInfo) => {
    if (
      TrackerURLs.some((trackerRegex) => {
        return trackerRegex.test(requestInfo.url);
      })
    ) {
      console.log("DETECTED:", requestInfo.url);
      transformStorage({
        key: "TrackerCounter",
        modifierFn: (originalValue) => {
          return (originalValue as number) + 1;
        },
      });
      try {
        chrome.tabs.getCurrent().then((tab) => {
          if (!tab || !tab.id) return;
          chrome.tabs.sendMessage(tab.id, {
            eventType: "SpawnMonster",
          });
        });
      } catch {
        console.warn("Game not initialized yet - cannot send message");
      }
    }
  },
  { urls: ["<all_urls>"] }
);

export default {};
