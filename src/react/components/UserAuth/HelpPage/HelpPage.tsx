import "./HelpPage.scss";
import { PageProps } from "../../PageView/PageView";
import ClickableText from "../../ClickableText/ClickableText";

const HelpPage = ({ changePage }: PageProps) => {
  return (
    <div id="help-page">
      <div className="help-card">
        <span className="help-page-header">What is this?</span>
        <div className="help-page-body">
          <span className="help-page-body-header">General</span>
          Adradication is a Top-Down Action Roguelike where you battle against
          the various Ad Trackers you find as you browse the web. The amount of
          "Adbominations" (monsters) spawned is directly linked to the amount of
          Ad Trackers detected on each page that you play the game on. Defeating
          all of the Adbominations on a page will add to your total score, which
          can then be used to compete against other players on the global
          leaderboard!
          <br />
          <br />
          <span className="help-page-body-header">What is an Ad Tracker?</span>
          Ad Trackers are web requests that get made to "data brokers" around
          the world, detailing precise, descriptive information about you and
          your browsing habits. This collected data is grouped together and sold
          to any interested party, whether malicious or not. Usages of this data
          can range from simple statistics to large-scale cyber attacks.
          <br />
          <br />
          <span className="help-page-body-header">How to Play</span>
          First, create and login to your account. This will be how your score
          is maintained. As you browse the web, Adbominations will appear in
          this window for you to slay. As you defeat them, your score will
          increase. At the end of each Wave of Adbominations, select an Upgrade
          to pick up, which will empower you for the rest of the Waves on that
          website. After slaying all Adbominations on a page, check out your
          score on the global leaderboard!
        </div>
        <div className="help-page-link">
          Don't have an account?{" "}
          <ClickableText
            onClick={() => {
              changePage("register");
            }}
          >
            Register here
          </ClickableText>
        </div>
        <div className="help-page-link">
          Already have an account?{" "}
          <ClickableText
            onClick={() => {
              changePage("login");
            }}
          >
            Login here
          </ClickableText>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
