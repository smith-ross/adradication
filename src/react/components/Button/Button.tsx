import { MouseEventHandler, ReactNode } from "react";
import { classNames } from "../../../util/ClassUtil";
import "./Button.scss";

interface ButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  buttonType?: "primary" | "secondary";
  children: ReactNode;
}

const Button = ({ onClick, className, buttonType, children }: ButtonProps) => {
  return (
    <button
      className={classNames([
        "adradication-button",
        className || false,
        buttonType || "secondary",
      ])}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
