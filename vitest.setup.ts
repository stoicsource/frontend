// Suppress jsdom localStorage warnings from Node.js process warnings
const originalEmitWarning = process.emitWarning;
process.emitWarning = (
  warning: string | Error,
  ...args: Array<string | ((...args: unknown[]) => void)>
) => {
  if (typeof warning === "string" && warning.includes("--localstorage-file")) {
    return;
  }
  return originalEmitWarning.call(process, warning, ...args);
};
