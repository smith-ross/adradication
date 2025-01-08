import "./RegisterPage.scss";
import { PageProps } from "../../PageView/PageView";
import Button from "../../Button/Button";
import TextInput from "../../TextInput/TextInput";
import { useCallback, useState } from "react";
import { apiPost } from "../../../../util/FetchUtil";
import { useAlertsContext } from "../../../context/AlertsContext";
import ClickableText from "../../ClickableText/ClickableText";
import { useGameContext } from "../../../context/GameContext";
import { deleteStorage, setStorage } from "../../../../util/StorageUtil";

const RegisterPage = ({ changePage }: PageProps) => {
  const { setLoggedIn } = useGameContext();
  const { addAlert, clearAlerts } = useAlertsContext();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const registerAccount = useCallback(() => {
    if (pending) return;
    setPending(true);
    if (confirmPassword !== password) {
      addAlert({ type: "error", content: "Passwords don't match." });
      setPending(false);
      return;
    }
    apiPost("/auth/register", false, {
      body: {
        username: username,
        password: password,
        email: email,
      },
    })
      .then((response) => {
        switch (response.status) {
          case 201:
            response.json().then((json) => {
              addAlert({ type: "success", content: json.message });
              loginAccount();
            });
            break;

          case 400:
          case 401:
          case 500:
            response.json().then((json) => {
              addAlert({ type: "error", content: json.error });
            });
            break;
        }

        setPending(false);
      })
      .catch((error) => {
        addAlert({
          type: "error",
          content:
            "Failed to register, If the issue persists, try a different website.",
        });
      });
  }, [email, password, username, confirmPassword]);

  return (
    <div id="register-page">
      <div className="register-card">
        <span className="register-page-header">Register</span>
        <TextInput
          className="register-field"
          name="email"
          placeholderText="Email"
          typeOverride="email"
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextInput
          className="register-field"
          name="username"
          placeholderText="Username"
          onChange={(event) => setUsername(event.target.value)}
        />
        <TextInput
          className="register-field"
          name="password"
          placeholderText="Password"
          typeOverride="password"
          onChange={(event) => setPassword(event.target.value)}
        />
        <TextInput
          className="register-field"
          name="password"
          placeholderText="Confirm Password"
          typeOverride="password"
          onChange={(event) => setConfirmPassword(event.target.value)}
          onEnter={() => {
            registerAccount();
          }}
        />

        <div className="register-page-login">
          Already have an account?{" "}
          <ClickableText
            onClick={() => {
              changePage("login");
            }}
          >
            Login here
          </ClickableText>
        </div>
        <span id="register-controls">
          <Button
            className="register-button"
            buttonType="primary"
            onClick={registerAccount}
            disabled={pending}
          >
            Register
          </Button>
        </span>
        <div className="register-page-login">
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

export default RegisterPage;
