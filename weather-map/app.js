(() => {
  "use strict";

  const API_KEY = "d0e31214037e074afa8957c65b364c19";
  const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";
  const REVERSE_URL = "https://api.openweathermap.org/geo/1.0/reverse";
  const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
  const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
  const LANG_KEY = "skymap-lang";

  const i18n = {
    vi: {
      tagline: "Bản đồ dự báo thời tiết",
      locate: "Vị trí của tôi",
      searchLabel: "Tìm thành phố",
      searchPlaceholder: "Tìm thành phố… (vd: Hà Nội, Tokyo)",
      search: "Tìm",
      mapHint: "Hoặc nhấn vào bản đồ để xem thời tiết tại điểm đó",
      mapBadge: "Nhấn bản đồ để chọn điểm",
      idleTitle: "Chọn một địa điểm",
      idleText:
        "Tìm kiếm thành phố hoặc nhấn vào bản đồ để xem nhiệt độ, độ ẩm và hình ảnh thời tiết.",
      humidity: "Độ ẩm",
      wind: "Gió",
      pressure: "Áp suất",
      visibility: "Tầm nhìn",
      forecastTitle: "Dự báo 5 ngày",
      loading: "Đang tải thời tiết…",
      retry: "Thử lại",
      credit: "Dữ liệu: OpenWeatherMap · Bản đồ: OpenStreetMap",
      feelsLike: (t) => `Cảm giác như ${t}°`,
      updated: (t) => `Cập nhật lúc ${t}`,
      near: "Gần vị trí đã chọn",
      yourLocation: "Vị trí của bạn",
      noResults: "Không tìm thấy địa điểm. Thử tên khác.",
      geoDenied: "Không lấy được vị trí. Hãy cho phép truy cập hoặc tìm thành phố.",
      loadError: "Không tải được dữ liệu thời tiết. Kiểm tra API key hoặc thử lại.",
      invalidKey: "API key không hợp lệ hoặc chưa kích hoạt. Đợi vài phút rồi thử lại.",
      days: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
      moods: {
        rain: "Trời mưa",
        overcast: "Âm u / nhiều mây",
        heat: "Nắng nóng cực độ",
        cold: "Lạnh / có tuyết",
        wind: "Gió mạnh",
        mild: "Thời tiết mát mẻ",
        extreme: "Thời tiết cực đoan",
      },
    },
    en: {
      tagline: "Weather forecast map",
      locate: "My location",
      searchLabel: "Search city",
      searchPlaceholder: "Search a city… (e.g. Hanoi, Tokyo)",
      search: "Search",
      mapHint: "Or tap the map to check weather at that point",
      mapBadge: "Tap the map to pick a spot",
      idleTitle: "Pick a place",
      idleText:
        "Search a city or tap the map to see temperature, humidity, and weather visuals.",
      humidity: "Humidity",
      wind: "Wind",
      pressure: "Pressure",
      visibility: "Visibility",
      forecastTitle: "5-day forecast",
      loading: "Loading weather…",
      retry: "Try again",
      credit: "Data: OpenWeatherMap · Map: OpenStreetMap",
      feelsLike: (t) => `Feels like ${t}°`,
      updated: (t) => `Updated at ${t}`,
      near: "Near selected point",
      yourLocation: "Your location",
      noResults: "No places found. Try another name.",
      geoDenied: "Could not get location. Allow access or search a city.",
      loadError: "Could not load weather data. Check API key or try again.",
      invalidKey: "Invalid or inactive API key. Wait a few minutes and retry.",
      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      moods: {
        rain: "Rainy",
        overcast: "Overcast / cloudy",
        heat: "Extreme heat",
        cold: "Cold / snowy",
        wind: "Strong wind",
        mild: "Pleasant weather",
        extreme: "Severe weather",
      },
    },
  };

  const visuals = {
    rain: `
      <svg viewBox="0 0 72 72" fill="none">
        <path d="M18 34c0-10 8-17 18-17 3-7 10-11 18-9 7 2 11 8 11 15 8 1 14 8 14 16H18z" fill="#B8D4E8" stroke="#6A8FA8" stroke-width="2"/>
        <path d="M26 48v10M36 46v12M46 48v10M56 47v11" stroke="#4A7FA8" stroke-width="3" stroke-linecap="round"/>
        <circle cx="30" cy="42" r="2" fill="#7EB6D9"/>
        <circle cx="42" cy="40" r="2" fill="#7EB6D9"/>
      </svg>`,
    overcast: `
      <svg viewBox="0 0 72 72" fill="none">
        <ellipse cx="28" cy="38" rx="18" ry="12" fill="#C5CED6"/>
        <ellipse cx="44" cy="36" rx="20" ry="14" fill="#AEB8C2"/>
        <ellipse cx="36" cy="42" rx="22" ry="12" fill="#9AA5B0"/>
        <path d="M14 48h44" stroke="#8A96A2" stroke-width="2" stroke-linecap="round" opacity=".5"/>
      </svg>`,
    heat: `
      <svg viewBox="0 0 72 72" fill="none">
        <defs>
          <radialGradient id="heatCore" cx="50%" cy="50%" r="50%">
            <stop stop-color="#FFE566"/>
            <stop offset=".55" stop-color="#FF6B00"/>
            <stop offset="1" stop-color="#D62828"/>
          </radialGradient>
        </defs>
        <circle cx="36" cy="36" r="18" fill="url(#heatCore)"/>
        <path d="M36 8v8M36 56v8M8 36h8M56 36h8M14 14l6 6M52 52l6 6M14 58l6-6M52 20l6-6" stroke="#FF3D00" stroke-width="3" stroke-linecap="round"/>
        <path d="M28 40c2 4 8 6 14 2" stroke="#7A1200" stroke-width="2" stroke-linecap="round" opacity=".55"/>
      </svg>`,
    cold: `
      <svg viewBox="0 0 72 72" fill="none">
        <path d="M36 10v52M14 24l44 24M14 48l44-24" stroke="#7EC8FF" stroke-width="3" stroke-linecap="round"/>
        <path d="M36 18l-6-4M36 18l6-4M36 54l-6 4M36 54l6 4M20 28l-2-7M20 28l-7 2M52 44l2 7M52 44l7-2M20 44l-7-2M20 44l-2 7M52 28l7 2M52 28l2-7" stroke="#B8E4FF" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="36" cy="36" r="5" fill="#E8F6FF" stroke="#5BA8E0" stroke-width="2"/>
      </svg>`,
    wind: `
      <svg viewBox="0 0 72 72" fill="none">
        <path d="M4 48c8-10 16-10 24 0s16 10 24 0 16-10 24 0" stroke="#1A8A8A" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M4 56c8-8 16-8 24 0s16 8 24 0 16-8 24 0" stroke="#5BC0BE" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <path d="M30 34c6-14 22-16 28-4-8 2-14 8-16 16-6-2-10-6-12-12z" fill="#0D7377"/>
        <path d="M44 30c8 2 14 8 16 14" stroke="#2A9D9D" stroke-width="2" stroke-linecap="round"/>
        <circle cx="52" cy="18" r="5" fill="#7EC8C8" opacity=".7"/>
        <path d="M8 22c10 0 14 4 22 2M12 28c8 0 12 3 18 1" stroke="#2A9D9D" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
    mild: `
      <svg viewBox="0 0 72 72" fill="none">
        <circle cx="36" cy="36" r="22" fill="#FFE566"/>
        <circle cx="28" cy="32" r="3.2" fill="#3A2E10"/>
        <circle cx="44" cy="32" r="3.2" fill="#3A2E10"/>
        <path d="M26 42c3 7 17 7 20 0" stroke="#3A2E10" stroke-width="3" stroke-linecap="round"/>
        <circle cx="22" cy="38" r="3" fill="#FFB4A2" opacity=".7"/>
        <circle cx="50" cy="38" r="3" fill="#FFB4A2" opacity=".7"/>
      </svg>`,
    extreme: `
      <svg viewBox="0 0 72 72" fill="none">
        <circle cx="36" cy="36" r="22" fill="#A8B6C4"/>
        <path d="M26 30c2-3 5-3 7 0M39 30c2-3 5-3 7 0" stroke="#334859" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="28" cy="34" r="2.8" fill="#334859"/>
        <circle cx="44" cy="34" r="2.8" fill="#334859"/>
        <path d="M28 46c4-5 12-5 16 0" stroke="#334859" stroke-width="3" stroke-linecap="round"/>
        <path d="M48 14l4 10 10 2-8 7 2 10-8-5-8 5 2-10-8-7 10-2z" fill="#E85D4C" opacity=".9"/>
      </svg>`,
  };

  const faces = {
    mild: "😊",
    rain: "🌧",
    overcast: "☁",
    heat: "🥵",
    cold: "❄",
    wind: "🌬",
    extreme: "😢",
  };

  const dayIcons = {
    clear: "☀",
    cloud: "☁",
    rain: "🌧",
    snow: "❄",
    storm: "⛈",
    fog: "🌫",
  };

  let lang = localStorage.getItem(LANG_KEY) || "vi";
  let map;
  let marker;
  let lastCoords = null;
  let searchTimer = null;
  let abortCtrl = null;

  const el = {
    searchForm: document.getElementById("searchForm"),
    searchInput: document.getElementById("searchInput"),
    suggestions: document.getElementById("suggestions"),
    locateBtn: document.getElementById("locateBtn"),
    panelIdle: document.getElementById("panelIdle"),
    panelContent: document.getElementById("panelContent"),
    panelLoading: document.getElementById("panelLoading"),
    panelError: document.getElementById("panelError"),
    errorText: document.getElementById("errorText"),
    retryBtn: document.getElementById("retryBtn"),
    moodVisual: document.getElementById("moodVisual"),
    moodLabel: document.getElementById("moodLabel"),
    moodFace: document.getElementById("moodFace"),
    placeName: document.getElementById("placeName"),
    placeMeta: document.getElementById("placeMeta"),
    tempValue: document.getElementById("tempValue"),
    owmIcon: document.getElementById("owmIcon"),
    conditionText: document.getElementById("conditionText"),
    feelsLike: document.getElementById("feelsLike"),
    humidityValue: document.getElementById("humidityValue"),
    windValue: document.getElementById("windValue"),
    pressureValue: document.getElementById("pressureValue"),
    visibilityValue: document.getElementById("visibilityValue"),
    forecastRow: document.getElementById("forecastRow"),
    updatedAt: document.getElementById("updatedAt"),
    fxLayer: document.getElementById("fxLayer"),
    mapBadge: document.getElementById("mapBadge"),
  };

  function t(key) {
    return i18n[lang][key];
  }

  function apiLang() {
    return lang === "vi" ? "vi" : "en";
  }

  function applyI18n() {
    document.documentElement.lang = lang;
    document.body.dataset.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.dataset.i18n;
      const value = t(key);
      if (typeof value === "string") node.textContent = value;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      node.placeholder = t(node.dataset.i18nPlaceholder);
    });

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
    });
  }

  function setLang(next) {
    lang = next;
    localStorage.setItem(LANG_KEY, lang);
    applyI18n();
    if (lastCoords) {
      fetchWeather(lastCoords.lat, lastCoords.lon, lastCoords.label, lastCoords.meta);
    }
  }

  function showState(state) {
    el.panelIdle.hidden = state !== "idle";
    el.panelContent.hidden = state !== "content";
    el.panelLoading.hidden = state !== "loading";
    el.panelError.hidden = state !== "error";
  }

  /** OpenWeatherMap condition id groups: https://openweathermap.org/weather-conditions */
  function classifyMood(weather, windMs, tempC) {
    const id = weather.id;
    const main = (weather.main || "").toLowerCase();
    const windKmh = windMs * 3.6;

    const isThunder = id >= 200 && id < 300;
    const isDrizzle = id >= 300 && id < 400;
    const isRain = id >= 500 && id < 600;
    const isSnow = id >= 600 && id < 700;
    const isAtmosphere = id >= 700 && id < 800;
    const isClouds = id >= 801 && id <= 804;
    const isExtremeExtra = [781, 771, 762, 761].includes(id);

    if (isThunder || isExtremeExtra || main === "tornado") return "extreme";
    if (tempC >= 35) return "heat";
    if (isSnow || tempC <= 5) return "cold";
    if (windKmh >= 35) return "wind";
    if (isRain || isDrizzle) return "rain";
    if (isClouds || isAtmosphere || id === 804) return "overcast";
    return "mild";
  }

  function dayIconFromId(id) {
    if (id >= 200 && id < 300) return dayIcons.storm;
    if (id >= 600 && id < 700) return dayIcons.snow;
    if ((id >= 300 && id < 400) || (id >= 500 && id < 600)) return dayIcons.rain;
    if (id >= 700 && id < 800) return dayIcons.fog;
    if (id >= 801 && id <= 804) return dayIcons.cloud;
    return dayIcons.clear;
  }

  function spawnFx(theme) {
    el.fxLayer.innerHTML = "";
    const count =
      theme === "rain" ? 42 :
      theme === "cold" ? 28 :
      theme === "heat" ? 22 :
      theme === "wind" ? 14 : 0;

    if (!count) return;

    for (let i = 0; i < count; i++) {
      const node = document.createElement("span");
      const left = Math.random() * 100;
      const delay = Math.random() * 4;
      const duration = 1.6 + Math.random() * 2.8;

      if (theme === "rain") {
        node.className = "fx-drop";
        node.style.left = `${left}%`;
        node.style.animationDuration = `${0.7 + Math.random()}s`;
        node.style.animationDelay = `${delay}s`;
      } else if (theme === "cold") {
        node.className = "fx-flake";
        node.textContent = "❄";
        node.style.left = `${left}%`;
        node.style.fontSize = `${10 + Math.random() * 10}px`;
        node.style.animationDuration = `${duration + 2}s`;
        node.style.animationDelay = `${delay}s`;
      } else if (theme === "heat") {
        node.className = "fx-ember";
        node.style.left = `${left}%`;
        node.style.animationDuration = `${duration + 1}s`;
        node.style.animationDelay = `${delay}s`;
      } else if (theme === "wind") {
        node.className = "fx-gust";
        node.style.top = `${10 + Math.random() * 75}%`;
        node.style.animationDuration = `${1.2 + Math.random() * 1.8}s`;
        node.style.animationDelay = `${delay}s`;
      }

      el.fxLayer.appendChild(node);
    }
  }

  function setTheme(theme) {
    document.body.dataset.theme = theme;
    spawnFx(theme);
  }

  function pinIcon() {
    return L.divIcon({
      className: "custom-pin",
      html: `<div style="
        width:28px;height:28px;border-radius:50% 50% 50% 0;
        background:linear-gradient(135deg,#1f7ab8,#3ba7e8);
        transform:rotate(-45deg);
        border:3px solid #fff;
        box-shadow:0 8px 16px rgba(20,70,120,.35);
      "></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });
  }

  function placeMarker(lat, lon) {
    if (marker) {
      marker.setLatLng([lat, lon]);
    } else {
      marker = L.marker([lat, lon], { icon: pinIcon() }).addTo(map);
    }
    map.flyTo([lat, lon], Math.max(map.getZoom(), 8), { duration: 0.8 });
  }

  async function reverseLabel(lat, lon) {
    try {
      const url = `${REVERSE_URL}?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("geo");
      const data = await res.json();
      const item = data[0];
      if (!item) {
        return { label: t("near"), meta: `${lat.toFixed(2)}, ${lon.toFixed(2)}` };
      }
      return {
        label: item.name || t("near"),
        meta: [item.state, item.country].filter(Boolean).join(" · "),
      };
    } catch {
      return { label: t("near"), meta: `${lat.toFixed(2)}, ${lon.toFixed(2)}` };
    }
  }

  async function searchPlaces(query) {
    const url = `${GEO_URL}?q=${encodeURIComponent(query)}&limit=6&appid=${API_KEY}`;
    const res = await fetch(url);
    if (res.status === 401) {
      const err = new Error("invalidKey");
      err.code = 401;
      throw err;
    }
    if (!res.ok) throw new Error("search");
    return (await res.json()) || [];
  }

  function renderSuggestions(results) {
    if (!results.length) {
      el.suggestions.hidden = true;
      el.suggestions.innerHTML = "";
      return;
    }

    el.suggestions.innerHTML = results
      .map((item, index) => {
        const meta = [item.state, item.country].filter(Boolean).join(", ");
        return `<li>
          <button type="button" data-index="${index}">
            <span>${item.name}</span>
            <span class="sub">${meta}</span>
          </button>
        </li>`;
      })
      .join("");

    el.suggestions.hidden = false;
    el.suggestions.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = results[Number(btn.dataset.index)];
        el.suggestions.hidden = true;
        el.searchInput.value = item.name;
        selectPlace(
          item.lat,
          item.lon,
          item.name,
          [item.state, item.country].filter(Boolean).join(" · ")
        );
      });
    });
  }

  function groupForecastByDay(list) {
    const byDay = new Map();

    list.forEach((item) => {
      const date = item.dt_txt.slice(0, 10);
      if (!byDay.has(date)) byDay.set(date, []);
      byDay.get(date).push(item);
    });

    const days = [];
    for (const [date, items] of byDay) {
      const temps = items.map((i) => i.main.temp);
      const noon =
        items.find((i) => i.dt_txt.includes("12:00:00")) ||
        items[Math.floor(items.length / 2)];

      days.push({
        date,
        max: Math.max(...temps),
        min: Math.min(...temps),
        weather: noon.weather[0],
      });
    }

    return days.slice(0, 5);
  }

  async function fetchWeather(lat, lon, label, meta) {
    lastCoords = { lat, lon, label, meta };
    placeMarker(lat, lon);
    showState("loading");

    if (abortCtrl) abortCtrl.abort();
    abortCtrl = new AbortController();

    const common = `lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${apiLang()}`;

    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`${WEATHER_URL}?${common}`, { signal: abortCtrl.signal }),
        fetch(`${FORECAST_URL}?${common}`, { signal: abortCtrl.signal }),
      ]);

      if (weatherRes.status === 401 || forecastRes.status === 401) {
        el.errorText.textContent = t("invalidKey");
        showState("error");
        return;
      }

      if (!weatherRes.ok || !forecastRes.ok) throw new Error("weather");

      const weather = await weatherRes.json();
      const forecast = await forecastRes.json();
      renderWeather(weather, forecast, label, meta);
      showState("content");
    } catch (err) {
      if (err.name === "AbortError") return;
      el.errorText.textContent = t("loadError");
      showState("error");
    }
  }

  function owmIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  function renderWeather(weather, forecast, label, meta) {
    const w = weather.weather[0];
    const temp = weather.main.temp;
    const windMs = weather.wind?.speed || 0;
    const mood = classifyMood(w, windMs, temp);

    setTheme(mood);

    el.moodVisual.innerHTML = visuals[mood];
    el.moodLabel.textContent = i18n[lang].moods[mood];
    el.moodFace.textContent = faces[mood];

    el.placeName.textContent = label || weather.name || t("near");
    el.placeMeta.textContent =
      meta ||
      `${lastCoords.lat.toFixed(2)}, ${lastCoords.lon.toFixed(2)}`;

    el.tempValue.textContent = `${Math.round(temp)}°`;
    if (w.icon) {
      el.owmIcon.src = owmIconUrl(w.icon);
      el.owmIcon.alt = w.description || w.main || "";
      el.owmIcon.hidden = false;
    } else {
      el.owmIcon.hidden = true;
    }

    el.conditionText.textContent = w.description
      ? w.description.charAt(0).toUpperCase() + w.description.slice(1)
      : w.main;
    el.feelsLike.textContent = t("feelsLike")(Math.round(weather.main.feels_like));

    el.humidityValue.textContent = `${Math.round(weather.main.humidity)}%`;
    el.windValue.textContent = `${Math.round(windMs * 3.6)} km/h`;
    el.pressureValue.textContent = `${Math.round(weather.main.pressure)} hPa`;

    const visKm = (weather.visibility ?? 10000) / 1000;
    el.visibilityValue.textContent =
      visKm >= 10 ? `${Math.round(visKm)} km` : `${visKm.toFixed(1)} km`;

    const days = groupForecastByDay(forecast.list || []);
    el.forecastRow.innerHTML = days
      .map((day) => {
        const d = new Date(day.date + "T12:00:00");
        const dayName = i18n[lang].days[d.getDay()];
        const icon = day.weather.icon
          ? `<img src="${owmIconUrl(day.weather.icon)}" alt="" width="36" height="36" />`
          : dayIconFromId(day.weather.id);
        return `<div class="day-card">
          <div class="d">${dayName}</div>
          <div class="ico">${icon}</div>
          <div class="t">${Math.round(day.max)}° / ${Math.round(day.min)}°</div>
        </div>`;
      })
      .join("");

    const now = new Date();
    const timeStr = now.toLocaleTimeString(lang === "vi" ? "vi-VN" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    el.updatedAt.textContent = t("updated")(timeStr);
    el.mapBadge.textContent = label || weather.name;
  }

  async function selectPlace(lat, lon, label, meta) {
    await fetchWeather(lat, lon, label, meta || t("near"));
  }

  function initMap() {
    map = L.map("map", {
      zoomControl: true,
      attributionControl: true,
    }).setView([16.0, 106.5], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      showState("loading");
      const info = await reverseLabel(lat, lng);
      await fetchWeather(lat, lng, info.label, info.meta);
    });

    setTimeout(() => map.invalidateSize(), 100);
  }

  function bindEvents() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });

    el.searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const q = el.searchInput.value.trim();
      if (q.length < 2) return;

      try {
        const results = await searchPlaces(q);
        if (!results.length) {
          el.errorText.textContent = t("noResults");
          showState("error");
          el.suggestions.hidden = true;
          return;
        }
        const first = results[0];
        el.suggestions.hidden = true;
        await selectPlace(
          first.lat,
          first.lon,
          first.name,
          [first.state, first.country].filter(Boolean).join(" · ")
        );
      } catch (err) {
        el.errorText.textContent =
          err.code === 401 ? t("invalidKey") : t("loadError");
        showState("error");
      }
    });

    el.searchInput.addEventListener("input", () => {
      const q = el.searchInput.value.trim();
      clearTimeout(searchTimer);
      if (q.length < 2) {
        el.suggestions.hidden = true;
        return;
      }
      searchTimer = setTimeout(async () => {
        try {
          const results = await searchPlaces(q);
          renderSuggestions(results);
        } catch {
          el.suggestions.hidden = true;
        }
      }, 320);
    });

    document.addEventListener("click", (e) => {
      if (!el.suggestions.contains(e.target) && e.target !== el.searchInput) {
        el.suggestions.hidden = true;
      }
    });

    el.locateBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        el.errorText.textContent = t("geoDenied");
        showState("error");
        return;
      }
      showState("loading");
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const info = await reverseLabel(latitude, longitude);
          await fetchWeather(
            latitude,
            longitude,
            info.label === t("near") ? t("yourLocation") : info.label,
            info.meta
          );
        },
        () => {
          el.errorText.textContent = t("geoDenied");
          showState("error");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

    el.retryBtn.addEventListener("click", () => {
      if (lastCoords) {
        fetchWeather(lastCoords.lat, lastCoords.lon, lastCoords.label, lastCoords.meta);
      } else {
        showState("idle");
      }
    });
  }

  applyI18n();
  initMap();
  bindEvents();
  showState("idle");

  // Tải sẵn Hà Nội để kiểm tra API OpenWeatherMap ngay khi mở app
  selectPlace(21.0285, 105.8542, "Hà Nội", "VN");
})();
