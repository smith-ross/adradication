import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Adradication from "../../../game/core/Adradication";
import { apiGet, apiPost } from "../../../util/FetchUtil";
import { getFromStorage } from "../../../util/StorageUtil";
import { useGameContext, WinState } from "../../context/GameContext";
import Loader from "../Loader/Loader";
import "./GameView.scss";
import UILayout from "./UI/UILayout/UILayout";
import WinStatePage from "./UI/WinStateDisplay/WinStatePage";

type ImplementedGame = Adradication;

interface GameViewProps {
  game: ImplementedGame;
}

interface GameState {
  currentGame?: ImplementedGame;
}

const WIN_STATE_MESSAGES = {
  win: "⚔️ You Adradicated all Adbominations on this page! Congratulations! ⚔️",
  lose: "💀 You were defeated by the Adbominations on this page... 💀",
  flee: "💨 You fled from the Adbominations on this page... Shameful! 💨",
  not_played: "",
  uninit: "",
};

const GameView = ({ game }: GameViewProps) => {
  const [isLoaded, setLoaded] = useState(false);
  const { winState, setWinState, score, setScore } = useGameContext();

  const gameStateRef: MutableRefObject<GameState> = useRef({
    currentGame: undefined,
  });

  const canvasRef = useCallback((canvas: HTMLCanvasElement) => {
    if (canvas !== null) {
      if (gameStateRef.current.currentGame) {
        gameStateRef.current.currentGame.stop();
      }
      game.setCanvas(canvas);
      gameStateRef.current.currentGame = game;
      game.start();
    }
  }, []);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      switch (msg.text) {
        case "UPDATE_WIN_STATE":
          if (window.location.href !== msg.url) return;
          setTimeout(
            () => setWinState(msg.value),
            msg.value === "lose" ? 3000 : 1
          );
          break;
      }
      return true;
    });
  }, []);

  useEffect(() => {
    if (isLoaded) return;
    getFromStorage("authToken").then(() => {
      apiPost("/battle/getBattleResult", true, {
        body: {
          url: window.location.href,
        },
      }).then((response) => {
        if (response.status !== 200) return;
        response.json().then((json) => {
          switch (json.result) {
            case "not_played":
              setLoaded(true);
              break;
            default:
              setLoaded(true);
              setWinState(json.result);
              setScore(json.points);
              break;
          }
        });
      });
    });
  }, []);

  return (
    <>
      {((!isLoaded || winState == "uninit") && <Loader />) || (
        <div className="adradication-container">
          {winState === "not_played" ? (
            <>
              <UILayout />
              <canvas ref={canvasRef} id="adradication" />
            </>
          ) : (
            <WinStatePage
              message={WIN_STATE_MESSAGES[winState as WinState]}
              spriteUrl={chrome.runtime.getURL(
                `res/character-sprites/WinState/${winState}.png`
              )}
              score={score}
            />
          )}
        </div>
      )}
    </>
  );
};

export default GameView;
