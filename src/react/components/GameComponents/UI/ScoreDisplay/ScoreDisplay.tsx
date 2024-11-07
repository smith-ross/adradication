import "./ScoreDisplay.scss";
import { useGameAuthContext } from "../../../../context/GameAuthContext";

const ScoreDisplay = () => {
  const { score } = useGameAuthContext();
  return (
    <span className="score-display">
      Score: <span className="score">{score || 0}</span>
    </span>
  );
};

export default ScoreDisplay;
