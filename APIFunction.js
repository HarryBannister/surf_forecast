import {
  getFullTimestamp,
  formatDate,
  tideDisplayControls,
  updateCurrentConditions,
  updateForecastConditions,
  updateTideState,
  updateSunriseTimes,
  errorFunction,
} from "./functions.js";

import {
  marineAPIKey,
  openWeatherAPIKey,
  locationAPIKey,
  sunriseAPIKey,
} from "./APIKeys.js";

import * as variable from "./consts.js";

export let sunriseTimes,
  currentSurf,
  currentWeather,
  forecastData,
  todayTideArray,
  tommorrowTideArray;

export { getForecastWeatherData };

// loading spinner while loading API data
const spinner = `<span class="loader"></span>`;

let date, futureDate, tideArray;
let location = "";

// listens for user typed input and stores value in location variable
variable.locationInput.addEventListener("input", (e) => {
  location = e.target.value;
});

// gets data from all APIs required to form HTML
async function getForecastWeatherData() {
  try {
    // removes error message when user re-attempts search
    variable.errorRef.innerHTML = "";

    // activates spinners while data loads
    variable.currentDataTableRef.innerHTML = spinner;
    variable.forecastDataTableRef.innerHTML = spinner;

    // * LOCATION API
    // converts user input into coordinates
    const locationData =
      await axios.get(`https://us1.locationiq.com/v1/search?key=${locationAPIKey}&q=${location}&format=json
`);

    // extracts latitutde and longitude from API data
    let lat = locationData.data[0].lat;
    let lon = locationData.data[0].lon;

    // * CURRENT WEATHER DATA API
    // uses location coords to get current weather data from API
    const currentWeatherData = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherAPIKey}&units=metric`
    );
    currentWeather = currentWeatherData.data;

    // * CURRENT SURF DATA API
    // as above and uses date/time from above API to return data from marine API for that point in time
    const marineAPIparams =
      "waveDirection,wavePeriod,waterTemperature,waveHeight";
    const currentSurfData = await axios.get(
      `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lon}&params=${marineAPIparams}&start=${currentWeather.dt}&end=${currentWeather.dt}`,
      {
        headers: {
          Authorization: `${marineAPIKey}`,
        },
      }
    );
    currentSurf = currentSurfData.data.hours[0];

    // * WEATHER FORECAST DATA API
    // uses location coords to get 3hrly forecast weather data from API
    let forecastResults = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=30&appid=${openWeatherAPIKey}&units=metric`
    );

    // loops over above weather forecast data, and for each item in array accesses marine forecast API
    for (let i = 0; i < forecastResults.data.list.length; i++) {
      forecastData = forecastResults.data.list;

      // converts unix time for each point in time of weather forecast into timestamp that is conpatible with marine API
      date = getFullTimestamp(forecastData[i].dt * 1000);
      futureDate = getFullTimestamp((forecastData[i].dt + 172800) * 1000);

      // * SURF FORECAST DATA API
      const surfData = await axios.get(
        `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lon}&params=${marineAPIparams}&start=${date}&end=${date}`,
        {
          headers: {
            Authorization: `${marineAPIKey}`,
          },
        }
      );
      // stores marine data for in the original forecast data array
      forecastData[i].surfData = surfData.data;
    }

    // uses location to get tide times and states for date ranges specified above
    const tideData = await axios.get(
      `https://api.stormglass.io/v2/tide/extremes/point?lat=${lat}&lng=${lon}&start=${formatDate(
        date
      )}&end=${formatDate(futureDate)}`,
      {
        headers: {
          Authorization: `${marineAPIKey}`,
        },
      }
    );
    // destructures tide data and retrieves only data needed for today and tomorrow
    tideArray = tideData.data.data;
    todayTideArray = tideArray.slice(0, 4);
    tommorrowTideArray = tideArray.slice(4, 9);

    // uses location to retrieve 7 day sunrise/sunset times
    const sunriseData = await axios.get(
      `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${sunriseAPIKey}`
    );
    sunriseTimes = sunriseData.data.data;

    // when all above data is retrieved, run functions to create HTML and update DOM
    updateForecastConditions();
    updateCurrentConditions();
    updateSunriseTimes();
    updateTideState();
    tideDisplayControls();
  } catch (err) {
    // Error block displays message if there are any issues with above try block
    let error = new Error(
      "Sorry, there seems to be an issue. Please refresh the page."
    );
    errorFunction();
    variable.errorRef.innerHTML = error;
  }
}
