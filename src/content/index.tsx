import React from "react";
import { createRoot } from "react-dom/client";
import EmbeddedApp from "../react/components/EmbeddedApp";

const body = document.querySelector("body");
const appHolder = document.createElement("div");

appHolder.id = "react-root";

if (body) {
  body.append(appHolder);
}

const root = createRoot(document.getElementById("react-root") as HTMLElement);

root.render(<EmbeddedApp />);

export default {};
