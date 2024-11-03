import { Dispatch, SetStateAction } from "react";
import { deleteStorage, setStorage } from "../../../../../util/StorageUtil";
import Button from "../../../Button/Button";
import "./Logout.scss";

interface LogoutProps {
  setLoggedIn: Dispatch<SetStateAction<boolean>>;
}

const Logout = ({ setLoggedIn }: LogoutProps) => {
  return (
    <Button
      className="logout"
      buttonType="secondary"
      onClick={() => {
        deleteStorage("authToken").then(() => {
          setLoggedIn(false);
        });
      }}
    >
      Logout
    </Button>
  );
};

export default Logout;
