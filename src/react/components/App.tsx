import { AlertsContextProvider } from "../context/AlertsContext";
import LoginController from "./UserAuth/LoginController/LoginController";

const App = () => {
  return (
    <AlertsContextProvider>
      <LoginController />
    </AlertsContextProvider>
  );
};
export default App;
