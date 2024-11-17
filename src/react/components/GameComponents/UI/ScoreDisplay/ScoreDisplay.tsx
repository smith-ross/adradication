import "./ScoreDisplay.scss";
import { useGameContext } from "../../../../context/GameContext";

const ScoreDisplay = () => {
  const { score } = useGameContext();
  return (
    <span className="score-display">
      Score: <span className="score">{score || 0}</span>
    </span>
  );
};

export default ScoreDisplay;
