import { createElement, FunctionComponent, ReactNode, useState } from "react";
import AlertContainer, { AlertSchema } from "../AlertContainer/AlertContainer";

export interface PageProps {
  changePage: (pageId: string) => void;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  addAlert: (type: "error" | "success" | "warn", text: ReactNode) => void;
}

interface PageViewProps {
  startingPage: string;
  pages: { [pageId: string]: FunctionComponent<PageProps> };
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const PageView = ({ pages, startingPage, setLoggedIn }: PageViewProps) => {
  const [selectedPage, selectPage] = useState(startingPage);
  const [alerts, setAlerts] = useState<AlertSchema[]>([]);
  if (!pages[selectedPage]) selectPage(startingPage);
  console.log("Set Logged In:", setLoggedIn);
  return (
    <>
      <AlertContainer
        alerts={alerts}
        removeAlert={(index: number) => {
          setAlerts(
            alerts.filter((_, i) => {
              return i !== index;
            })
          );
        }}
      />
      {createElement(pages[selectedPage], {
        changePage: selectPage,
        setLoggedIn: setLoggedIn,
        addAlert: (type: "error" | "success" | "warn", text: ReactNode) => {
          setAlerts((alerts) => {
            return [...alerts, { type: type, content: text }];
          });
        },
      })}
    </>
  );
};

export default PageView;
