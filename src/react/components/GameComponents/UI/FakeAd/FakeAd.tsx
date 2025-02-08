import { useMemo } from "react";

interface FakeAdProps {
  title: string;
  body: string;
  imageUrl: string;
  buttonText?: string;
}

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

const FakeAd = () => {
  const { title, imageUrl, body, buttonText } = useMemo(
    () => FAKE_ADS[Math.floor(Math.random() * FAKE_ADS.length)],
    []
  );

  return (
    <div className="fake-ad">
      <div className="fake-ad-banner">
        <div className="fake-ad-banner-container">
          <span className="fake-ad-title">
            <img
              className="fake-ad-icon"
              src={chrome.runtime.getURL("res/upgrades/RightToErasure.png")}
            />
            {title}
          </span>
          <button className="fake-ad-close">✖</button>
        </div>
      </div>
      <div className="fake-ad-body">
        <img className="fake-ad-img" src={imageUrl} />
        <div className="fake-ad-primary">
          <span className="fake-ad-body-text">{body}</span>
          <button className="fake-ad-button">{buttonText}</button>
        </div>
      </div>
    </div>
  );
};

export default FakeAd;
