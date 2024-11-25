import React from "react";
import { createRoot } from "react-dom/client";
import EmbeddedApp from "../react/components/EmbeddedApp";
import {
  deleteStorage,
  transformStorage,
  transformStorageOverwrite,
} from "../util/StorageUtil";

const body = document.querySelector("body");
const appHolder = document.createElement("div");

chrome.runtime.sendMessage({ text: "GET_TAB_ID" }, (tabId) => {
  window.addEventListener("beforeunload", () => {
    transformStorageOverwrite({
      key: `TrackerCounter-${tabId.tab}`,
      modifierFn: (originalValue) => {
        return [];
      },
    });
    deleteStorage(`TrackerCounter-${tabId.tab}`);
  });
});

appHolder.id = "adradication-root";

if (body) {
  body.append(appHolder);
}

const root = createRoot(
  document.getElementById("adradication-root") as HTMLElement
);

root.render(<EmbeddedApp />);

export default {};
