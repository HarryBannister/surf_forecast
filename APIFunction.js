import {
  getFullTimestamp,
  formatDate,
  tideDisplayControls,
  updateCurrentConditions,
  updateForecastConditions,
  updateTideState,
  updateSunriseTimes,
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

export const spinner = `<span class="loader"></span>`;

let date, futureDate, tideArray;
let location = "";

variable.locationInput.addEventListener("input", (e) => {
  location = e.target.value;
});

async function getForecastWeatherData() {
  variable.currentDataTableRef.innerHTML = spinner;
  variable.forecastDataTableRef.innerHTML = spinner;

  // * LOCATION API

  const locationData =
    await axios.get(`https://us1.locationiq.com/v1/search?key=${locationAPIKey}&q=${location}&format=json
`);

  let lat = locationData.data[0].lat;
  let lon = locationData.data[0].lon;

  // * CURRENT WEATHER DATA API
  const currentWeatherData = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherAPIKey}&units=metric`
  );
  currentWeather = currentWeatherData.data;

  // * CURRENT SURF DATA API
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
  let forecastResults = await axios.get(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=9&appid=${openWeatherAPIKey}&units=metric`
  );

  for (let i = 0; i < forecastResults.data.list.length; i++) {
    forecastData = forecastResults.data.list;

    date = getFullTimestamp(forecastData[i].dt * 1000);
    futureDate = getFullTimestamp((forecastData[i].dt + 172800) * 1000);

    const surfData = await axios.get(
      `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lon}&params=${marineAPIparams}&start=${date}&end=${date}`,
      {
        headers: {
          Authorization: `${marineAPIKey}`,
        },
      }
    );
    forecastData[i].surfData = surfData.data;
  }

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
  tideArray = tideData.data.data;
  todayTideArray = tideArray.slice(0, 4);
  tommorrowTideArray = tideArray.slice(4, 9);

  const sunriseData = await axios.get(
    `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${sunriseAPIKey}`
  );
  sunriseTimes = sunriseData.data.data;

  updateForecastConditions();
  updateCurrentConditions();
  updateSunriseTimes();
  updateTideState();
  tideDisplayControls();
}
