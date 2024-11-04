import { ReactNode, useEffect, useMemo, useState } from "react";
import Adradication from "../../../../game/core/Adradication";
import { apiGet } from "../../../../util/FetchUtil";
import { getFromStorage } from "../../../../util/StorageUtil";
import GameView from "../../GameComponents/GameView";
import PageView from "../../PageView/PageView";
import LoginPage from "../LoginPage/LoginPage";
import RegisterPage from "../RegisterPage/RegisterPage";
import { GameAuthContextProvider } from "../../../context/GameAuthContext";
import { AlertsContextProvider } from "../../../context/AlertsContext";
import "./LoginController.scss";

const LoginController = () => {
  const [isLoaded, setLoaded] = useState(false);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const [tickAmount, setTicks] = useState(1);
  const tickString = useMemo(() => ".".repeat(tickAmount), [tickAmount]);

  useEffect(() => {
    getFromStorage("authToken").then((authToken) => {
      if (!authToken) {
        setAlreadyLoggedIn(false);
        setLoaded(true);
        return;
      }
      apiGet("/auth/currentUser", true).then((response) => {
        setAlreadyLoggedIn(response.status === 200);
        setLoaded(true);
      });
    });
  }, []);

  useEffect(() => {
    if (isLoaded) return;
    setTimeout(() => {
      if (isLoaded) return;
      setTicks(tickAmount === 3 ? 0 : tickAmount + 1);
    }, 100);
  }, [tickAmount]);

  return (
    <AlertsContextProvider>
      <GameAuthContextProvider value={{ setLoggedIn: setAlreadyLoggedIn }}>
        {isLoaded ? (
          alreadyLoggedIn ? (
            <GameView game={Adradication.getGame()} />
          ) : (
            <PageView
              pages={{
                login: LoginPage,
                register: RegisterPage,
              }}
              startingPage="login"
            />
          )
        ) : (
          <div className="loader">
            <>
              Loading{tickString}
              <div>
                For the best experience, turn off any
                <b> AdBlock</b> extensions
              </div>
            </>
          </div>
        )}
      </GameAuthContextProvider>
    </AlertsContextProvider>
  );
};

export default LoginController;
