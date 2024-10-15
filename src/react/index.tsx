import { createRoot } from "react-dom/client";
import App from "./components/App";

const root = createRoot(document.getElementById("react-root") as HTMLElement);
root.render(<App />);
