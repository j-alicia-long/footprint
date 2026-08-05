import { useState } from "react";

const PANEL_TITLE =
  "Why are these numbers higher than the ones AI companies quote?";

/**
 * Methodology-Note-style disclosure for the skeptical visitor: why our
 * figures run ~5–30× above provider-marketing numbers (ticket 07).
 * Toggled by button, so it is keyboard- and touch-reachable, consistent
 * with Methodology Note interaction.
 */
export const BoundaryExplainer = () => {
  const [open, setOpen] = useState(false);
  return (
    <section className="boundary-explainer">
      <button
        type="button"
        className="boundary-explainer-trigger"
        aria-expanded={open}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        {PANEL_TITLE}
      </button>
      {open && (
        <div
          role="note"
          aria-label={PANEL_TITLE}
          className="boundary-explainer-panel"
        >
          <p>
            Our figures run ~5–30× above provider-marketing numbers — Sam
            Altman&rsquo;s &ldquo;0.34 Wh per ChatGPT query&rdquo; (blog, 2025)
            and Google&rsquo;s &ldquo;0.03 gCO₂e per Gemini prompt&rdquo;
            (technical report, 2025) — deliberately.
          </p>
          <p>
            Every number here uses one fixed{" "}
            <strong>full-stack, location-based</strong> boundary (
            <a href="https://github.com/j-alicia-long/ai-carbon-footprint/blob/main/docs/adr/0001-full-stack-location-based-boundary.md">
              ADR 0001
            </a>
            ): GPU energy plus the server around it plus datacenter overhead
            (PUE), with carbon from the physical grid mix where servers run —
            not renewable-certificate accounting. Boundary choice alone swings
            published figures ~95×, so we never mix boundaries across Scenarios.
          </p>
          <p>
            Like nearly all published per-query figures (including the provider
            numbers above), training-phase emissions are excluded.
          </p>
        </div>
      )}
    </section>
  );
};
