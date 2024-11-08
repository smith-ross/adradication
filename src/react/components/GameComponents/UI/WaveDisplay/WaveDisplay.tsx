import "./WaveDisplay.scss";
import { useGameAuthContext } from "../../../../context/GameAuthContext";

const WaveDisplay = () => {
  const { currentWave, totalWaves } = useGameAuthContext();
  return (
    <span className="wave-display">
      Wave: <span className="wave">{currentWave || 1}</span>/{totalWaves || 1}
    </span>
  );
};

export default WaveDisplay;
