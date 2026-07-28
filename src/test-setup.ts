import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// RTL auto-cleanup needs a global afterEach; vitest globals are off, so wire it explicitly.
afterEach(cleanup);
