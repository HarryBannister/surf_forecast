import { onSearch } from "./functions.js";

// runs function on enter keypress or search button click which initiates API search
locationInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    onSearch();
  }
});
searchButton.addEventListener("click", () => {
  onSearch();
});
