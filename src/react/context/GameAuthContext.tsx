import { createContext, ReactNode, useContext } from "react";

interface GameAuthContextProps {
  setLoggedIn: (value: boolean) => void;
}

interface GameAuthContextProviderProps {
  children: ReactNode;
  value: GameAuthContextProps;
}

const defaultContext = {
  setLoggedIn: (value: boolean) => {},
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
  return (
    <GameAuthContext.Provider value={value}>
      {children}
    </GameAuthContext.Provider>
  );
};
export const GameAuthContextConsumer = GameAuthContext.Consumer;

export default GameAuthContext;
