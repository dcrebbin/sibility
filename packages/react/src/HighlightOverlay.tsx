import { useEffect, useState, type CSSProperties, type RefObject } from "react";

export interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface HighlightOverlayProps {
  containerRef: RefObject<HTMLElement | null>;
  startIndex: number;
  endIndex: number;
  enabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

function measureRange(
  container: HTMLElement,
  startIndex: number,
  endIndex: number
): HighlightRect | null {
  if (startIndex < 0) return null;

  const startEl = container.querySelector<HTMLElement>(
    `[data-word-index="${startIndex}"]`
  );
  const endEl = container.querySelector<HTMLElement>(
    `[data-word-index="${endIndex}"]`
  );

  if (!startEl || !endEl) return null;

  const containerRect = container.getBoundingClientRect();
  const startRect = startEl.getBoundingClientRect();
  const endRect = endEl.getBoundingClientRect();

  return {
    top: startRect.top - containerRect.top + container.scrollTop,
    left: startRect.left - containerRect.left + container.scrollLeft,
    width: endRect.right - startRect.left,
    height: Math.max(startRect.height, endRect.height),
  };
}

export function HighlightOverlay({
  containerRef,
  startIndex,
  endIndex,
  enabled = true,
  className,
  style,
}: HighlightOverlayProps) {
  const [rect, setRect] = useState<HighlightRect | null>(null);

  useEffect(() => {
    if (!enabled || startIndex < 0) {
      setRect(null);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      setRect(measureRange(container, startIndex, endIndex));
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(container);

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [containerRef, startIndex, endIndex, enabled]);

  if (!enabled || !rect) return null;

  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        pointerEvents: "none",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        backgroundColor: "rgba(59, 130, 246, 0.35)",
        borderRadius: 4,
        transition: "top 0.08s ease, left 0.08s ease, width 0.08s ease, height 0.08s ease",
        ...style,
      }}
    />
  );
}
