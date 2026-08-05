import { useState } from "react";
import type { MethodologyNote } from "../footprint/compute-footprint";

/**
 * A figure wrapped in a toggletip trigger: the Methodology Note behind the
 * number is revealed on hover, keyboard focus/activation, and touch tap —
 * never hover-only (ticket 05, accessibility story #15).
 */
export const MethodologyFigure = ({
  figureLabel,
  note,
  children,
}: {
  figureLabel: string;
  note: MethodologyNote;
  children: React.ReactNode;
}) => {
  // Hover reveal and tap/keyboard pinning are independent, so a click
  // (which also hovers) never cancels itself.
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || pinned;

  // One citation entry per distinct source
  const sources = [
    ...new Map(
      note.coefficients.map((c) => [c.citation.source, c.citation]),
    ).values(),
  ];

  return (
    <span
      className="methodology-figure"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
    >
      <button
        type="button"
        className="methodology-trigger"
        aria-label={`Methodology for ${figureLabel}`}
        aria-expanded={open}
        onClick={() => setPinned((wasPinned) => !wasPinned)}
      >
        {children}
      </button>
      {open && (
        <span role="note" className="methodology-note">
          <span className="methodology-note-boundary">{note.boundary}</span>
          <span className="methodology-note-sources">
            {sources.map((citation) => (
              <a
                key={citation.source}
                href={citation.url}
                className="methodology-note-source"
              >
                {`${citation.source} (${citation.year})`}
              </a>
            ))}
          </span>
        </span>
      )}
    </span>
  );
};
