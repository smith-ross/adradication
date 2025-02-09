import "./FakeAd.scss";
import { ReactNode, useEffect, useState } from "react";
import FakeAd, { Ad } from "./FakeAd";
import Vector from "../../../../../game/types/Vector";

const FAKE_ADS = [
  {
    title: "Get Rich NOW!!",
    body: `I made over $1,000,000,000 using THIS SIMPLE TRICK and now I'm sharing it with you!
This is a limited time offer!`,
    imageUrl: chrome.runtime.getURL("res/fake-ad/scammer.png"),
    buttonText: "Download",
  },

  {
    title: "MAJOR SECURITY ALERT",
    body: `Our software has detected 496 VIRUSES ON YOUR PC! `,
    imageUrl: chrome.runtime.getURL("res/fake-ad/danger.png"),
    buttonText: "Clean",
  },
];

const FakeAdContainer = () => {
  const [ads, setAds] = useState([] as Ad[]);

  useEffect(() => {
    const callback = () => {
      setAds((a) => [
        ...a,
        {
          ...FAKE_ADS[Math.floor(Math.random() * FAKE_ADS.length)],
          position: new Vector(Math.random() * 250, 60 + Math.random() * 300),
        },
      ]);
    };
    document.addEventListener("createFakeAd", callback);
    return () => document.removeEventListener("createFakeAd", callback);
  }, [ads]);

  return (
    <div
      className="fake-ad-container"
      style={{ height: "100%", width: "100%" }}
    >
      {ads.map((ad, i) => (
        <FakeAd setAds={setAds} ad={ad} index={i} />
      ))}
    </div>
  );
};

export default FakeAdContainer;
