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
  state: string;
  trackersFound?: number;
  mostCommonTracker?: string;
}

const WinStateField = ({ title, value }: { title: string; value: string }) => {
  return (
    <div className="win-state-field">
      <div className="win-state-field-head">{title}</div>
      <div className="win-state-field-body">{value}</div>
    </div>
  );
};

const WinStatePage = ({
  message,
  score,
  spriteUrl,
  preloaded,
  state,
  mostCommonTracker,
  trackersFound,
}: WinStateProps) => {
  const hasScore = !!(score && score > 0);
  const [isLeaderboard, setLeaderboard] = useState(false);
  const [isUpdated, setUpdated] = useState(preloaded || false);
  const leaderboardClick = useCallback(() => {
    setLeaderboard(true);
  }, [isLeaderboard]);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      switch (msg.text) {
        case "LEADERBOARD_LOADED":
          setUpdated(true);
          break;
      }
      return true;
    });
  }, []);

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
                {state === "win" ? (
                  <b className="score-mul"> (1.5x Win Multiplier)</b>
                ) : undefined}
              </span>
            )}
            {mostCommonTracker && mostCommonTracker !== "" ? (
              <WinStateField
                title="Most Common Tracker"
                value={mostCommonTracker}
              />
            ) : undefined}
            {trackersFound && trackersFound > 0 ? (
              <WinStateField
                title="No. of Unique Trackers"
                value={trackersFound.toString()}
              />
            ) : undefined}
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
