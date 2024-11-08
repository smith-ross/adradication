import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getFromStorage,
  transformStorageOverwrite,
} from "../../util/StorageUtil";

interface GameAuthContextProps {
  setLoggedIn: (value: boolean) => void;
}

interface GameAuthContextProviderProps {
  children: ReactNode;
  value: GameAuthContextProps;
}

export interface GameAuthContextType {
  setLoggedIn: (value: boolean) => void;
  score: number;
  setScore: (amount: number) => void;
  currentWave: number;
  setCurrentWave: (amount: number) => void;
  totalWaves: number;
  setTotalWaves: (amount: number) => void;
}

const defaultContext = {
  setLoggedIn: (value: boolean) => {},
  score: 0,
  setScore: (amount: number) => {},
  currentWave: 0,
  setCurrentWave: (amount: number) => {},
  totalWaves: 0,
  setTotalWaves: (amount: number) => {},
};

const GameAuthContext = createContext(defaultContext);

export const useGameAuthContext = () => {
  const context = useContext(GameAuthContext);
  if (!context) return defaultContext;
  return context;
};

export const GameAuthContextProvider = ({
  value,
  children,
}: GameAuthContextProviderProps) => {
  const [score, setScore] = useState(0);
  const [currentWave, setCurrentWave] = useState(0);
  const [totalWaves, setTotalWaves] = useState(0);
  const updateScore = useCallback(
    (id: number) => {
      getFromStorage(`pageScore-${id}`).then((value) => {
        setScore(value);
      });
    },
    [score]
  );

  const updateWaves = useCallback(
    (id: number) => {
      getFromStorage(`pageWaves-${id}`).then((value) => {
        setCurrentWave(value ? value[0] : 0);
        setTotalWaves(value ? value[1] : 0);
      });
    },
    [currentWave, totalWaves]
  );

  useEffect(() => {
    let id = 0;
    const onNameUpdate = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (Object.keys(changes).includes(`pageScore-${id}`)) {
        updateScore(id);
      }
    };

    chrome.runtime.sendMessage({ text: "getTabId" }, (tabId) => {
      id = tabId.tab;
      console.log("ID", id);
      window.addEventListener("beforeunload", () => {
        transformStorageOverwrite({
          key: `pageScore-${tabId.tab}`,
          modifierFn: (originalValue) => {
            return 0;
          },
        });
      });
      updateScore(id);
      chrome.storage.onChanged.addListener(onNameUpdate);
    });

    return () => chrome.storage.onChanged.removeListener(onNameUpdate);
  }, []);

  useEffect(() => {
    let id = 0;
    const onWaveUpdate = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (Object.keys(changes).includes(`pageWaves-${id}`)) {
        updateWaves(id);
      }
    };

    chrome.runtime.sendMessage({ text: "getTabId" }, (tabId) => {
      id = tabId.tab;
      console.log("ID", id);
      window.addEventListener("beforeunload", () => {
        chrome.storage.local.remove(`pageWaves-${id}`);
      });
      updateWaves(id);
      chrome.storage.onChanged.addListener(onWaveUpdate);
    });

    return () => chrome.storage.onChanged.removeListener(onWaveUpdate);
  }, []);

  return (
    <GameAuthContext.Provider
      value={{
        ...value,
        score: score,
        setScore: setScore,
        currentWave: currentWave,
        setCurrentWave: setCurrentWave,
        totalWaves: totalWaves,
        setTotalWaves: setTotalWaves,
      }}
    >
      {children}
    </GameAuthContext.Provider>
  );
};
export const GameAuthContextConsumer = GameAuthContext.Consumer;

export default GameAuthContext;
