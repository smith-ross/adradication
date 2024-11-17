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

interface GameContextProps {
  setLoggedIn: (value: boolean) => void;
}

interface GameContextProviderProps {
  children: ReactNode;
  value: GameContextProps;
}

export type WinState = "flee" | "win" | "lose" | "not_played";

export interface GameContextType {
  setLoggedIn: (value: boolean) => void;
  score: number;
  setScore: (amount: number) => void;
  currentWave: number;
  setCurrentWave: (amount: number) => void;
  totalWaves: number;
  setTotalWaves: (amount: number) => void;
  winState: WinState;
  setWinState: (state: WinState) => void;
}

const defaultContext = {
  totalWaves: 0,
  score: 0,
  winState: "not_played",
  currentWave: 0,
  setLoggedIn: (value: boolean) => {},
  setScore: (amount: number) => {},
  setCurrentWave: (amount: number) => {},
  setTotalWaves: (amount: number) => {},
  setWinState: (state: WinState) => {},
};

const GameContext = createContext(defaultContext);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) return defaultContext;
  return context;
};

export const GameContextProvider = ({
  value,
  children,
}: GameContextProviderProps) => {
  const [score, setScore] = useState(0);
  const [currentWave, setCurrentWave] = useState(0);
  const [totalWaves, setTotalWaves] = useState(0);
  const [winState, setWinState] = useState("not_played");
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

    chrome.runtime.sendMessage({ text: "GET_TAB_ID" }, (tabId) => {
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

    chrome.runtime.sendMessage({ text: "GET_TAB_ID" }, (tabId) => {
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
    <GameContext.Provider
      value={{
        ...value,
        score: score,
        setScore: setScore,
        currentWave: currentWave,
        setCurrentWave: setCurrentWave,
        totalWaves: totalWaves,
        setTotalWaves: setTotalWaves,
        winState: winState,
        setWinState: setWinState,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
export const GameContextConsumer = GameContext.Consumer;

export default GameContext;
