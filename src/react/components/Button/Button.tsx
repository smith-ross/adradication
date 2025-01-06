import { MouseEventHandler, ReactNode } from "react";
import { classNames } from "../../../util/ClassUtil";
import "./Button.scss";

interface ButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  buttonType?: "primary" | "secondary";
  disabled?: boolean;
  children: ReactNode;
}

const Button = ({
  onClick,
  className,
  buttonType,
  children,
  disabled,
}: ButtonProps) => {
  return (
    <button
      className={classNames([
        "adradication-button",
        (disabled && "disabled") || false,
        buttonType || "secondary",
        className || false,
      ])}
      onClick={(!disabled && onClick) || undefined}
    >
      {children}
    </button>
  );
};

export default Button;
