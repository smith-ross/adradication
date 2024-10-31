import Adradication from "../../game/core/Adradication";
import GameView from "./GameComponents/GameView";
import TrackerCounter from "./TrackerCounter";

const App = () => {
  return <GameView game={Adradication.getGame()} />;
};
export default App;
