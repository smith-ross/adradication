import "./EmbeddedApp.scss";
import FloatingWindow from "./FloatingWindow/FloatingWindow";
import App from "./App";
import { useChromeStorage } from "../../util/StorageUtil";
import FakeAdContainer from "./GameComponents/UI/FakeAd/FakeAdContainer";
import FakeAd from "./GameComponents/UI/FakeAd/FakeAd";

const EmbeddedApp = () => {
  const [gameEnabled, isLoaded] = useChromeStorage("GameEnabled", 2, false);
  const show = gameEnabled === 2 && isLoaded;
  return (
    <div id="embedded-tracker-app">
      {show && (
        <>
          <FloatingWindow id="game" title="Adradication" draggable={true}>
            <App />
          </FloatingWindow>
          <FakeAdContainer>
            <FakeAd />
          </FakeAdContainer>
        </>
      )}
    </div>
  );
};
export default EmbeddedApp;
