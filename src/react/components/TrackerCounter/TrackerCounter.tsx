import { useEffect, useState } from "react";
import "./TrackerCounter.scss";
import { getFromStorage } from "../../../util/StorageUtil";

const TrackerCounter = () => {
  const [trackerCount, setTrackerCount] = useState(0);

  const updateTracker = () => {
    getFromStorage("TrackerCounter").then((value) => {
      setTrackerCount(value);
    });
  };

  useEffect(() => {
    updateTracker();
    chrome.storage.onChanged.addListener((changes) => {
      if (Object.keys(changes).includes("TrackerCounter")) {
        updateTracker();
      }
    });
  }, []);

  return (
    <div className="tracker-count-container">
      <span className="tracker-count-header">Ad Trackers Counted:</span>
      <div className="tracker-count-number">{trackerCount}</div>
    </div>
  );
};

export default TrackerCounter;
