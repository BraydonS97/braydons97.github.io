window.addEventListener('load', () => {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            lat = position.coords.latitude;
            long = position.coords.longitude;

            WeatherCall(lat, long);

            var map = L.map('map').setView([lat, long], 8);

            L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=fTElpc48VoiAtH54mdqW', { attribution: '', }).addTo(map);

            var marker = L.marker([lat, long]).addTo(map);

            map.doubleClickZoom.disable();

            map.on('dblclick', function(e) {
                marker.setLatLng(e.latlng);
                marker.addTo(map);
                const { lat, lng } = marker.getLatLng();
                map.panTo([lat, lng], 8);

                const test = { lat, lng };
                WeatherCall(lat, lng);
            })


            function WeatherCall(lat, long) {

                const proxy = `https://cors-anywhere.herokuapp.com/`;
                const current_weathercall = `http://api.weatherapi.com/v1/forecast.json?key=3236a6520fac47b1a24224928230507&q=${lat},${long}&days=5`

                // // Current Weather API Call
                fetch(current_weathercall).then(response => {
                    return response.json();
                }).then(data => {
                    const { info } = data;
                    console.log(data);

                    const { country, name, region } = data.location;
                    const { condition, temp_f, feelslike_f, gust_mph, humidity, is_day, vis_miles, wind_dir, wind_mph, last_updated } = data.current;
                    const { forecastday } = data.forecast;

                    fivedayForecast(forecastday)
                    currentForecast(name, region, condition, temp_f, feelslike_f, wind_dir, gust_mph, wind_mph, vis_miles, humidity, is_day, last_updated);

                })
            }

        })
    }


})




function currentForecast(location, region, condition, temperature, feelsLike, windDir, windGust, windSpeed, visibility, humidity, timeofday, last_updated) {
    var current_location = document.getElementById("current-location");
    var current_icon = document.getElementById("current-icon");
    var current_temp = document.getElementById("current-temp");
    var current_weather = document.getElementById("current-weather-desc");
    var current_realfeel = document.getElementById("current-realfeel");
    var current_windspeed = document.getElementById("current-windspeed");
    var current_windgust = document.getElementById("current-windgust");
    var current_humidity = document.getElementById("current-humidity");
    var current_visibility = document.getElementById("current-visibility");

    current_location.innerHTML = location + ", " + stateNameToAbbreviation(region);
    setIcon(current_icon, weatherCodeConverter(condition.code, timeofday));
    current_temp.innerHTML = Math.floor(temperature) + "°";
    current_weather.innerHTML = condition.text;
    current_realfeel.innerHTML = Math.floor(feelsLike) + "°";
    current_windspeed.innerHTML = windDir + " " + Math.floor(windSpeed) + " mph";
    current_windgust.innerHTML = windGust + " mph";
    current_humidity.innerHTML = humidity + " %";
    current_visibility.innerHTML = visibility + " mi";

}

function fivedayForecast(forecastdays) {
    var fiveday_precip = document.getElementsByClassName("FDB-precip");
    var fiveday_temphigh = document.getElementsByClassName("FDB-high-temp");
    var fiveday_templow = document.getElementsByClassName("FDB-low-temp");
    var fiveday_icon = document.getElementsByClassName("FDB-icon");
    var fiveday_desc = document.getElementsByClassName("FDB-weather-desc")
    var fiveday_date = document.getElementsByClassName("FDB-date");
    var fiveday_wind = document.getElementsByClassName("FDB-windspeed");

    for (var i = 0; i < 5; i++) {
        fiveday_temphigh[i].innerHTML = Math.floor(forecastdays[i].day.maxtemp_f) + "°";
        fiveday_templow[i].innerHTML = Math.floor(forecastdays[i].day.mintemp_f) + "°";
        fiveday_wind[i].innerHTML = Math.floor(forecastdays[i].day.maxwind_mph) + " mph";
        fiveday_precip[i].innerHTML = forecastdays[i].day.daily_chance_of_rain + "%";
        fiveday_desc[i].innerHTML = forecastdays[i].day.condition.text;
        setIcon(fiveday_icon[i], weatherCodeConverter(forecastdays[i].day.condition.code));
        fiveday_date[i].innerHTML = dateParse(forecastdays[i].date);
    }
}


