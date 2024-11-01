import "./LoginPage.scss";
import { PageProps } from "../../PageView/PageView";
import Button from "../../Button/Button";
import TextInput from "../../TextInput/TextInput";

const LoginPage = ({ changePage, setLoggedIn }: PageProps) => {
  return (
    <div id="login-page">
      <div className="login-card">
        <span className="login-page-header">Login</span>
        <TextInput
          className="login-field"
          name="username"
          placeholderText="Username"
        />
        <TextInput
          className="login-field"
          name="password"
          placeholderText="Password"
        />
        <span id="login-controls">
          <Button
            className="login-button"
            onClick={() => {
              console.log(setLoggedIn);
              setLoggedIn(true);
              console.log("Logged in");
            }}
            buttonType="primary"
          >
            Login
          </Button>
          <Button
            className="login-button"
            onClick={() => {
              changePage("register");
            }}
          >
            Register
          </Button>
        </span>
      </div>
    </div>
  );
};

export default LoginPage;
