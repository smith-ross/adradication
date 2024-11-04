import { ReactNode, useEffect, useMemo, useState } from "react";
import Adradication from "../../../../game/core/Adradication";
import { apiGet } from "../../../../util/FetchUtil";
import { getFromStorage } from "../../../../util/StorageUtil";
import GameView from "../../GameComponents/GameView";
import PageView from "../../PageView/PageView";
import LoginPage from "../LoginPage/LoginPage";
import RegisterPage from "../RegisterPage/RegisterPage";
import { GameAuthContextProvider } from "../../../context/GameAuthContext";
import {
  AlertsContextProvider,
  useAlertsContext,
} from "../../../context/AlertsContext";
import "./LoginController.scss";

const LoginController = () => {
  const [isLoaded, setLoaded] = useState(false);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const { addAlert } = useAlertsContext();

  useEffect(() => {
    getFromStorage("authToken").then((authToken) => {
      if (!authToken) {
        setAlreadyLoggedIn(false);
        setLoaded(true);
        return;
      }
      apiGet("/auth/currentUser", true)
        .then((response) => {
          setAlreadyLoggedIn(response.status === 200);
          setLoaded(true);
        })
        .catch((reason: Error) => {
          addAlert({
            type: "warn",
            content:
              "Failed to automatically log in, please try logging in manually. If the issue persists, try a different website.",
          });
          setLoaded(true);
        });
    });
  }, []);

  return (
    <GameAuthContextProvider value={{ setLoggedIn: setAlreadyLoggedIn }}>
      {isLoaded ? (
        alreadyLoggedIn ? (
          <GameView game={Adradication.getGame()} />
        ) : (
          <>
            <PageView
              pages={{
                login: LoginPage,
                register: RegisterPage,
              }}
              startingPage="login"
            />
            <div className="adblocker-warning">
              Please disable all <b>AdBlock</b> extensions before playing.
            </div>
          </>
        )
      ) : (
        <div className="loader">
          <>
            <img
              className="spinner"
              src={chrome.runtime.getURL("res/spinner.svg")}
            />
            <div>
              For the best experience, turn off any
              <b> AdBlock</b> extensions
            </div>
          </>
        </div>
      )}
    </GameAuthContextProvider>
  );
};

export default LoginController;
