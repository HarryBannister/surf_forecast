export {
  convertTime,
  convertDate,
  addIcons,
  getFullTimestamp,
  formatTime,
  formatDate,
  tideDisplayControls,
  updateCurrentConditions,
  updateForecastConditions,
  updateTideState,
  updateSunriseTimes,
  onSearch,
  errorFunction,
};

import * as variable from "./consts.js";

import {
  currentSurf,
  sunriseTimes,
  currentWeather,
  forecastData,
  todayTideArray,
  tommorrowTideArray,
} from "./APIFunction.js";

import { getForecastWeatherData } from "./APIFunction.js";

const arrow = `<svg id="svg" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M11 21.883l-6.235-7.527-.765.644 7.521 9 7.479-9-.764-.645-6.236 7.529v-21.884h-1v21.883z"/></svg>`;

// ! initiates APIs and HTML display
function onSearch() {
  variable.placeholderRef.classList.add("displayNone");
  variable.currentDataTableRef.classList.remove("displayNone");
  variable.forecastContainer.classList.remove("displayNone");
  variable.headingsRef.forEach((headings) => {
    headings.classList.remove("displayNone");
  });
  getForecastWeatherData();
}

// ! MAPS OVER CURRENT WEATHER AND MARINE CONDITIONS AND CREATES HTML
function updateCurrentConditions() {
  const temp = Math.round(currentWeather.main.temp);
  const waveHeight = currentSurf.waveHeight.meteo;
  const waveDirection = `<div
      class="svgContainer"
      style="transform: rotate(${currentSurf.waveDirection.meteo}deg)"
    >
      ${arrow}
    </div>`;
  const wavePeriod = Math.round(currentSurf.wavePeriod.noaa);
  const waterTemp = Math.round(currentSurf.waterTemperature.sg);
  const windSpeed = Math.round(currentWeather.wind.speed);
  const windDir = `<div class="svgContainer"style="transform: rotate(${currentWeather.wind.deg}deg)">${arrow}</div>`;
  const conditions = currentWeather.weather[0].icon;

  const currentWeatherHTML = `
                <div class="currentWeatherData">
                <div>
                  <span><h5>Temp</h5></span>
                  <span><h5>Wave Height</h5></span>
                  <span><h5>Wave</h5> </span>
                  <span><h5>Water Temp</h5></span>
                  <span><h5>Wind</h5></span>
                  <span><h5>Conditions</h5></span>
                </div>
                <div>
                  <span>${temp} deg</span>
                  <span>${waveHeight} m</span>                  
                  <span>${wavePeriod} sec${waveDirection}</span>
                  <span>${waterTemp}</span>
                  <span>${windSpeed} mph
                  ${windDir}</span>
                  <span>${addIcons(conditions)}</span>

                </div>
                </div>`;
  variable.currentDataTableRef.innerHTML = currentWeatherHTML;
}

// ! MAPS OVER FORECAST WEATHER AND MARINE CONDITIONS AND CREATES HTML
function updateForecastConditions() {
  const forecastHTML = forecastData.map((item) => {
    const temp = Math.round(item.main.temp);
    const waveHeight = item.surfData.hours[0].waveHeight.meteo;
    const waveDirection = `<div
      class="svgContainer"
      style="transform: rotate(${item.surfData.hours[0].waveDirection.meteo}deg)"
    >
      ${arrow}
    </div>`;
    const wavePeriod = Math.round(item.surfData.hours[0].wavePeriod.noaa);
    const waterTemp = Math.round(item.surfData.hours[0].waterTemperature.sg);
    const windSpeed = Math.round(item.wind.speed);
    const windDir = `<div class="svgContainer"style="transform: rotate(${item.wind.deg}deg)">${arrow}</div>`;
    const conditions = item.weather[0].icon;
    const condsDesc =
      item.weather[0].description.charAt(0).toUpperCase() +
      item.weather[0].description.slice(1);
    return `
    <div class="tableCol">
                <li><h5>${convertDate(item.dt)}</h5></li>
                <li><h5>${convertTime(item.dt)}</h5></li>
                <li>${temp} &deg;</li>
                <li>${waveHeight} m</li>
                <li>${waveDirection}</li>
                <li>${wavePeriod} sec</li>
                <li>${waterTemp} &deg;</li> 
                <li>${windSpeed} mph</li>
                <li >${windDir}</li>
                <li>${addIcons(conditions)}</li>
                <li>${condsDesc}</li>
            </div>`;
  });

  variable.forecastDataTableRef.innerHTML = forecastHTML.join("");
}

