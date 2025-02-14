import { useEffect, useState } from "react";

export const isDebugMode = () => {
  return process.env.REACT_APP_DEBUG_MODE === "True";
};

export const fireEvent = (eventId: string, details: any) => {
  document.dispatchEvent(new CustomEvent(eventId, { detail: details }));
};

export const setEventVariable = (eventId: string, value: any) => {
  document.dispatchEvent(
    new CustomEvent(eventId, { detail: { value: value } })
  );
};

export const waitForEvent = async (eventId: string) => {
  return new Promise<void>((resolve) => {
    const callbackFn = () => {
      document.removeEventListener(eventId, callbackFn);
      resolve();
    };
    document.addEventListener(eventId, callbackFn, { once: true });
  });
};

export const useEventVariable = (eventId: string, defaultValue: any) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const updateVariable = (event: CustomEvent) => {
      if (event.detail.value === value) return;
      setValue(event.detail.value);
    };
    document.addEventListener(eventId, updateVariable as any);
    return () => document.removeEventListener(eventId, updateVariable as any);
  }, []);

  return value;
};
