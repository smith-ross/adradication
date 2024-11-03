import { Dispatch, SetStateAction } from "react";
import Logout from "../Logout/Logout";
import NameDisplay from "../NameDisplay/NameDisplay";
import "./UILayout.scss";

interface UILayoutProps {
  setLoggedIn: Dispatch<SetStateAction<boolean>>;
}

const UILayout = ({ setLoggedIn }: UILayoutProps) => {
  return (
    <div className="adradication-ui">
      <NameDisplay />
      <Logout setLoggedIn={setLoggedIn} />
    </div>
  );
};

export default UILayout;
