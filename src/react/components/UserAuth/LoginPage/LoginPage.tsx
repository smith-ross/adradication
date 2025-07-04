import "./LoginPage.scss";
import { PageProps } from "../../PageView/PageView";
import Button from "../../Button/Button";
import TextInput from "../../TextInput/TextInput";
import { useCallback, useState } from "react";
import { apiPost } from "../../../../util/FetchUtil";
import { deleteStorage, setStorage } from "../../../../util/StorageUtil";
import { useAlertsContext } from "../../../context/AlertsContext";
import { useGameContext } from "../../../context/GameContext";
import ClickableText from "../../ClickableText/ClickableText";

const LoginPage = ({ changePage }: PageProps) => {
  const { setLoggedIn } = useGameContext();
  const { addAlert, clearAlerts } = useAlertsContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const loginAccount = useCallback(() => {
    if (pending) return;
    setPending(true);
    apiPost("/auth/login", false, {
      body: {
        username: username,
        password: password,
      },
    })
      .then((response) => {
        switch (response.status) {
          case 200:
            response.json().then((json) => {
              setStorage("authToken", json.token).then(() => {
                setLoggedIn(true);
                clearAlerts();
              });
            });
            break;

          case 400:
          case 401:
          case 500:
            response.json().then((json) => {
              addAlert({ type: "error", content: json.error });
            });
            deleteStorage("authToken");
            break;
        }

        setPending(false);
      })
      .catch((error) => {
        addAlert({
          type: "error",
          content:
            "Failed to log in. If the issue persists, try a different website.",
        });
      });
  }, [password, username]);

  return (
    <div id="login-page">
      <div className="login-card">
        <span className="login-page-header">Login</span>
        <TextInput
          className="login-field"
          name="username"
          placeholderText="Username"
          onChange={(event) => setUsername(event.target.value)}
        />
        <TextInput
          className="login-field"
          name="password"
          typeOverride="password"
          placeholderText="Password"
          onChange={(event) => setPassword(event.target.value)}
          onEnter={() => loginAccount()}
        />
        <div className="login-page-register">
          Don't have an account?{" "}
          <ClickableText
            onClick={() => {
              changePage("register");
            }}
          >
            Register here
          </ClickableText>
        </div>
        <span id="login-controls">
          <Button
            className="login-button"
            onClick={loginAccount}
            buttonType="primary"
          >
            Login
          </Button>
        </span>
        <div className="login-page-register">
          <ClickableText
            onClick={() => {
              changePage("help");
            }}
          >
            What is this?
          </ClickableText>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
