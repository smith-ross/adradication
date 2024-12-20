import { apiPost } from "../util/FetchUtil";
import {
  deleteStorage,
  getFromStorage,
  transformStorage,
} from "../util/StorageUtil";
import { getTrackerURLs } from "./TrackerUrls";

let pageCount = 0;

interface TrackedEnemy {
  origin: number;
}

getFromStorage("GameEnabled").then((value) => {
  if (value === 1) {
    chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    chrome.action.setBadgeText({ text: "OFF" });
  }
  const onUpdate = (changes: {
    [key: string]: chrome.storage.StorageChange;
  }) => {
    if (Object.keys(changes).includes("GameEnabled")) {
      if (changes["GameEnabled"].newValue === 1) {
        chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
        chrome.action.setBadgeText({ text: "OFF" });
      } else {
        chrome.action.setBadgeBackgroundColor({ color: [0, 255, 0, 255] });
        chrome.action.setBadgeText({ text: "" });
      }
    }
  };
  chrome.storage.onChanged.addListener(onUpdate);
});

const onContentMessage = (
  msg: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  const url = sender.tab?.url;
  switch (msg.text) {
    case "GET_PAGE_COUNT":
      sendResponse({ pageCount: pageCount });
      break;

    case "GET_TAB_ID":
      sendResponse({ tab: sender.tab?.id });
      break;

    case "REPORT_RESULT":
      getFromStorage(`pageResult-${sender.tab?.id}-${url}`).then((value) => {
        const result: string =
          msg.value || value || (msg.monsterCount === 0 ? "win" : "flee");

        if (result !== "flee") {
          chrome.tabs.sendMessage(sender.tab?.id || 0, {
            text: "UPDATE_WIN_STATE",
            value: result,
            url: sender.tab?.url,
          });
        }
        deleteStorage(`pageResult-${sender.tab?.id}-${url}`);
        apiPost("/battle/reportResult", true, {
          body: {
            url: url || "",
            result: result,
            score: msg.score,
          },
        });
      });
      break;

    case "PAGE_UNLOADED":
      pageCount++;
      deleteStorage(`pageWaves-${sender.tab?.id}`);
      if (msg.noResult) return;
      onContentMessage(
        {
          text: "REPORT_RESULT",
          monsterCount: msg.monsterCount,
          score: msg.score,
        },
        sender,
        sendResponse
      );
      // getFromStorage(`pageResult-${sender.tab?.id}-${url}`).then((value) => {
      //   const result: string =
      //     value || (msg.monsterCount === 0 ? "win" : "flee");
      //   deleteStorage(`pageResult-${sender.tab?.id}-${url}`);
      //   apiPost("/battle/reportResult", true, {
      //     body: {
      //       url: url || "",
      //       result: result,
      //       score: msg.score,
      //     },
      //   }).then(() => console.log("Sent result!"));
      // });
      break;
  }
};

chrome.runtime.onMessage.addListener(onContentMessage);

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
        if (activeTab && activeTab.id && activeTab.id === requestInfo.tabId) {
          const preProcessedString = requestInfo.url
            .replace(/^http(.*):\/\//, "")
            .replace(/^ww[w0-9]*\./, "");
          const processedString = preProcessedString.slice(
            0,
            preProcessedString.indexOf("/")
          );
          if (
            !processedString.includes("adradication") &&
            (getTrackerURLs()[processedString] ||
              requestInfo.url.includes("ads/") ||
              requestInfo.url.includes("track"))
          ) {
            console.log("DETECTED:", processedString, requestInfo.url);
            transformStorage({
              key: `TrackerCounter-${activeTab.id}`,
              modifierFn: (originalValue) => {
                console.log(requestInfo.requestHeaders);
                return [
                  ...((originalValue || []) as TrackedEnemy[]),
                  {
                    url:
                      processedString ||
                      preProcessedString ||
                      requestInfo.url ||
                      "<no url>",
                    origin: pageCount,
                  },
                ];
              },
            });
          }

          // for (let tracker of getTrackerURLs()) {
          //   if (requestInfo.url.includes(tracker)) {
          //     console.log("DETECTED:", tracker, requestInfo.url);
          //     transformStorage({
          //       key: `TrackerCounter-${activeTab.id}`,
          //       modifierFn: (originalValue) => {
          //         console.log(requestInfo.requestHeaders);
          //         return [
          //           ...((originalValue || []) as TrackedEnemy[]),
          //           {
          //             origin: pageCount,
          //           },
          //         ];
          //       },
          //     });
          //     break;
          //   }
          // }
        }
      }
    );
  },
  { urls: ["<all_urls>"] }
);

export default {};
