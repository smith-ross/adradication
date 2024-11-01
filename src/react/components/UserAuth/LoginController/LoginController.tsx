import { useEffect, useState } from "react";
import Adradication from "../../../../game/core/Adradication";
import { apiGet } from "../../../../util/FetchUtil";
import { getFromStorage } from "../../../../util/StorageUtil";
import GameView from "../../GameComponents/GameView";
import PageView from "../../PageView/PageView";
import LoginPage from "../LoginPage/LoginPage";
import RegisterPage from "../RegisterPage/RegisterPage";

const LoginController = () => {
  const [isLoaded, setLoaded] = useState(false);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  useEffect(() => {
    getFromStorage("authToken").then((authToken) => {
      if (!authToken) {
        setAlreadyLoggedIn(false);
        setLoaded(true);
        return;
      }
      apiGet("/auth/currentUser").then((response) => {
        setAlreadyLoggedIn(response.status === 200);
        setLoaded(true);
      });
    });
  }, []);

  return (
    <>
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
            setLoggedIn={(value) => setAlreadyLoggedIn(value)}
          />
        )
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

export default LoginController;
