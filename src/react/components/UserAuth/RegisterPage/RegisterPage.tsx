import "./RegisterPage.scss";
import { PageProps } from "../../PageView/PageView";
import Button from "../../Button/Button";
import TextInput from "../../TextInput/TextInput";
import { useCallback, useState } from "react";
import { apiPost } from "../../../../util/FetchUtil";

const RegisterPage = ({ changePage, setLoggedIn }: PageProps) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const registerAccount = useCallback(() => {
    apiPost("/auth/register", false, {
      body: {
        username: username,
        password: password,
        email: email,
      },
    }).then((response) => {
      console.log(response);
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
          >
            Login
          </Button>
          <Button
            className="register-button"
            buttonType="primary"
            onClick={registerAccount}
          >
            Register
          </Button>
        </span>
      </div>
    </div>
  );
};

export default RegisterPage;
