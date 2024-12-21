import { classNames } from "../../../../../util/ClassUtil";
import "./LeaderboardEntry.scss";

interface EntryProps {
  username: string;
  score: number;
  position: number;
  small?: boolean;
  playerEntry?: boolean;
}

const commaNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const LeaderboardEntry = ({
  username,
  score,
  position,
  small,
  playerEntry,
}: EntryProps) => {
  return (
    <li
      className={classNames([
        "adradication-leaderboard-entry",
        small ? "entry-small" : false,
      ])}
    >
      <span className="leaderboard-num">{position + 1}</span>
      <span className="leaderboard-card">
        <img
          className="leaderboard-icon"
          src={chrome.runtime.getURL("res/icons/128.png")}
        />
        <span
          className={classNames([
            "leaderboard-username",
            playerEntry ? "leaderboard-player" : false,
          ])}
        >
          {username}
        </span>
        <span className="leaderboard-score">
          <span className="leaderboard-score-label">Score: </span>
          <span
            className={classNames([
              "leaderboard-score-literal",
              score > 1000000 ? "leaderboard-score-large" : false,
            ])}
          >
            {commaNumber(score)}
          </span>
        </span>
      </span>
    </li>
  );
};

export default LeaderboardEntry;
