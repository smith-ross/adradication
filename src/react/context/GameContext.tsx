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

export type WinState = "flee" | "win" | "lose" | "not_played" | "uninit";

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
  mostCommonTracker?: string;
  setMostCommonTracker: (trackerUrl?: string) => void;
  trackersFound?: string;
  setTrackersFound: (trackers: number) => void;
}

const defaultContext = {
  totalWaves: 0,
  score: 0,
  winState: "uninit",
  currentWave: 0,
  trackersFound: 0,
  mostCommonTracker: "",
  setLoggedIn: (value: boolean) => {},
  setScore: (amount: number) => {},
  setCurrentWave: (amount: number) => {},
  setTotalWaves: (amount: number) => {},
  setTrackersFound: (amount: number) => {},
  setWinState: (state: WinState) => {},
  setMostCommonTracker: (trackerUrl: string) => {},
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
  const [trackersFound, setTrackersFound] = useState(0);
  const [winState, setWinState] = useState("not_played");
  const [mostCommonTracker, setMostCommonTracker] = useState<string>("");
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
        try {
          chrome.storage.local.remove(`pageWaves-${id}`);
        } catch {}
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
        mostCommonTracker: mostCommonTracker,
        setMostCommonTracker: setMostCommonTracker,
        trackersFound: trackersFound,
        setTrackersFound: setTrackersFound,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
export const GameContextConsumer = GameContext.Consumer;

export default GameContext;
