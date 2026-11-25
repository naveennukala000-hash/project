import React, { useState, useEffect } from "react";
import {
  CloudSun, Sun, Cloud, CloudRain, Wind, Droplets,
  Thermometer, Gauge, Search, LogOut, Users
} from "lucide-react";
import "./App.css";

const ADMIN_EMAIL = "admin@skycast.com";
const ADMIN_PASSWORD = "Admin@123";

// FAMOUS INDIAN CITY LANDMARKS
const landmarks = {
  vijayawada: "Prakasam Barrage",
  visakhapatnam: "Kailasagiri Beach View",
  vizag: "Kailasagiri Beach View",
  tirupati: "Sri Venkateswara Temple",
  amaravati: "Amaravati Buddha Statue",
  nellore: "Nellapattu Bird Sanctuary",
  kurnool: "Konda Reddy Fort",
  rajahmundry: "Godavari Bridge",
  guntur: "Amaravati Stupa",
  hyderabad: "Charminar",
  warangal: "Warangal Fort",
  karimnagar: "Elgandal Fort",
  chennai: "Marina Beach",
  madurai: "Meenakshi Amman Temple",
  coimbatore: "Marudhamalai Temple",
  ooty: "Ooty Botanical Garden",
  thanjavur: "Brihadeeswara Temple",
  bengaluru: "Vidhana Soudha",
  bangalore: "Vidhana Soudha",
  mysuru: "Mysore Palace",
  mysore: "Mysore Palace",
  hampi: "Hampi Stone Chariot",
  mangaluru: "Panambur Beach",
  kochi: "Chinese Fishing Nets",
  cochin: "Chinese Fishing Nets",
  thiruvananthapuram: "Padmanabhaswamy Temple",
  trivandrum: "Padmanabhaswamy Temple",
  alappuzha: "Alleppey Backwaters",
  munnar: "Munnar Tea Gardens",
  mumbai: "Gateway of India",
  pune: "Shaniwar Wada",
  nashik: "Trimbakeshwar Temple",
  aurangabad: "Ajanta Caves",
  nagpur: "Deekshabhoomi",
  delhi: "India Gate",
  "new delhi": "India Gate",
  agra: "Taj Mahal",
  jaipur: "Hawa Mahal",
  udaipur: "Lake Palace",
  jodhpur: "Mehrangarh Fort",
  varanasi: "Dashashwamedh Ghat",
  amritsar: "Golden Temple",
  lucknow: "Bara Imambara",
  shimla: "Christ Church",
  manali: "Hidimba Devi Temple",
  rishikesh: "Lakshman Jhula",
  haridwar: "Har Ki Pauri",
  chandigarh: "Rock Garden",
  ahmedabad: "Sabarmati Riverfront",
  surat: "Dumas Beach",
  vadodara: "Laxmi Vilas Palace",
  rajkot: "Kaba Gandhi No Delo",
  goa: "Basilica of Bom Jesus",
  panaji: "Our Lady of the Immaculate Conception Church",
  kolkata: "Victoria Memorial",
  darjeeling: "Darjeeling Himalayan Railway",
  bhubaneswar: "Lingaraj Temple",
  puri: "Jagannath Temple",
  guwahati: "Kamakhya Temple",
  shillong: "Umiam Lake",
  gangtok: "Rumtek Monastery",
  patna: "Golghar",
  ranchi: "Hundru Falls",
  leh: "Shanti Stupa",
  srinagar: "Dal Lake",
  kozhikode: "Kozhikode Beach",
  thrissur: "Vadakkunnathan Temple"
};

// WEATHER CONDITION
function getWeather(code) {
  if (code === 0) return ["Clear Sky", Sun];
  if (code <= 3) return ["Cloudy", Cloud];
  if (code <= 48) return ["Foggy", Cloud];
  if (code <= 67 || (code >= 80 && code <= 82))
    return ["Rainy", CloudRain];
  if (code >= 71 && code <= 77)
    return ["Snowy", Cloud];
  if (code >= 95)
    return ["Thunderstorm", CloudRain];

  return ["Partly Cloudy", CloudSun];
}

