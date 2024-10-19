import { getFromStorage, setStorage, transformStorage } from "./StorageUtil";

const STORAGE_KEY = "UserConfig";

const DEFAULT = {
  draggedPosition: { x: "0%", y: "0%" },
  isMinimized: false,
};

let initialised = false;

export const initialiseConfigs = async () => {
  await transformStorage({
    key: STORAGE_KEY,
    modifierFn: (userConfig) => {
      if (!userConfig) {
        return DEFAULT;
      }
      return userConfig;
    },
  });
};

export const getConfigSetting = async (configKey: string) => {
  if (!initialised) initialiseConfigs();
  return getFromStorage(STORAGE_KEY).then((configObject) => {
    if (!configObject) {
      configObject = DEFAULT;
    }
    return (
      configObject[configKey] ||
      (configKey.includes("draggedPosition")
        ? DEFAULT.draggedPosition
        : undefined)
    );
  });
};

export const setConfigSetting = (configKey: string, value: any) => {
  if (!initialised) initialiseConfigs();
  transformStorage({
    key: STORAGE_KEY,
    modifierFn: (userConfig) => {
      userConfig[configKey] = value;
      return userConfig;
    },
  });
};
