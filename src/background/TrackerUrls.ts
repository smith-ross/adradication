import { apiGet } from "../util/FetchUtil";

let TrackerURLs: { [key: string]: boolean } = {};

apiGet("/trackers/trackerList")
  .then((response) => {
    response.json().then((json) => {
      TrackerURLs = json;
    });
  })
  .catch((reason) => {
    console.log(
      "Retrieving ad trackers failed, using default safety list",
      reason
    );
  });

export const getTrackerURLs = () => {
  return TrackerURLs;
};
