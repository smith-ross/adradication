import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../../../../../util/FetchUtil";
import "./NameDisplay.scss";

const NameDisplay = () => {
  const [username, setUsername] = useState("...");

  const updateName = useCallback(() => {
    apiGet("/auth/currentUser", true).then((response) => {
      if (response.status === 200) {
        response.json().then((json) => {
          setUsername(json.username);
        });
      }
    });
  }, []);

  useEffect(() => {
    updateName();
    chrome.storage.onChanged.addListener((changes) => {
      if (Object.keys(changes).includes("authToken")) {
        updateName();
      }
    });
  }, []);
  return <span className="name-display">{username}</span>;
};

export default NameDisplay;
