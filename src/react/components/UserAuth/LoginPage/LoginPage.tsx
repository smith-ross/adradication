import "./LoginPage.scss";
import { PageProps } from "../../PageView/PageView";

const LoginPage = ({ changePage, setLoggedIn }: PageProps) => {
  return (
    <div id="login-page">
      Not Logged In
      <button
        onClick={() => {
          console.log(setLoggedIn);
          setLoggedIn(true);
          console.log("Logged in");
        }}
      >
        Login
      </button>
    </div>
  );
};

export default LoginPage;
