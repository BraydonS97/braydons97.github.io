//Runs listed methods on load
window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            lat = position.coords.latitude;
            long = position.coords.longitude;

            const searchButton = document.querySelector(".search");
            searchButton.addEventListener('click', search);

            function search() {
                const loc = document.querySelector(".search-bar input").value;
                wc(loc);
            }
            // this is a test
            //Initial call of the api with LAT / LNG
            wc(lat + "," + long);

            //Initializing the map
            var map = L.map('map').setView([lat, long], 8);
            L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=fTElpc48VoiAtH54mdqW', {
                attribution: '',
                tileSize: 512,
                zoomOffset: -1
            }).addTo(map);

            // Marker
            var marker = L.marker([lat, long]).addTo(map);

            //Replacing double click zoom on the map with Weather call function for location clicked.
            map.doubleClickZoom.disable();
            map.on('dblclick', function test(e) {
                marker.setLatLng(e.latlng);
                marker.addTo(map);
                const { lat, lng } = marker.getLatLng();
                map.panTo([lat, lng], 8);
                const latlng = lat + "," + lng;
                wc(latlng);
            })

            // Main weather call function
            function wc(loc) {
                const current_weathercall = `https://api.weatherapi.com/v1/forecast.json?key=3236a6520fac47b1a24224928230507&q=${loc}&days=5&alerts=yes&aqi=yes`;

                fetch(current_weathercall).then(response => {
                    return response.json();
                }).then(data => {
                    const { info } = data;
                    //Extracting all the necessary data for the functions.
                    const { name, region, lat, lon } = data.location;
                    const { condition, temp_f, feelslike_f, gust_mph, humidity, vis_miles, wind_dir, wind_mph, last_updated, is_day, air_quality } = data.current;
                    const { forecastday } = data.forecast;
                    const { alerts } = data;

                    // Calling the functions that sort/display the data.
                    fivedayForecast(forecastday);
                    currentForecast(name, region, condition, temp_f, feelslike_f, wind_dir, gust_mph, wind_mph, vis_miles, humidity, is_day);
                    hourlyForecast(last_updated, forecastday);
                    SunriseSunset(forecastday);
                    airQuality(air_quality);
                    alert(alerts);

                    // Sets new Markers position and pans to it.
                    const latlonarr = { lat, lon };
                    marker.setLatLng(latlonarr);
                    map.panTo([lat, lon], 8);

                })

            }

        })
    }

})

// Grabs alert data and displays it in the appropriate div.
function alert(alertdata) {
    var divs = document.getElementsByClassName("alert-template");
    while (divs[0]) {
        divs[0].parentNode.removeChild(divs[0]);
    }

    for (var i = 0; i < alertdata.alert.length; i++) {

        var alert_template = document.createElement("div");
        alert_template.className = "alert-template";
        alert_template.tagName = "alert-template";

        var event_text = document.createElement("div");
        event_text.innerHTML = alertdata.alert[i].event;
        event_text.className = "event-text";
        alert_template.appendChild(event_text);

        var headline_text = document.createElement("div");
        headline_text.className = "headline-text";
        headline_text.innerHTML = alertdata.alert[i].headline;
        alert_template.appendChild(headline_text);

        var areas_text = document.createElement("div");
        areas_text.className = "areas-text";
        areas_text.innerHTML = alertdata.alert[i].areas;
        alert_template.appendChild(areas_text);

        document.getElementById("alert-container").appendChild(alert_template);
    }
}

// Grabs/Sets sunrise/sunset data to div
function SunriseSunset(sunsetsunrise) {
    var sunrise_text = document.getElementById("sunrise-text");
    var sunset_text = document.getElementById("sunset-text");

    sunrise_text.innerHTML = sunsetsunrise[0].astro.sunrise;
    sunset_text.innerHTML = sunsetsunrise[0].astro.sunset;
}

// Grabs/Sets Air Quality data to div.
function airQuality(data) {
    var NO2 = document.getElementById("NO2-text");
    var AQ = document.getElementById("AQ-text");
    var SO2 = document.getElementById("SO2-text");
    var O3 = document.getElementById("O3-text");
    var PM25 = document.getElementById("PM25-text");

    var AQ_index = data['us-epa-index'];

    NO2.innerHTML = Math.floor(data.no2 * 100) / 100 + " NO2";
    AQ.innerHTML = AirQualityChanger(AQ_index);
    SO2.innerHTML = Math.floor(data.so2 * 100) / 100 + " SO2";
    O3.innerHTML = Math.floor(data.o3 * 100) / 100 + " O3";
    PM25.innerHTML = Math.floor(data.pm2_5 * 100) / 100 + " PM25";
}

