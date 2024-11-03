import { MutableRefObject, useCallback, useRef } from "react";
import Adradication from "../../../game/core/Adradication";
import "./GameView.scss";
import UILayout from "./UI/UILayout/UILayout";

type ImplementedGame = Adradication;

interface GameViewProps {
  game: ImplementedGame;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

interface GameState {
  currentGame?: ImplementedGame;
}

const GameView = ({ game, setLoggedIn }: GameViewProps) => {
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
  return (
    <div className="adradication-container">
      <UILayout setLoggedIn={setLoggedIn} />
      <canvas ref={canvasRef} id="adradication" />
    </div>
  );
};

export default GameView;
