import { useCallback } from "react";
import {
  getFromStorage,
  setStorage,
  setStorageRaw,
  useChromeStorage,
} from "../../util/StorageUtil";
import { AlertsContextProvider } from "../context/AlertsContext";
import Button from "./Button/Button";
import LoginController from "./UserAuth/LoginController/LoginController";

const PopUp = () => {
  const gameVisible = useChromeStorage("GameEnabled", 2) as number;
  const gameEnabled = gameVisible === 2;

  const enableCallback = useCallback(() => {
    console.log(gameVisible);
    setStorageRaw("GameEnabled", gameVisible === 1 ? 2 : 1).then(() => {
      console.log(gameVisible);
      getFromStorage("GameEnabled").then((v) => console.log("NOW:", v));
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) chrome.tabs.reload(tab.id);
        });
      });
    });
  }, [gameVisible]);
  return (
    <AlertsContextProvider>
      <h3>Settings</h3>
      <Button
        onClick={enableCallback}
        buttonType={gameEnabled ? "secondary" : "primary"}
      >
        {gameEnabled ? "Disable" : "Enable"} Game
      </Button>
      <br />
      <i>This will refresh all tabs</i>
    </AlertsContextProvider>
  );
};
export default PopUp;
