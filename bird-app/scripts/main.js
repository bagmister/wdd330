import { loadpageSection } from "./utils.mjs";
const partialFilePath = "/partials";

document.addEventListener("DOMContentLoaded", () => {
  loadpageSection(0, partialFilePath);
  loadpageSection(1, partialFilePath);
});

