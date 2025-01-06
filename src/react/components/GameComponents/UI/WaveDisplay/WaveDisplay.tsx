import "./WaveDisplay.scss";
import { useGameContext } from "../../../../context/GameContext";
import { useCallback, useEffect, useState } from "react";
import { useEventVariable } from "../../../../../util/GeneralUtil";

const WaveDisplay = () => {
  // const { currentWave, totalWaves } = useGameContext();
  const [currentWave, totalWaves] = useEventVariable("waveData", [1, 1]);
  return (
    <span className="wave-display">
      {currentWave === "upgrade" ? (
        "Select an Upgrade"
      ) : (
        <>
          Wave: <span className="wave">{currentWave || 1}</span>/
          {totalWaves || 1}
        </>
      )}
    </span>
  );
};

export default WaveDisplay;