function weatherCodeConverter(code, timeofday) {

    const weatherCodes = []

    if (code == 1000 && timeofday == 1) {
        weatherCodes[1000] = "Sunny";
    } else if (code == 1000 && timeofday == 0) {
        weatherCodes[1000] = "Clear";
    } else {
        weatherCodes[1000] = "Sunny";
    }

    weatherCodes[1003] = "Partly-Cloudy-Day"; // add day or night thing
    weatherCodes[1006] = "Cloudy";
    weatherCodes[1009] = "Cloudy";
    weatherCodes[1030] = "Fog"; //Mist?
    weatherCodes[1135] = "Fog";
    weatherCodes[1147] = "Fog";
    weatherCodes[1063] = "Rain"; //Patchy rain
    weatherCodes[1150] = "Rain";
    weatherCodes[1153] = "Rain";
    weatherCodes[1180] = "Rain";
    weatherCodes[1183] = "Rain";
    weatherCodes[1186] = "Rain";
    weatherCodes[1189] = "Rain";
    weatherCodes[1192] = "Rain";
    weatherCodes[1195] = "Rain";
    weatherCodes[1198] = "Rain";
    weatherCodes[1240] = "Rain";
    weatherCodes[1243] = "Rain";
    weatherCodes[1246] = "Rain";
    weatherCodes[1273] = "Rain";
    weatherCodes[1276] = "Rain";
    weatherCodes[1087] = "Rain"; //thunderstorm
    weatherCodes[1069] = "Sleet";
    weatherCodes[1072] = "Sleet";
    weatherCodes[1168] = "Sleet";
    weatherCodes[1171] = "Sleet";
    weatherCodes[1201] = "Sleet";
    weatherCodes[1204] = "Sleet";
    weatherCodes[1207] = "Sleet";
    weatherCodes[1237] = "Sleet";
    weatherCodes[1249] = "Sleet";
    weatherCodes[1252] = "Sleet";
    weatherCodes[1261] = "Sleet";
    weatherCodes[1264] = "Sleet";
    weatherCodes[1066] = "Snow";
    weatherCodes[1114] = "Snow";
    weatherCodes[1117] = "Snow";
    weatherCodes[1210] = "Snow";
    weatherCodes[1213] = "Snow";
    weatherCodes[1216] = "Snow";
    weatherCodes[1219] = "Snow";
    weatherCodes[1222] = "Snow";
    weatherCodes[1225] = "Snow";
    weatherCodes[1255] = "Snow";
    weatherCodes[1258] = "Snow";
    weatherCodes[1279] = "Snow";
    weatherCodes[1282] = "Snow";

    let weatherCondition = weatherCodes[code];


    return weatherCondition;
}

function stateNameToAbbreviation(name) {
    let states = {
        "arizona": "AZ",
        "alabama": "AL",
        "alaska": "AK",
        "arkansas": "AR",
        "california": "CA",
        "colorado": "CO",
        "connecticut": "CT",
        "district of columbia": "DC",
        "delaware": "DE",
        "florida": "FL",
        "georgia": "GA",
        "hawaii": "HI",
        "idaho": "ID",
        "illinois": "IL",
        "indiana": "IN",
        "iowa": "IA",
        "kansas": "KS",
        "kentucky": "KY",
        "louisiana": "LA",
        "maine": "ME",
        "maryland": "MD",
        "massachusetts": "MA",
        "michigan": "MI",
        "minnesota": "MN",
        "mississippi": "MS",
        "missouri": "MO",
        "montana": "MT",
        "nebraska": "NE",
        "nevada": "NV",
        "new hampshire": "NH",
        "new jersey": "NJ",
        "new mexico": "NM",
        "new york": "NY",
        "north carolina": "NC",
        "north dakota": "ND",
        "ohio": "OH",
        "oklahoma": "OK",
        "oregon": "OR",
        "pennsylvania": "PA",
        "rhode island": "RI",
        "south carolina": "SC",
        "south dakota": "SD",
        "tennessee": "TN",
        "texas": "TX",
        "utah": "UT",
        "vermont": "VT",
        "virginia": "VA",
        "washington": "WA",
        "west virginia": "WV",
        "wisconsin": "WI",
        "wyoming": "WY",
        "american samoa": "AS",
        "guam": "GU",
        "northern mariana islands": "MP",
        "puerto rico": "PR",
        "us virgin islands": "VI",
        "us minor outlying islands": "UM"
    }

    let a = name.trim().replace(/[^\w ]/g, "").toLowerCase(); //Trim, remove all non-word characters with the exception of spaces, and convert to lowercase
    if (states[a] !== null) {
        return states[a];
    }

    return null;
}


function dateParse(unparsedData) {
    const rawDate = unparsedData.split('-');
    var parsedDate = parseInt(rawDate[1]) + "/" + parseInt(rawDate[2]);

    return parsedDate;
}

function setIcon(element, weatherCondition) {
    var skycons = new Skycons({ "color:": "white" });
    skycons.add(element, weatherCondition)
        // skycons.add(id, condition)
    skycons.play();
}