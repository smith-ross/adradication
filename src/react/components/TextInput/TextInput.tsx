import { ChangeEventHandler } from "react";
import { classNames } from "../../../util/ClassUtil";
import "./TextInput.scss";

interface TextInputProps {
  name: string;
  placeholderText?: string;
  className?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  typeOverride?: string;
}

const TextInput = ({
  placeholderText,
  name,
  className,
  onChange,
  typeOverride,
}: TextInputProps) => {
  return (
    <input
      className={classNames(["adradication-text-input", className || false])}
      type={typeOverride || "text"}
      name={name}
      placeholder={placeholderText}
      onChange={onChange}
    />
  );
};

export default TextInput;
