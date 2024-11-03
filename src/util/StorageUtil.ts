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
  TrackerCounter: 0,
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
  });
};

export const getFromStorage = async (key: string) => {
  return chrome.storage.local.get(key).then((value) => {
    return value[key] || DEFAULTS[key];
  });
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
  return chrome.storage.local.remove(key);
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
