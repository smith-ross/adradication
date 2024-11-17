import "./WaveDisplay.scss";
import { useGameContext } from "../../../../context/GameContext";

const WaveDisplay = () => {
  const { currentWave, totalWaves } = useGameContext();
  return (
    <span className="wave-display">
      Wave: <span className="wave">{currentWave || 1}</span>/{totalWaves || 1}
    </span>
  );
};

export default WaveDisplay;
