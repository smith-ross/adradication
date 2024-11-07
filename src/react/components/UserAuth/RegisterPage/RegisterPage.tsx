import "./RegisterPage.scss";
import { PageProps } from "../../PageView/PageView";
import Button from "../../Button/Button";
import TextInput from "../../TextInput/TextInput";
import { useCallback, useState } from "react";
import { apiPost } from "../../../../util/FetchUtil";
import { useAlertsContext } from "../../../context/AlertsContext";

const RegisterPage = ({ changePage }: PageProps) => {
  const { addAlert } = useAlertsContext();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const registerAccount = useCallback(() => {
    setPending(true);
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
  }, [email, password, username]);

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
        <span id="register-controls">
          <Button
            className="register-button"
            onClick={() => {
              changePage("login");
            }}
            buttonType="secondary"
            disabled={pending}
          >
            Login
          </Button>
          <Button
            className="register-button"
            buttonType="primary"
            onClick={registerAccount}
            disabled={pending}
          >
            Register
          </Button>
        </span>
      </div>
    </div>
  );
};

export default RegisterPage;
