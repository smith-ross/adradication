import { transformStorage } from "../util/StorageUtil";
import TrackerURLs from "./TrackerUrls";

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
    }
  },
  { urls: ["<all_urls>"] }
);

export default {};
