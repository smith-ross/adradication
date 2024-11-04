import { Dispatch, SetStateAction } from "react";
import Logout from "../Logout/Logout";
import NameDisplay from "../NameDisplay/NameDisplay";
import "./UILayout.scss";

const UILayout = () => {
  return (
    <div className="adradication-ui">
      <NameDisplay />
      <Logout />
    </div>
  );
};

export default UILayout;
