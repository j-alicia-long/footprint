import { useState } from "react";
import type { MethodologyNote } from "../footprint/compute-footprint";

/**
 * A figure wrapped in a toggletip trigger: a one-sentence plain-language
 * Methodology Note revealed on hover, keyboard focus/activation, and touch
 * tap — never hover-only (ticket 05, accessibility story #15). The full
 * methodology and citations live on the Sources page (ticket 11).
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
          <span className="methodology-note-summary">{note.summary}</span>
          <a className="methodology-note-link" href={note.sourcesHref}>
            See sources &amp; methodology
          </a>
        </span>
      )}
    </span>
  );
};
