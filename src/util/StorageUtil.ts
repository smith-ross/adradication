import { useEffect, useState } from "react";

interface StorageModifier {
  key: string;
  modifierFn: (originalValue: any) => any;
}

type StorageQueue = {
  isBusy: boolean;
  itemQueue: StorageModifier[];
};

const storageQueue: StorageQueue = {
  isBusy: false,
  itemQueue: [],
};

const DEFAULTS: { [key: string]: any } = {
  TrackerCounter: [],
};

export const updateStorage = async () => {
  if (storageQueue.itemQueue.length === 0 || storageQueue.isBusy) return;
  storageQueue.isBusy = true;
  const storingItem = storageQueue.itemQueue.shift();
  if (!storingItem) {
    storageQueue.isBusy = false;
    return;
  }
  getFromStorage(storingItem.key).then((value) => {
    try {
      chrome.storage.local
        .set({
          [storingItem.key]: storingItem.modifierFn(value),
        })
        .then(() => {
          storageQueue.isBusy = false;
          if (storageQueue.itemQueue.length > 0) {
            updateStorage();
          }
        });
    } catch {}
  });
};

export const setStorageRaw = async (key: string, value: any) => {
  try {
    return chrome.storage.local.set({
      [key]: value,
    });
  } catch {}
};

export const getFromStorage = async (key: string) => {
  try {
    return chrome.storage.local.get(key).then((value) => {
      return value[key] || DEFAULTS[key];
    });
  } catch {}
};

export const transformStorage = async (modifier: StorageModifier) => {
  storageQueue.itemQueue.push(modifier);
  updateStorage();
};

export const transformStorageOverwrite = async (modifier: StorageModifier) => {
  storageQueue.itemQueue = [modifier];
  updateStorage();
};

export const deleteStorage = async (key: string) => {
  try {
    return chrome.storage.local.remove(key);
  } catch {}
};

export const setStorage = async (key: string, value: any) => {
  storageQueue.itemQueue.push({
    key: key,
    modifierFn: () => {
      return value;
    },
  });
  updateStorage();
};

export const useChromeStorage = (
  key: string,
  defaultValue?: string | number | boolean | object,
  listen: boolean = true
) => {
  const [storageValue, setStorageValue] = useState(defaultValue || "");
  useEffect(() => {
    const onUpdate = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (Object.keys(changes).includes(key)) {
        setStorageValue(changes[key].newValue);
      }
    };
    getFromStorage(key).then((value) => {
      if (value !== undefined) setStorageValue(value);
      if (listen) chrome.storage.onChanged.addListener(onUpdate);
    });
    if (listen) return () => chrome.storage.onChanged.removeListener(onUpdate);
  }, []);

  return storageValue;
};
