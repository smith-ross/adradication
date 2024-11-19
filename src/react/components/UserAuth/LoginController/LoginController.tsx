import { ReactNode, useEffect, useMemo, useState } from "react";
import Adradication from "../../../../game/core/Adradication";
import { apiGet } from "../../../../util/FetchUtil";
import { getFromStorage } from "../../../../util/StorageUtil";
import GameView from "../../GameComponents/GameView";
import PageView from "../../PageView/PageView";
import LoginPage from "../LoginPage/LoginPage";
import RegisterPage from "../RegisterPage/RegisterPage";
import { GameContextProvider } from "../../../context/GameContext";
import {
  AlertsContextProvider,
  useAlertsContext,
} from "../../../context/AlertsContext";
import "./LoginController.scss";
import Loader from "../../Loader/Loader";

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
          setAlreadyLoggedIn(false);
          setLoaded(true);
        });
    });
  }, []);

  return (
    <GameContextProvider value={{ setLoggedIn: setAlreadyLoggedIn }}>
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
        <Loader />
      )}
    </GameContextProvider>
  );
};

export default LoginController;
