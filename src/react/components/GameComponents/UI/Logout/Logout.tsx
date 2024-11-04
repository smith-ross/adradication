import { Dispatch, SetStateAction } from "react";
import { deleteStorage, setStorage } from "../../../../../util/StorageUtil";
import Button from "../../../Button/Button";
import "./Logout.scss";
import { useGameAuthContext } from "../../../../context/GameAuthContext";

const Logout = () => {
  const { setLoggedIn } = useGameAuthContext();
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
