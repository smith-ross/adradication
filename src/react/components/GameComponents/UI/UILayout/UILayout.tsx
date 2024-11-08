import Logout from "../Logout/Logout";
import NameDisplay from "../NameDisplay/NameDisplay";
import ScoreDisplay from "../ScoreDisplay/ScoreDisplay";
import WaveDisplay from "../WaveDisplay/WaveDisplay";
import "./UILayout.scss";

const UILayout = () => {
  return (
    <div className="adradication-ui">
      <NameDisplay />
      <ScoreDisplay />
      <WaveDisplay />
      <Logout />
    </div>
  );
};

export default UILayout;
