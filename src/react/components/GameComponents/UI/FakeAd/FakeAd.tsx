import { useMemo } from "react";
import Vector from "../../../../../game/types/Vector";
import { fireEvent } from "../../../../../util/GeneralUtil";

export interface Ad {
  title: string;
  imageUrl: string;
  body: string;
  buttonText: string;
  position: Vector;
}

interface FakeAdProps {
  setAds: (ads: Ad[] | ((a: Ad[]) => Ad[])) => void;
  ad: Ad;
  index: number;
}

const FakeAd = ({ setAds, ad, index }: FakeAdProps) => {
  return (
    <div
      className="fake-ad"
      style={{
        left: ad.position.x,
        top: ad.position.y,
      }}
    >
      <div className="fake-ad-banner">
        <div className="fake-ad-banner-container">
          <span className="fake-ad-title">
            <img
              className="fake-ad-icon"
              src={chrome.runtime.getURL("res/upgrades/RightToErasure.png")}
            />
            {ad.title}
          </span>
          <button
            className="fake-ad-close"
            onClick={() => setAds((ads) => ads.filter((_, i) => i !== index))}
          >
            ✖
          </button>
        </div>
      </div>
      <div className="fake-ad-body">
        <img className="fake-ad-img" src={ad.imageUrl} />
        <div className="fake-ad-primary">
          <span className="fake-ad-body-text">{ad.body}</span>
          <button
            className="fake-ad-button"
            onClick={() => {
              fireEvent("clickedFakeButton", {});
              setAds((ads) => ads.filter((_, i) => i !== index));
            }}
          >
            {ad.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FakeAd;