// LANDMARK IMAGE SEARCH
async function getLandmarkImage(cityName) {
  const key = cityName.toLowerCase().trim();
  const landmark = landmarks[key];

  if (!landmark) {
    return {
      place: `Famous places in ${cityName}`,
      image: ""
    };
  }

  try {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: `${landmark} ${cityName}`,
      gsrnamespace: "6",
      gsrlimit: "10",
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "1600",
      format: "json",
      origin: "*"
    });

    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?${params}`
    );

    if (!response.ok) {
      throw new Error("Image search failed");
    }

    const data = await response.json();
    const pages = Object.values(data.query?.pages || {});

    const validImage = pages.find(page =>
      page.imageinfo?.[0]?.thumburl ||
      page.imageinfo?.[0]?.url
    );

    if (!validImage) {
      throw new Error("Image not found");
    }

    return {
      place: landmark,
      image:
        validImage.imageinfo[0].thumburl ||
        validImage.imageinfo[0].url
    };

  } catch (error) {
    console.error("Landmark image error:", error);

    return {
      place: landmark,
      image: ""
    };
  }
}

export default function App() {

  // USER AND SESSION DATA
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("skycastUser") || "null"
      );
    } catch {
      return null;
    }
  });

  const [users, setUsers] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("skycastUsers") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // WEATHER DATA
  const [cityInput, setCityInput] = useState("Hyderabad");
  const [city, setCity] = useState("Hyderabad");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [place, setPlace] = useState("Charminar");
  const [background, setBackground] = useState("");
  const [loading, setLoading] = useState(false);

  // SAVE USERS
  function saveUsers(list) {
    localStorage.setItem(
      "skycastUsers",
      JSON.stringify(list)
    );
    setUsers(list);
  }

  // LOGIN
  function login(account) {
    sessionStorage.setItem(
      "skycastUser",
      JSON.stringify(account)
    );
    setUser(account);
  }

  // LOGOUT
  function logout() {
    sessionStorage.removeItem("skycastUser");
    setUser(null);
    setError("");
    setPassword("");
  }

  // USER AND ADMIN AUTHENTICATION
  function handleAuth(e) {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (role === "admin") {
      if (
        cleanEmail === ADMIN_EMAIL &&
        password === ADMIN_PASSWORD
      ) {
        login({
          name: "Administrator",
          email: cleanEmail,
          role: "admin"
        });
      } else {
        setError("Incorrect admin email or password.");
      }
      return;
    }

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }

      if (password.length < 6) {
        setError("Password must have at least 6 characters.");
        return;
      }

      if (users.some(u => u.email === cleanEmail)) {
        setError("Email already registered.");
        return;
      }

      const newUser = {
        name: name.trim(),
        email: cleanEmail,
        password
      };

      saveUsers([...users, newUser]);

      login({
        name: newUser.name,
        email: cleanEmail,
        role: "user"
      });

    } else {
      const found = users.find(
        u => u.email === cleanEmail &&
             u.password === password
      );

      if (!found) {
        setError("Invalid login. Please sign up first.");
        return;
      }

      login({
        name: found.name,
        email: found.email,
        role: "user"
      });
    }
  }

  // WEATHER SEARCH
  async function searchWeather(e) {
    if (e) e.preventDefault();

    if (!cityInput.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityInput.trim())}&count=1&language=en&format=json`
      );

      if (!geoResponse.ok) {
        throw new Error("City search failed.");
      }

      const geoData = await geoResponse.json();

      if (!geoData.results?.length) {
        throw new Error("City not found.");
      }

      const location = geoData.results[0];

      const params = new URLSearchParams({
        latitude: location.latitude,
        longitude: location.longitude,
        current:
          "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,precipitation",
        daily:
          "weather_code,temperature_2m_max,temperature_2m_min",
        timezone: "auto",
        forecast_days: "7"
      });

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params}`
      );

      if (!response.ok) {
        throw new Error("Weather service unavailable.");
      }

      const data = await response.json();

      setWeather(data.current);
      setForecast(data.daily);
      setCity(location.name);
      setCityInput(location.name);

      const landmarkData = await getLandmarkImage(
        location.name
      );

      setPlace(landmarkData.place);
      setBackground(landmarkData.image);

    } catch (err) {
      setError(
        err.message || "Unable to get weather information."
      );
    } finally {
      setLoading(false);
    }
  }

  // LOAD DEFAULT CITY
  useEffect(() => {
    if (user?.role === "user") {
      searchWeather();
    }
  }, [user]);

  // ADMIN REMOVE USER
  function removeUser(emailToRemove) {
    const updated = users.filter(
      u => u.email !== emailToRemove
    );
    saveUsers(updated);
  }

  // MODERN USER AND ADMIN LOGIN PAGE
  if (!user) {
    return (
      <div className="new-login-page">

        <div className="login-left">

          <div className="brand">
            <CloudSun size={45} />
            <h2>SkyCast</h2>
          </div>

          <div className="hero-content">
            <span className="hero-tag">
              YOUR WEATHER COMPANION
            </span>

            <h1>
              Weather changes.
              <br />
              Stay prepared.
            </h1>

            <p>
              Discover real-time weather updates,
              explore famous places and plan your day
              with SkyCast.
            </p>

            <div className="hero-weather">
              <Sun size={65} />

              <div>
                <h2>Explore the world</h2>
                <p>Weather at your fingertips</p>
              </div>
            </div>
          </div>

          <p className="left-footer">
            © 2026 SkyCast Weather Application
          </p>

        </div>

        <div className="login-right">

          <div className="new-login-box">

            <div className="mobile-logo">
              <CloudSun size={40} />
            </div>

            <span className="welcome-label">
              WELCOME TO SKYCAST
            </span>

            <h1>
              {role === "admin"
                ? "Admin Login"
                : mode === "signup"
                ? "Create Account"
                : ""}
            </h1>

            <p className="login-description">
              {role === "admin"
                ? "Access your administrator dashboard."
                : mode === "signup"
                ? "Create your account to get started."
                : "Login to explore weather around the world."}
            </p>

            <div className="role-switch">

              <button
                type="button"
                className={
                  role === "user" ? "active-role" : ""
                }
                onClick={() => {
                  setRole("user");
                  setMode("login");
                  setError("");
                }}
              >
                <Users size={17} />
                User
              </button>

              <button
                type="button"
                className={
                  role === "admin" ? "active-role" : ""
                }
                onClick={() => {
                  setRole("admin");
                  setError("");
                }}
              >
                <Gauge size={17} />
                Admin
              </button>

            </div>

            {role === "user" && (
              <div className="form-switch">

                <button
                  type="button"
                  className={
                    mode === "login" ? "selected-form" : ""
                  }
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                >
                  Login
                </button>

                <button
                  type="button"
                  className={
                    mode === "signup" ? "selected-form" : ""
                  }
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                >
                  Sign Up
                </button>

              </div>
            )}

            <form
              onSubmit={handleAuth}
              className="modern-form"
            >

              {role === "user" && mode === "signup" && (
                <div className="input-group">
                  <label>Full Name</label>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="input-group">
                <label>Email Address</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Password</label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="error">{error}</p>
              )}

              <button
                type="submit"
                className="modern-submit"
              >
                {role === "admin"
                  ? "Login as Admin"
                  : mode === "signup"
                  ? "Create Account"
                  : "Login to SkyCast"}
              </button>

            </form>

            {role === "admin" && (
              <div className="admin-hint">
                <p>Demo Admin Credentials</p>
                <small>Email: admin@skycast.com</small>
                <small>Password: Admin@123</small>
              </div>
            )}

            <p className="login-bottom">
              Powered by SkyCast Weather
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ADMIN DASHBOARD
  if (user.role === "admin") {
    return (
      <div className="admin-page">

        <header>
          <h2>SkyCast Admin Dashboard</h2>
          <button onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </header>

        <h1>Welcome, Admin</h1>

        <div className="admin-card">
          <Users size={30} />
          <h2>Registered Users: {users.length}</h2>
        </div>

        <h2>User Management</h2>

        {users.length === 0 && (
          <p>No registered users.</p>
        )}

        {users.map(u => (
          <div className="user-row" key={u.email}>
            <span>
              {u.name} — {u.email}
            </span>

            <button onClick={() => removeUser(u.email)}>
              Remove
            </button>
          </div>
        ))}

      </div>
    );
  }

  // WEATHER DASHBOARD
  const [condition, WeatherIcon] = weather
    ? getWeather(weather.weather_code)
    : ["Loading...", CloudSun];

  return (
    <div className="weather-page">

      <header>
        <h2><CloudSun /> SkyCast</h2>

        <span>Welcome, {user.name}</span>

        <button onClick={logout}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      <main>

        <h1>Weather Forecast</h1>

        <p>
          Search your favourite city and explore its weather.
        </p>

        <form
          className="search-bar"
          onSubmit={searchWeather}
        >
          <Search />

          <input
            value={cityInput}
            onChange={e => setCityInput(e.target.value)}
            placeholder="Enter city name"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <div
          className="weather-banner"
          style={{
            backgroundImage: background
              ? `linear-gradient(#0007,#0009),url("${background}")`
              : "linear-gradient(135deg,#244c78,#142f52)"
          }}
        >

          <div>
            <p>Current Weather</p>
            <h2>{city}</h2>
            <h3>{place}</h3>

            {weather && (
              <>
                <div className="big-temp">
                  {Math.round(weather.temperature_2m)}°C
                </div>
                <p>{condition}</p>
              </>
            )}
          </div>

          <WeatherIcon size={85} />

        </div>

        <h2>Weather Details</h2>

        <div className="details">

          <div className="detail-card">
            <Thermometer />
            <p>Feels Like</p>
            <h2>
              {weather
                ? `${weather.apparent_temperature}°C`
                : "--"}
            </h2>
          </div>

          <div className="detail-card">
            <Droplets />
            <p>Humidity</p>
            <h2>
              {weather
                ? `${weather.relative_humidity_2m}%`
                : "--"}
            </h2>
          </div>

          <div className="detail-card">
            <Wind />
            <p>Wind Speed</p>
            <h2>
              {weather
                ? `${weather.wind_speed_10m} km/h`
                : "--"}
            </h2>
          </div>

          <div className="detail-card">
            <Gauge />
            <p>Pressure</p>
            <h2>
              {weather
                ? `${weather.surface_pressure} hPa`
                : "--"}
            </h2>
          </div>

          <div className="detail-card">
            <CloudRain />
            <p>Precipitation</p>
            <h2>
              {weather
                ? `${weather.precipitation} mm`
                : "--"}
            </h2>
          </div>

        </div>

        <h2>7-Day Forecast</h2>

        <div className="forecast">

          {forecast?.time.map((day, i) => {
            const [dayCondition, DayIcon] =
              getWeather(forecast.weather_code[i]);

            return (
              <div className="forecast-card" key={day}>

                <h4>
                  {i === 0
                    ? "Today"
                    : new Date(day + "T12:00:00")
                        .toLocaleDateString("en", {
                          weekday: "short"
                        })}
                </h4>

                <DayIcon size={30} />

                <h3>
                  {Math.round(
                    forecast.temperature_2m_max[i]
                  )}°
                </h3>

                <p>
                  {Math.round(
                    forecast.temperature_2m_min[i]
                  )}°
                </p>

                <small>{dayCondition}</small>

              </div>
            );
          })}

        </div>

      </main>
    </div>
  );
}