import { MutableRefObject, useCallback, useRef } from "react";
import Adradication from "../../../game/core/Adradication";
import "./GameView.scss";

type ImplementedGame = Adradication;

interface GameViewProps {
  game: ImplementedGame;
}

interface GameState {
  currentGame?: ImplementedGame;
}

const GameView = ({ game }: GameViewProps) => {
  const gameStateRef: MutableRefObject<GameState> = useRef({
    currentGame: undefined,
  });
  const canvasRef = useCallback((canvas: HTMLCanvasElement) => {
    if (canvas !== null) {
      game.setCanvas(canvas);
      gameStateRef.current.currentGame = game;
      game.start();
    }
  }, []);
  return <canvas ref={canvasRef} id="adradication" />;
};

export default GameView;
