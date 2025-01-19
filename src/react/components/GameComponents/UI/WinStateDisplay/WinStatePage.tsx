import { useCallback, useEffect, useState } from "react";
import { useEventVariable } from "../../../../../util/GeneralUtil";
import Button from "../../../Button/Button";
import LeaderboardPage from "../Leaderboard/LeaderboardPage";
import Logout from "../Logout/Logout";
import "./WinStatePage.scss";

interface WinStateProps {
  score?: number;
  message: string;
  spriteUrl: string;
  preloaded?: boolean;
}

const WinStatePage = ({
  message,
  score,
  spriteUrl,
  preloaded,
}: WinStateProps) => {
  const hasScore = !!(score && score > 0);
  const [isLeaderboard, setLeaderboard] = useState(false);
  const [isUpdated, setUpdated] = useState(preloaded || false);
  const leaderboardClick = useCallback(() => {
    setLeaderboard(true);
  }, [isLeaderboard]);

  return (
    <>
      {!isLeaderboard ? (
        <div className="adradication-win-state-container">
          <div className="win-state-sprite-container">
            <img className="win-state-sprite" src={spriteUrl} />
          </div>
          <div className="adradication-win-state">
            <span className="win-message">{message}</span>
            {hasScore && (
              <span className="win-score">
                Score: <span className="score-number">{score}</span>
              </span>
            )}
            <span className="win-instruction">
              Navigate to another page to continue playing!
            </span>
            {isUpdated ? (
              <Button onClick={leaderboardClick} buttonType="primary">
                Leaderboard
              </Button>
            ) : (
              <div>Leaderboard loading... </div>
            )}
          </div>
          <Logout />
        </div>
      ) : (
        <LeaderboardPage />
      )}
    </>
  );
};

export default WinStatePage;
