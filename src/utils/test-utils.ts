import { type ReactNode } from "react";
import {
  render as vitestRender,
  type RenderOptions,
} from "vitest-browser-react";

export function render(ui: ReactNode, options?: RenderOptions) {
  return vitestRender(ui, options);
}
