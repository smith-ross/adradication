import { useCallback, useEffect, useState } from "react";

export const isDebugMode = () => {
  return process.env.REACT_APP_DEBUG_MODE === "True";
};

export const setEventVariable = (eventId: string, value: any) => {
  document.dispatchEvent(
    new CustomEvent(eventId, { detail: { value: value } })
  );
};

export const useEventVariable = (eventId: string, defaultValue: any) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const updateVariable = (event: CustomEvent) => {
      setValue(event.detail.value);
    };
    document.addEventListener(eventId, updateVariable as any);
    return () => document.removeEventListener(eventId, updateVariable as any);
  }, []);

  return value;
};
