import { MouseEventHandler, ReactNode } from "react";
import { classNames } from "../../../util/ClassUtil";
import "./ClickableText.scss";

interface ClickableTextProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  children: ReactNode;
}

const ClickableText = ({ onClick, children, disabled }: ClickableTextProps) => {
  return (
    <span
      className={classNames(["adradication-clickable-text"])}
      onClick={(!disabled && onClick) || undefined}
    >
      {children}
    </span>
  );
};

export default ClickableText;
