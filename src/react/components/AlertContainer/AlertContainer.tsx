import { ReactNode } from "react";
import Alert from "../Alert/Alert";
import "./AlertContainer.scss";

export type AlertSchema = {
  type: "error" | "success" | "warn";
  content: ReactNode;
};
interface AlertContainerProps {
  alerts: AlertSchema[];
  removeAlert: (id: number) => void;
}

const AlertContainer = ({ alerts, removeAlert }: AlertContainerProps) => {
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
