import { createRoot } from "react-dom/client";
import PopUp from "./components/PopUp";

const root = createRoot(
  document.getElementById("adradication-root") as HTMLElement
);
root.render(<PopUp />);
