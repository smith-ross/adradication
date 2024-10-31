import { createElement, FunctionComponent, useState } from "react";

export interface PageProps {
  changePage: (pageId: string) => void;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

interface PageViewProps {
  startingPage: string;
  pages: { [pageId: string]: FunctionComponent<PageProps> };
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const PageView = ({ pages, startingPage, setLoggedIn }: PageViewProps) => {
  const [selectedPage, selectPage] = useState(startingPage);
  if (!pages[selectedPage]) selectPage(startingPage);
  console.log("Set Logged In:", setLoggedIn);
  return createElement(pages[selectedPage], {
    changePage: selectPage,
    setLoggedIn: setLoggedIn,
  });
};

export default PageView;
