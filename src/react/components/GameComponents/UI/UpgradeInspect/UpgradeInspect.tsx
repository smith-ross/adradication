import { useEventVariable } from "../../../../../util/GeneralUtil";
import HorizontalDivider from "../../../HorizontalDivider/HorizontalDivider";
import "./UpgradeInspect.scss";

const UpgradeInspect = () => {
  const inspectedUpgrade = useEventVariable("HighlightedUpgrade", {
    highlighted: false,
  });

  if (!inspectedUpgrade.highlighted) return null;

  return (
    <div className="upgrade-inspect">
      <div className="inspect-header">
        <span className="inspect-name">{inspectedUpgrade.upgradeName}</span>
        <img
          className="inspect-img"
          src={chrome.runtime.getURL(inspectedUpgrade.upgradeIcon)}
        />
      </div>
      <div className="inspect-body">{inspectedUpgrade.upgradeDescription}</div>
      <div className="inspect-pickup">
        <img
          src={chrome.runtime.getURL("res/keys/E.png")}
          className="inspect-pickup-key"
        />
        <span className="inspect-pickup-tag"> Pick Up </span>
      </div>
    </div>
  );
};

export default UpgradeInspect;
