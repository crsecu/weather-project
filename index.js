//grab user input
document.querySelector("#submit-button").addEventListener("click", function () {
  let userQuery = document.querySelector("#user-input").value;
  if (userQuery.trim() === "") {
    var errorMessage = document.querySelector("#error-message");
    errorMessage.textContent = "Please enter a search query.";
    errorMessage.style.display = "block";
    return false; // Prevent form submission
  }
  getGeoCoordinates(userQuery);
  document.querySelector("#user-input").value = "";
  document.querySelector(".five-days-forecast").innerHTML = "";
  document.querySelector("#error-message").innerHTML = "";
});

//grab geo coordinates from the API
function getGeoCoordinates(userQuery) {
  const apiKey = "63e7015c52eb92d28d770760ec390833";
  const url =
    "http://api.openweathermap.org/geo/1.0/direct?q=" +
    userQuery +
    "&limit=10&appid=" +
    apiKey;

  fetch(url, {
    method: "GET",
    dataType: "json",
  })
    .then((data) => data.json())
    .then((data) => {
      if (data.length !== 0) {
        getData(data);
        console.log("data", data);
      } else {
        document.querySelector(".weather-details").innerHTML =
          "Invalid location.";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

//pass coordinates into this function and make another API request to get weather data
function getData(coordinates) {
  let name = coordinates[0].name;
  let lat = coordinates[0].lat;
  let lon = coordinates[0].lon;

  const apiKey = "63e7015c52eb92d28d770760ec390833";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

  fetch(url, {
    method: "GET",
    dataType: "json",
  })
    .then((data) => data.json())
    .then((data) => {
      getWeather(data, name);
      get5DayWeather(apiKey, lat, lon);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

//get 5 day for forecast data
function get5DayWeather(apiKey, lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

  fetch(url, {
    method: "GET",
    dataType: "json",
  })
    .then((data) => data.json())
    .then((data) => Weather5day(data))
    .catch((error) => console.error(error));

  function Weather5day(data) {
    console.log("checking data", data);
    const limit = 8;
    let grabDays = [];
    let forecast = [];

    //iterate over data and group each 8 data objects into arrays
    for (let i = 0; i < data.list.length; i += limit) {
      let group = data.list.slice(i, i + limit);
      grabDays.push(group);
    }

    //iterate over the array that holds 5 day forecast and grab latest 3hrs forecast
    for (let e = 0; e < grabDays.length; e++) {
      let oneDay = grabDays[e];
      let average = oneDay.slice(-1)[0];
      forecast.push(average);
    }

    display5DayWeather(forecast);
  }

  function display5DayWeather(dayAverage) {
    for (let a = 0; a < dayAverage.length; a++) {
      let forecastDetails = dayAverage[a];
      let temperature = Math.round(forecastDetails.main.temp);
      let description = forecastDetails.weather[0].main;

      //convert date string into correspoding week day
      const dateString = forecastDetails.dt_txt;
      const date = new Date(dateString);
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayOfWeek = daysOfWeek[date.getDay()];

      let template5DayForecast = `
          <div class="col-md-6 col-lg-2">
            <div class="square-box"
              <p class="description">${description}</p>
              <p class="temp-degrees">${temperature}&deg</p>
              <p class="day">${dayOfWeek}</p>
            </div>
          </div>
         `;
      document.querySelector(".five-days-forecast").innerHTML +=
        template5DayForecast;
    }
  }
}

function getWeather(locationInfo, locationName) {
  let wheather = locationInfo.weather[0].main;
  let temperature = Math.round(locationInfo.main.temp);

  let template = `
        <p class="temp-degrees">${temperature}&deg;</p>
        <p class="location">${locationName}</p>
        <p class="description">${wheather}</p>
    `;

  document.querySelector(".weather-details").innerHTML = template;
}
