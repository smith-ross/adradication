import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { AlertSchema } from "../components/AlertContainer/AlertContainer";

interface GameAuthContextProps {
  setLoggedIn: (value: boolean) => void;
}

interface GameAuthContextProviderProps {
  children: ReactNode;
  value: GameAuthContextProps;
}

const defaultContext = {
  setLoggedIn: (value: boolean) => {},
  addAlert: (value: AlertSchema) => {},
  removeAlert: (index: number) => {},
  clearAlerts: () => {},
  alerts: [] as AlertSchema[],
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
  const [alerts, setAlerts] = useState<AlertSchema[]>([]);

  const removeAlert = useCallback(
    (index: number) => {
      setAlerts(
        alerts.filter((_, i) => {
          return i !== index;
        })
      );
    },
    [alerts]
  );

  const addAlert = useCallback(({ type, content }: AlertSchema) => {
    setAlerts((alerts) => {
      return [...alerts, { type: type, content: content }];
    });
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return (
    <GameAuthContext.Provider
      value={{
        ...value,
        alerts: alerts,
        addAlert: addAlert,
        removeAlert: removeAlert,
        clearAlerts: clearAlerts,
      }}
    >
      {children}
    </GameAuthContext.Provider>
  );
};
export const GameAuthContextConsumer = GameAuthContext.Consumer;

export default GameAuthContext;
