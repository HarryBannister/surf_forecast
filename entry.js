import { onSearch } from "./functions.js";

locationInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    onSearch();
  }
});
searchButton.addEventListener("click", () => {
  onSearch();
});
