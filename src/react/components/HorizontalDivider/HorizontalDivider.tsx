import "./HorizontalDivider.scss";

interface HorizontalDividerProps {
  width: string;
  height?: string;
}

const DEFAULT_HEIGHT = "4px";

const HorizontalDivider = ({ width, height }: HorizontalDividerProps) => {
  return (
    <div
      className="adradication-horizontal-divider"
      style={{ width: width, height: height || DEFAULT_HEIGHT }}
    />
  );
};

export default HorizontalDivider;
