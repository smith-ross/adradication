import "./EmbeddedApp.scss";
import FloatingWindow from "./FloatingWindow/FloatingWindow";
import App from "./App";

const EmbeddedApp = () => {
  return (
    <div id="embedded-tracker-app">
      <FloatingWindow id="game" title="Adradication" draggable={true}>
        <App />
      </FloatingWindow>
    </div>
  );
};
export default EmbeddedApp;
