import * as variable from "./consts.js";

variable.locationInput.addEventListener("input", (e) => {
  location = e.target.value;
});

locationInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    onSearch();
  }
});

searchButton.addEventListener("click", () => {
  onSearch();
});
