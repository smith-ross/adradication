import { createElement, FunctionComponent, ReactNode, useState } from "react";
import AlertContainer, { AlertSchema } from "../AlertContainer/AlertContainer";
import { GameContextProvider } from "../../context/GameContext";

export interface PageProps {
  changePage: (pageId: string) => void;
}

interface PageViewProps {
  startingPage: string;
  pages: { [pageId: string]: FunctionComponent<PageProps> };
}

const PageView = ({ pages, startingPage }: PageViewProps) => {
  const [selectedPage, selectPage] = useState(startingPage);
  if (!pages[selectedPage]) selectPage(startingPage);
  return createElement(pages[selectedPage], {
    changePage: selectPage,
  });
};

export default PageView;
