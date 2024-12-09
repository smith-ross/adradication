import {
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  getConfigSetting,
  setConfigSetting,
} from "../../../util/UserConfigUtil";
import "./FloatingWindow.scss";
import { classNames } from "../../../util/ClassUtil";

interface FloatingWindowProps {
  x: string;
  y: string;
  width: string;
  height: string;
  zindex: number;
  title: string;
  id: string;
  draggable: boolean;
  children: ReactNode;
}

type PartialFloatingWindowProps = Partial<FloatingWindowProps>;

const FloatingWindow = ({
  x = "10px",
  y = "10px",
  width = "auto",
  height = "auto",
  zindex = 2147483647,
  draggable,
  id,
  title,
  children,
}: PartialFloatingWindowProps) => {
  const [windowCollapsed, setWindowCollapsed] = useState(false);
  const [isLoaded, setLoaded] = useState(false);
  const [_, setBasePosition] = useState({ x: x, y: y });
  const windowRef: RefObject<HTMLDivElement> = useRef(null);
  const windowHeaderRef: RefObject<HTMLDivElement> = useRef(null);
  const windowCollapseButtonRef: RefObject<HTMLButtonElement> = useRef(null);
  const windowPosition = useRef({ x: "-1", y: "-1" });

  const offset = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

  useLayoutEffect(() => {
    getConfigSetting("isMinimized-" + id).then((value) => {
      if (value && typeof value === "boolean") {
        setWindowCollapsed(value);
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (windowPosition.current.x === "-1") {
      getConfigSetting("draggedPosition-" + id).then((value) => {
        if (!value || typeof value === "boolean") return;
        windowPosition.current = value;
        setBasePosition(value);
      });
    }
  }, [windowRef.current, windowHeaderRef.current]);

  const convertPixelToPercent = (px: number, axis: "height" | "width") => {
    return (
      (
        (px / (axis === "height" ? window.innerHeight : window.innerWidth)) *
        100
      ).toString() + "%"
    );
  };

  const handleDragStart = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (
        !draggable ||
        !windowRef.current ||
        !windowHeaderRef.current ||
        dragging.current ||
        event.target === windowCollapseButtonRef.current
      )
        return;
      dragging.current = true;
      offset.current = {
        x: event.nativeEvent.offsetX,
        y: event.nativeEvent.offsetY,
      };
      const elementRect = windowRef.current.getBoundingClientRect();
      windowPosition.current.x = convertPixelToPercent(
        elementRect.left,
        "width"
      );
      windowPosition.current.y = convertPixelToPercent(
        elementRect.top,
        "height"
      );
    },
    [windowRef, windowHeaderRef]
  );

  const clampWindowSize = (x: number, y: number) => {
    if (!windowRef.current || !windowHeaderRef.current) return;
    const elementRect = windowRef.current.getBoundingClientRect();
    const clampedX = Math.max(
      Math.min(window.innerWidth - elementRect.width, x),
      0
    );
    const clampedY = Math.max(
      Math.min(window.innerHeight - elementRect.height, y),
      0
    );

    windowPosition.current = {
      x: convertPixelToPercent(clampedX, "width"),
      y: convertPixelToPercent(clampedY, "height"),
    };

    windowRef.current.style.left = windowPosition.current.x;
    windowRef.current.style.top = windowPosition.current.y;
  };

  useEffect(() => {
    if (!draggable) return;
    const moveHandler = (event: MouseEvent) => {
      if (!windowRef.current || !windowHeaderRef.current || !dragging.current)
        return;

      clampWindowSize(
        event.clientX - offset.current.x,
        event.clientY - offset.current.y
      );

      return;
    };
    document.addEventListener("mousemove", moveHandler);
    return function cleanup() {
      document.removeEventListener("mousemove", moveHandler);
    };
  }, []);

  useEffect(() => {
    if (!draggable) return;
    const upHandler = () => {
      if (
        !draggable ||
        !windowRef.current ||
        !windowHeaderRef.current ||
        !dragging.current
      )
        return;
      dragging.current = false;
      setConfigSetting("draggedPosition-" + id, windowPosition.current);
    };
    document.addEventListener("mouseup", upHandler);
    return function cleanup() {
      document.removeEventListener("mouseup", upHandler);
    };
  }, [windowRef.current, windowHeaderRef.current]);

  useEffect(() => {
    if (!windowCollapsed) {
      if (!windowRef.current) return;
      window.getComputedStyle(windowRef.current);
      let xPercent: string | number = windowPosition.current?.x || "0%";
      let yPercent: string | number = windowPosition.current?.y || "0%";
      xPercent = Number.parseFloat(xPercent[xPercent.length - 1]);
      yPercent = Number.parseFloat(yPercent[yPercent.length - 1]);
      clampWindowSize(
        window.innerWidth * (xPercent / 100),
        window.innerHeight * (yPercent / 100)
      );
    }
  }, [windowCollapsed]);

  if (!isLoaded) return <div />;

  return (
    <div
      className="floatwindow"
      style={{
        top: windowPosition.current.y,
        left: windowPosition.current.x,
        width: width,
        height: height,
        zIndex: zindex,
      }}
      ref={windowRef}
    >
      <div
        className={classNames([
          "floatwindow-header",
          windowCollapsed && "floatwindow-collapsed",
          !title && !windowCollapsed && "floatwindow-no-title",
        ])}
        ref={windowHeaderRef}
        onMouseDown={draggable ? handleDragStart : undefined}
      >
        {title && !windowCollapsed && (
          <span className={classNames(["floatwindow-title"])}>{title}</span>
        )}
        <button
          className="floatwindow-collapse"
          onClick={() => {
            setConfigSetting("isMinimized-" + id, !windowCollapsed);
            setWindowCollapsed(!windowCollapsed);
            windowCollapseButtonRef.current?.parentElement?.blur();
          }}
        >
          <span ref={windowCollapseButtonRef}>
            {(windowCollapsed && "+") || "-"}
          </span>
        </button>
      </div>

      <div
        className={classNames([
          "floatwindow-container",
          windowCollapsed && "hidden",
        ])}
      >
        {!windowCollapsed && children}
      </div>
    </div>
  );
};

export default FloatingWindow;
