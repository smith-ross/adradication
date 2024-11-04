import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import AlertContainer, {
  AlertSchema,
} from "../components/AlertContainer/AlertContainer";

interface AlertsContextProviderProps {
  children: ReactNode;
}

const defaultContext = {
  addAlert: (value: AlertSchema) => {},
  removeAlert: (index: number) => {},
  clearAlerts: () => {},
  alerts: [] as AlertSchema[],
};

const AlertsContext = createContext(defaultContext);

export const useAlertsContext = () => {
  const context = useContext(AlertsContext);
  if (!context) return defaultContext;
  return context;
};

export const AlertsContextProvider = ({
  children,
}: AlertsContextProviderProps) => {
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
    <AlertsContext.Provider
      value={{
        alerts: alerts,
        addAlert: addAlert,
        removeAlert: removeAlert,
        clearAlerts: clearAlerts,
      }}
    >
      <AlertContainer />
      {children}
    </AlertsContext.Provider>
  );
};
export const AlertsContextConsumer = AlertsContext.Consumer;

export default AlertsContext;
