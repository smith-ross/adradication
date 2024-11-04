import { ReactNode } from "react";
import Alert from "../Alert/Alert";
import "./AlertContainer.scss";
import { useGameAuthContext } from "../../context/GameAuthContext";

export type AlertSchema = {
  type: "error" | "success" | "warn";
  content: ReactNode;
};

const AlertContainer = () => {
  const { alerts, removeAlert } = useGameAuthContext();
  return (
    <div className="alert-container">
      {alerts.map((alertDetails, index) => {
        return (
          <Alert
            key={index}
            type={alertDetails.type}
            index={index}
            removeAlert={removeAlert}
          >
            {alertDetails.content}
          </Alert>
        );
      })}
    </div>
  );
};

export default AlertContainer;