// Sets background color of div and returns the Air quality condition based on index.
function AirQualityChanger(index) {
    var element = document.getElementById("AQ-text");

    const AQIN = []
    if (index == 1) {
        AQIN[1] = "GOOD";
        element.style.backgroundColor = "#17c220";
    } else if (index == 2) {
        AQIN[2] = "MODERATE";
        element.style.backgroundColor = "#aeb114";
    } else if (index == 3) {
        AQIN[3] = "UNHEALTHY";
        element.style.backgroundColor = "#da681d";
    } else if (index == 4) {
        AQIN[4] = "BAD";
        element.style.backgroundColor = "#d32020";
    } else if (index == 5) {
        AQIN[5] = "VERY BAD";
        element.style.backgroundColor = "#461835";
    } else {
        AQIN[6] = "HAZARDOUS";
        element.style.backgroundColor = "#3d0d05";
    }

    return AQIN[index];
}

// Gets and Sets hourly forecast
function hourlyForecast(currentTime, forecastHourly) {
    var testSplit = currentTime.split(/[ :( )]/);

    var hourlyCast = merge(forecastHourly[0].hour, forecastHourly[1].hour);

    var hourly_time = document.getElementsByClassName("hour-time");
    var hourly_icon = document.getElementsByClassName("hour-weather-icon");
    var hourly_temp = document.getElementsByClassName("hour-weather-temp");
    var hourly_precip = document.getElementsByClassName("hour-weather-precip");

    var startTime = parseInt(testSplit[1]) + 1;
    var endingTime = startTime + 7;

    for (var i = startTime; i < endingTime; i++) {
        hourly_time[i - startTime].innerHTML = timeParse(hourlyCast[i].time).toString();
        setIcon(hourly_icon[i - startTime], weatherCodeConverter(hourlyCast[i].condition.code, hourlyCast[i].is_day));
        hourly_temp[i - startTime].innerHTML = Math.floor(hourlyCast[i].temp_f) + "°";
        hourly_precip[i - startTime].innerHTML = Math.floor(hourlyCast[i].chance_of_rain) + "%";
    }

}

// Formats time
function timeParse(time) {
    var timeStr = time.toString();
    const test = timeStr.split(/[ :( )]/);

    let timeConversion = test[1] >= 12 && (test[1] - 12 || 12) + 'PM' || (Number(test[1]) || 12) + 'AM';

    return timeConversion;
}

// Merges arrays
const merge = (first, second) => {
    for (let i = 0; i < second.length; i++) {
        first.push(second[i]);
    }
    return first;
}

// Gets and Sets Current Forecast
function currentForecast(location, region, condition, temperature, feelsLike, windDir, windGust, windSpeed, visibility, humidity, is_day) {
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
    setIcon(current_icon, weatherCodeConverter(condition.code, is_day));
    current_temp.innerHTML = Math.floor(temperature) + "°";
    current_weather.innerHTML = condition.text;
    current_realfeel.innerHTML = Math.floor(feelsLike) + "°";
    current_windspeed.innerHTML = windDir + " " + Math.floor(windSpeed) + " mph";
    current_windgust.innerHTML = Math.floor(windGust) + " mph";
    current_humidity.innerHTML = humidity + " %";
    current_visibility.innerHTML = visibility + " mi";
}

// Gets and Sets Five day forecast
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

// Returns condition based on code.
function weatherCodeConverter(code, isday) {
    const weatherCodes = []

    if (code == 1000 && isday == 1) {
        weatherCodes[1000] = "Sunny";
    } else if (code == 1000 && isday == 0) {
        weatherCodes[1000] = "Clear";
    }

    if (code == 1003 && isday == 1) {
        weatherCodes[1003] = "partly-cloudy-day";
    } else if (code == 1003 && isday == 0) {
        weatherCodes[1003] = "partly-cloudy-night";
    } else {
        weatherCodes[1003] = "partly-cloudy-day";
    }

    weatherCodes[1006] = "Cloudy";
    weatherCodes[1009] = "Cloudy";
    weatherCodes[1087] = "Cloudy";
    weatherCodes[1030] = "Fog";
    weatherCodes[1135] = "Fog";
    weatherCodes[1147] = "Fog";
    weatherCodes[1063] = "Rain";
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

// returns Abbreviation of State name
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

// Formats Date
function dateParse(unparsedData) {
    const rawDate = unparsedData.split('-');
    var parsedDate = parseInt(rawDate[1]) + "/" + parseInt(rawDate[2]);

    return parsedDate;
}

// Sets the Icon based on weather condition
function setIcon(element, weatherCondition) {
    var skycons = new Skycons({ "color:": "white" });
    skycons.add(element, weatherCondition)
    skycons.play();
}