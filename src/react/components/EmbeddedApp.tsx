import "./EmbeddedApp.scss";
import FloatingWindow from "./FloatingWindow";
import App from "./App";

const EmbeddedApp = () => {
  return (
    <div id="embedded-tracker-app">
      <FloatingWindow id="TestWindow" draggable={true}>
        <App />
      </FloatingWindow>
      <FloatingWindow id="TestWindow2" title="Test2" draggable={true}>
        <App />
      </FloatingWindow>
    </div>
  );
};
export default EmbeddedApp;
