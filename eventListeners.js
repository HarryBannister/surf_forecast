import * as variable from "./consts.js";

// listens to input box and stores typed value in location variable
variable.locationInput.addEventListener("input", (e) => {
  location = e.target.value;
});