// ! MAPS OVER TIDE CONDITIONS AND CREATES HTML
function updateTideState() {
  const returnTodayTideTimes = todayTideArray
    .map((item) => {
      return `<div>
              <span>${item.type}</span>
              <span>${formatTime(item.time)}</span>
            </div> `;
    })
    .join("");
  const todayTideDataHTML = `<div>${returnTodayTideTimes}</div>`;

  variable.todayTideRef.innerHTML = todayTideDataHTML;

  const returnTomorrowTideTimes = tommorrowTideArray
    .map((item) => {
      return `
            <div>
              <span>${item.type}</span>
              <span>${formatTime(item.time)}</span>
            </div>`;
    })
    .join("");
  const tomorrowTideDataHTML = `<div>${returnTomorrowTideTimes}</div>`;

  variable.tomorrowTideRef.innerHTML = tomorrowTideDataHTML;
}

// ! MAPS OVER SUNRISE/SUNSET DATA AND CREATES HTML
function updateSunriseTimes() {
  const returnSunriseDates = sunriseTimes
    .map((item) => {
      return `<th>${convertDate(item.ts)}</th>`;
    })
    .join("");
  const returnSunriseTimes = sunriseTimes
    .map((item) => {
      return `<td>${convertTime(item.sunrise_ts)}</td>`;
    })
    .join("");

  const returnSunsetTimes = sunriseTimes
    .map((item) => {
      return `<td>${convertTime(item.sunset_ts)}</td>`;
    })
    .join("");

  const sunriseDataHTML = `<table>
                            <tr>
                            <th></th>
                              ${returnSunriseDates}
                              
                            </tr>
                            <tr>
                              <td>Sunrise</td>
                              ${returnSunriseTimes}
                            </tr>
                            <tr>
                              <td>Sunset</td>
                              ${returnSunsetTimes}
                          </table>`;

  variable.sunriseDataRef.innerHTML = sunriseDataHTML;
}

// ! CONVERT UNIX TIMESTAMP TO HH:MM
function convertTime(x) {
  const timeFormat = new Date(x * 1000);
  const hour = timeFormat.getHours();
  const minute = timeFormat.getMinutes();

  function time(n) {
    return n < 10 ? "0" + n : n;
  }

  return time(hour) + ":" + time(minute);
}

// ! CONVERT UNIX TIME TO DD/MM
function convertDate(x) {
  const dateFormat = new Date(x * 1000).toLocaleDateString("en-GB");
  return dateFormat.slice(0, 5);
}

// ! FORMAT DATE - "2024-01-11T01:29:00+00:00" TO  HH:MM
function formatTime(date) {
  const timestamp = date;
  const dateObject = new Date(timestamp);

  const hours = String(dateObject.getHours()).padStart(2, "0");
  const minutes = String(dateObject.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

// ! FORMAT DATE TO YYY-MM-DD
function formatDate(aDate) {
  const timestamp = aDate;
  const dateObject = new Date(timestamp);

  const year = dateObject.getFullYear();
  const month = String(dateObject.getMonth() + 1).padStart(2, "0");
  const day = String(dateObject.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ! ADDS WEATHER ICONS TO HTML
function addIcons(x) {
  return `
          <img src="./images/${x}.png" alt="Hello"
          `;
}

// ! GET FULL TIMESTAMP
function getFullTimestamp(date) {
  const pad = (n, s = 2) => `${new Array(s).fill(0)}${n}`.slice(-s);
  const d = new Date(date);

  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ! CONTROLS TODAY/TOMORROW BUTTONS FOR DISPLAYING TIDE TIMES
function tideDisplayControls() {
  function toggleDisplay(x, y) {
    return x.classList.add("displayNone"), y.classList.remove("displayNone");
  }

  variable.todayButton.addEventListener("click", () => {
    toggleDisplay(variable.tomorrowTideRef, variable.todayTideRef);
  });

  variable.tomorrowButton.addEventListener("click", () => {
    toggleDisplay(variable.todayTideRef, variable.tomorrowTideRef);
  });
}

// ! ACTIVATED IN CATCH BLOCK AND REMOVES ALL HTML THAT HAD BEEN CREATED TO POTENTIALLY DISPLAY DATA
function errorFunction() {
  variable.currentDataTableRef.classList.add("displayNone");
  variable.forecastContainer.classList.add("displayNone");
  variable.headingsRef.forEach((headings) => {
    headings.classList.add("displayNone");
  });
}
