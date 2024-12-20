import "./EmbeddedApp.scss";
import FloatingWindow from "./FloatingWindow/FloatingWindow";
import App from "./App";
import { useChromeStorage } from "../../util/StorageUtil";

const EmbeddedApp = () => {
  const [gameEnabled, isLoaded] = useChromeStorage("GameEnabled", 2, false);
  const show = gameEnabled === 2 && isLoaded;
  return (
    <div id="embedded-tracker-app">
      {show && (
        <FloatingWindow id="game" title="Adradication" draggable={true}>
          <App />
        </FloatingWindow>
      )}
    </div>
  );
};
export default EmbeddedApp;
