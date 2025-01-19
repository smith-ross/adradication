import { PageResult } from "../game/objects/player/Player";
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
    chrome.action.setBadgeTextColor({ color: [255, 255, 255, 255] });
    chrome.action.setBadgeText({ text: "off" });
  }
  const onUpdate = (changes: {
    [key: string]: chrome.storage.StorageChange;
  }) => {
    if (Object.keys(changes).includes("GameEnabled")) {
      if (changes["GameEnabled"].newValue === 1) {
        chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
        chrome.action.setBadgeTextColor({ color: [255, 255, 255, 255] });
        chrome.action.setBadgeText({ text: "off" });
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
        const rawResult: PageResult = msg.value || value;

        const isFlee =
          msg.monsterCount === 0
            ? rawResult.type === "flee"
              ? "win"
              : "flee"
            : rawResult.type;

        rawResult.type = isFlee;
        const hitter = rawResult.defeatedBy || "";
        const result = rawResult.type;
        getFromStorage(`TrackerCounter-${sender.tab?.id}`).then((trackers) => {
          const count: { [k: string]: number } = {};
          (trackers as { url: string; origin: number }[]).forEach(
            ({ url, origin }) => {
              if (count[url] === undefined) count[url] = 0;
              count[url] += 1;
            }
          );
          const max = ["", 0];
          Object.keys(count).forEach((key) => {
            const value = count[key];
            if (value > max[1]) {
              max[0] = key;
              max[1] = value;
            }
          });
          if (isFlee !== "flee") {
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
              defeatedBy: hitter,
              upgrades: rawResult.upgrades,
              mostCommonTracker: max[0],
            },
          }).then(() => {
            if (!sender.tab) return;
            chrome.tabs.sendMessage(sender.tab?.id || 0, {
              text: "LEADERBOARD_LOADED",
            });
          });
        });
      });
      sendResponse({});
      break;

    case "PAGE_UNLOADED":
      pageCount++;
      // deleteStorage(`pageWaves-${sender.tab?.id}`);
      if (msg.noResult) return;
      onContentMessage(
        {
          text: "REPORT_RESULT",
          monsterCount: msg.monsterCount,
          score: msg.score,
          value: msg.value,
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
  // deleteStorage(`pageWaves-${tabId}`);
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
