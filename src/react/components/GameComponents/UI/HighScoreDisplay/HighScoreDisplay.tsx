import "./HighScoreDisplay.scss";
import { useGameContext } from "../../../../context/GameContext";
import { useEffect, useState } from "react";
import { apiGet } from "../../../../../util/FetchUtil";

const HighScoreDisplay = () => {
  const [highScore, setHighScore] = useState(0);
  const { score } = useGameContext();

  useEffect(() => {
    apiGet("/battle/highScore", true)
      .then((res) => {
        res.json().then((json) => {
          setHighScore(json.highScore);
        });
      })
      .catch(() => {});
  }, []);

  return (
    <span className="high-score-display">
      High Score:{" "}
      <span className="high-score">
        {score > highScore ? score : highScore}
      </span>
    </span>
  );
};

export default HighScoreDisplay;
