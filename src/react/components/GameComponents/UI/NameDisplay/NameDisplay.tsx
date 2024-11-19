import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../../../../../util/FetchUtil";
import "./NameDisplay.scss";

const NameDisplay = () => {
  const [username, setUsername] = useState("...");

  const updateName = useCallback(() => {
    apiGet("/auth/currentUser", true)
      .then((response) => {
        if (response.status === 200) {
          response.json().then((json) => {
            setUsername(json.username);
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    updateName();
    const onNameUpdate = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (Object.keys(changes).includes("authToken")) {
        updateName();
      }
    };
    chrome.storage.onChanged.addListener(onNameUpdate);
    return () => chrome.storage.onChanged.removeListener(onNameUpdate);
  }, []);
  return <span className="name-display">{username}</span>;
};

export default NameDisplay;
