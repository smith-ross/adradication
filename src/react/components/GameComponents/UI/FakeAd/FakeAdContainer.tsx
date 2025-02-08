import "./FakeAd.scss";
import { ReactNode } from "react";

const FakeAdContainer = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className="fake-ad-container"
      style={{ height: "100%", width: "100%" }}
    >
      {children}
    </div>
  );
};

export default FakeAdContainer;
