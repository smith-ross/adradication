import { ReactNode } from "react";
import { classNames } from "../../../util/ClassUtil";
import "./Alert.scss";

interface AlertProps {
  type: "error" | "success" | "warn";
  removeAlert: (index: number) => void;
  index: number;
  children: ReactNode;
}

const Alert = ({ type, children, removeAlert, index }: AlertProps) => {
  return (
    <div className={classNames(["adradication-alert", type])}>
      <button className="alert-close" onClick={() => removeAlert(index)}>
        ×
      </button>
      {children}
    </div>
  );
};

export default Alert;
