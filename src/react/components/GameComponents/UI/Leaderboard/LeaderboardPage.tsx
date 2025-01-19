import { useEffect, useState } from "react";
import { apiGet } from "../../../../../util/FetchUtil";
import HorizontalDivider from "../../../HorizontalDivider/HorizontalDivider";
import Logout from "../Logout/Logout";
import LeaderboardEntry from "./LeaderboardEntry";
import "./LeaderboardPage.scss";

interface LeaderboardEntry {
  username: string;
  score: number;
  index?: number;
}

const LeaderboardPage = () => {
  const [isLoaded, setLoaded] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState(
    [] as LeaderboardEntry[]
  );
  const [playerEntry, setPlayerEntry] = useState({} as LeaderboardEntry);
  const [nextEntry, setNextEntry] = useState({} as LeaderboardEntry);
  const [prevEntry, setPrevEntry] = useState({} as LeaderboardEntry);

  useEffect(() => {
    apiGet("/battle/leaderboard?amount=10", true)
      .then((response) => {
        response.json().then((json) => {
          setLeaderboardEntries(json.leaderboard);
          setPlayerEntry(json.playerPosition);
          setNextEntry(json.nextPosition);
          setPrevEntry(json.prevPosition);
          setLoaded(true);
        });
      })
      .catch();
  }, []);

  return (
    <>
      {isLoaded ? (
        <div className="adradication-leaderboard">
          <span className="adradication-page-header">Leaderboard</span>
          <br />
          <ul className="leaderboard-entries">
            {leaderboardEntries.map((entry, idx) => (
              <LeaderboardEntry
                username={entry.username}
                score={entry.score}
                position={idx}
                playerEntry={entry.username === playerEntry.username}
                key={entry.username}
              />
            ))}
          </ul>
          <HorizontalDivider width={"400px"} />
          <ul className="leaderboard-local">
            {nextEntry ? (
              <LeaderboardEntry
                username={nextEntry.username}
                score={nextEntry.score}
                position={nextEntry.index === undefined ? 999 : nextEntry.index}
                small={true}
                key={"next-" + nextEntry.username}
              />
            ) : null}
            <LeaderboardEntry
              username={playerEntry.username}
              score={playerEntry.score}
              position={
                playerEntry.index === undefined ? 999 : playerEntry.index
              }
              playerEntry={true}
              key={"plr-" + playerEntry.username}
            />

            {prevEntry ? (
              <LeaderboardEntry
                username={prevEntry.username}
                score={prevEntry.score}
                position={prevEntry.index === undefined ? 999 : prevEntry.index}
                small={true}
                key={"prev-" + prevEntry.username}
              />
            ) : null}
          </ul>
          <Logout />
        </div>
      ) : (
        <div className="adradication-leaderboard" />
      )}
    </>
  );
};

export default LeaderboardPage;
