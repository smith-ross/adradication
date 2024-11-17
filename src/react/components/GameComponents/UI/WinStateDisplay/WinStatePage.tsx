import "./WinStatePage.scss";

interface WinStateProps {
  score?: number;
  message: string;
  spriteUrl: string;
}

const WinStatePage = ({ message, score, spriteUrl }: WinStateProps) => {
  const hasScore = !!(score && score > 0);
  return (
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
    </div>
  );
};

export default WinStatePage;
