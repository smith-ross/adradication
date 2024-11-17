import "./Loader.scss";

const Loader = () => {
  return (
    <div className="loader">
      <img className="spinner" src={chrome.runtime.getURL("res/spinner.svg")} />
      <div>
        For the best experience, turn off any
        <b> AdBlock</b> extensions
      </div>
    </div>
  );
};

export default Loader;
