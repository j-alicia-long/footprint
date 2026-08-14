// 20 steps per decade: one keyboard arrow-step moves the value ~12%,
// comfortably past the two-significant-figure rounding below (a finer
// scale would snap back to the same value and feel stuck).
const SLIDER_STEPS = 60;
const MIN_EXPONENT = 2; // 10^2 = 100 tokens
const MAX_EXPONENT = 5; // 10^5 = 100,000 tokens

/** Map a linear slider position (0–SLIDER_STEPS) to a token count on a logarithmic scale. */
export const sliderPositionToTokens = (position: number): number => {
  const exponent =
    MIN_EXPONENT + ((MAX_EXPONENT - MIN_EXPONENT) * position) / SLIDER_STEPS;
  const raw = 10 ** exponent;
  // Round to two significant figures so dragging lands on friendly values
  const magnitude = 10 ** (Math.floor(Math.log10(raw)) - 1);
  return Math.round(raw / magnitude) * magnitude;
};

/** Inverse of sliderPositionToTokens: where on the slider a token count sits. */
export const tokensToSliderPosition = (tokens: number): number =>
  Math.round(
    ((Math.log10(tokens) - MIN_EXPONENT) / (MAX_EXPONENT - MIN_EXPONENT)) *
      SLIDER_STEPS,
  );

/**
 * One global output-token slider (ticket 10). Logarithmic scale spanning
 * ~100 to ~100,000 tokens; presets set it, visitors may drag it. The label
 * spells out "token" in plain language because it is jargon.
 */
export const TokenSlider = ({
  outputTokens,
  onOutputTokensChange,
}: {
  outputTokens: number;
  onOutputTokensChange: (tokens: number) => void;
}) => (
  <div className="token-slider">
    <label className="token-slider-label" htmlFor="token-slider-input">
      Output length:{" "}
      <strong className="token-slider-value">
        {outputTokens.toLocaleString("en-US")}
      </strong>{" "}
      tokens
      <span className="token-slider-hint">
        {" — the word-pieces AI models read and write"}
      </span>
    </label>
    <input
      id="token-slider-input"
      className="token-slider-input"
      type="range"
      min={0}
      max={SLIDER_STEPS}
      value={tokensToSliderPosition(outputTokens)}
      aria-valuetext={`${outputTokens.toLocaleString("en-US")} tokens`}
      onChange={(event) =>
        onOutputTokensChange(sliderPositionToTokens(Number(event.target.value)))
      }
    />
  </div>
);
