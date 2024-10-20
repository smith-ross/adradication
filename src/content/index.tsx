import React from "react";
import { createRoot } from "react-dom/client";
import EmbeddedApp from "../react/components/EmbeddedApp";
import { transformStorageOverwrite } from "../util/StorageUtil";

window.addEventListener("beforeunload", () => {
  transformStorageOverwrite({
    key: "TrackerCounter",
    modifierFn: (originalValue) => {
      return 0;
    },
  });
});

const body = document.querySelector("body");
const appHolder = document.createElement("div");

appHolder.id = "react-root";

if (body) {
  body.append(appHolder);
}

const root = createRoot(document.getElementById("react-root") as HTMLElement);

root.render(<EmbeddedApp />);

export default {};
