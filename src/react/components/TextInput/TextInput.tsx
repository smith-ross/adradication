import { ChangeEventHandler, useCallback, useEffect, useRef } from "react";
import { classNames } from "../../../util/ClassUtil";
import "./TextInput.scss";

interface TextInputProps {
  name: string;
  placeholderText?: string;
  className?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  typeOverride?: string;
  onEnter?: () => void;
}

const TextInput = ({
  placeholderText,
  name,
  className,
  onChange,
  typeOverride,
  onEnter,
}: TextInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const callback = useCallback(
    (event: KeyboardEvent) => {
      if (!onEnter) return;
      if (event.key === "Enter") onEnter();
    },
    [onEnter]
  );
  useEffect(() => {
    if (!onEnter) return;
    inputRef.current?.addEventListener("keyup", callback);
    return () => inputRef.current?.removeEventListener("keyup", callback);
  }, [inputRef, onEnter]);

  return (
    <input
      ref={inputRef}
      className={classNames(["adradication-text-input", className || false])}
      type={typeOverride || "text"}
      name={name}
      placeholder={placeholderText}
      onChange={onChange}
    />
  );
};

export default TextInput;
