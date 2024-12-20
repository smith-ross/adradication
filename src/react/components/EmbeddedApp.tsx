import "./EmbeddedApp.scss";
import FloatingWindow from "./FloatingWindow/FloatingWindow";
import App from "./App";
import { useChromeStorage } from "../../util/StorageUtil";

const EmbeddedApp = () => {
  const gameEnabled = useChromeStorage("GameEnabled", 2, false);
  console.log("RERENDER", gameEnabled);
  return (
    <div id="embedded-tracker-app">
      {gameEnabled === 2 && (
        <FloatingWindow id="game" title="Adradication" draggable={true}>
          <App />
        </FloatingWindow>
      )}
    </div>
  );
};
export default EmbeddedApp;
