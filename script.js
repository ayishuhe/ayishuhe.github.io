(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const els = {
    targetYear: $("targetYear"),
    days: $("days"),
    hours: $("hours"),
    minutes: $("minutes"),
    seconds: $("seconds"),
    targetDate: $("targetDate"),
    progressLabel: $("progressLabel"),
    progressPercent: $("progressPercent"),
    progressBar: $("progressBar"),
    totalDays: $("totalDays"),
    years: $("years"),
    reset: $("resetBtn"),
    lunarInfo: $("lunarInfo"),
    lunarDate: $("lunarDate"),
    lunarHour: $("lunarHour"),
    springCountdown: $("springCountdown"),
    clock: document.querySelector(".clock"),
    heroPrefix: $("heroPrefix"),
    heroSub: $("heroSub"),
    heroSuffix: $("heroSuffix"),
    preview: $("previewBtn"),
    celebrate: $("celebrate"),
    celebrateYear: $("celebrateYear"),
    again: $("againBtn"),
    closeCelebrate: $("closeCelebrate"),
  };

  const now = new Date();
  const BASE_YEAR = now.getFullYear();
  const YEAR_SPAN = 99;
  const DAY_MS = 86400000;
  const nf = new Intl.NumberFormat("zh-CN");

  /* 2026—2225 年春节公历日期（正月初一），MMDD */
  const SPRING_START_YEAR = 2026;
  const SPRING_MMDD = [
    "0217", "0206", "0126", "0213", "0203", "0123", "0211", "0131", "0219", "0208", // 2026-2035
    "0128", "0215", "0204", "0124", "0212", "0201", "0122", "0210", "0130", "0217", // 2036-2045
    "0206", "0126", "0214", "0202", "0123", "0211", "0201", "0219", "0208", "0128", // 2046-2055
    "0215", "0204", "0124", "0212", "0202", "0121", "0209", "0129", "0217", "0205", // 2056-2065
    "0126", "0214", "0203", "0123", "0211", "0131", "0219", "0207", "0127", "0215", // 2066-2075
    "0205", "0124", "0212", "0202", "0122", "0209", "0129", "0217", "0206", "0126", // 2076-2085
    "0214", "0203", "0124", "0210", "0130", "0218", "0207", "0127", "0215", "0205", // 2086-2095
    "0125", "0212", "0201", "0121", "0209", "0129", "0217", "0207", "0128", "0215", // 2096-2105
    "0204", "0124", "0212", "0131", "0219", "0208", "0129", "0216", "0206", "0126", // 2106-2115
    "0214", "0202", "0122", "0210", "0130", "0217", "0207", "0127", "0215", "0203", // 2116-2125
    "0123", "0211", "0201", "0219", "0208", "0129", "0217", "0205", "0125", "0213", // 2126-2135
    "0202", "0122", "0210", "0130", "0218", "0207", "0127", "0215", "0204", "0123", // 2136-2145
    "0211", "0201", "0220", "0208", "0129", "0216", "0205", "0125", "0212", "0202", // 2146-2155
    "0123", "0210", "0130", "0218", "0207", "0126", "0214", "0203", "0124", "0211", // 2156-2165
    "0201", "0220", "0209", "0128", "0216", "0205", "0125", "0212", "0202", "0123", // 2166-2175
    "0211", "0130", "0218", "0207", "0127", "0214", "0203", "0124", "0212", "0131", // 2176-2185
    "0121", "0208", "0128", "0215", "0205", "0125", "0213", "0202", "0122", "0210", // 2186-2195
    "0130", "0217", "0206", "0127", "0215", "0204", "0125", "0213", "0202", "0220", // 2196-2205
    "0209", "0129", "0217", "0206", "0126", "0214", "0204", "0123", "0210", "0130", // 2206-2215
    "0218", "0207", "0128", "0216", "0205", "0124", "0212", "0201", "0220", "0208", // 2216-2225
  ];

  let firstTargetYear = BASE_YEAR + 1;
  let lastTargetYear = firstTargetYear + YEAR_SPAN - 1;
  let selectedYear = firstTargetYear;
  let lastSecond = -1;
  let lastTargetSeconds = null;
  let celebrated = false;
  let onGreetingDay = false;
  let greetingPreview = false;
  let greetingPreviewTimer = 0;
  const cards = [];

  const pad = (value) => String(value).padStart(2, "0");

  /* ---------- 农历（1900—2100 数据表） ---------- */

  const LUNAR_INFO = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900-1909
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910-1919
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920-1929
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930-1939
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940-1949
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950-1959
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960-1969
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, // 1970-1979
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980-1989
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0, // 1990-1999
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000-2009
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010-2019
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020-2029
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030-2039
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, // 2040-2049
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, // 2050-2059
    0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, // 2060-2069
    0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, // 2070-2079
    0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, // 2080-2089
    0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a4d0, 0x0d150, 0x0f252, // 2090-2099
    0x0d520, // 2100
  ];

  const LUNAR_DAYS = [
    "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
    "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十",
  ];
  const LUNAR_MONTHS = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
  const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const HOUR_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

  const springCache = new Map();
  let lunarDateKey = "";

  function leapMonth(year) {
    return LUNAR_INFO[year - 1900] & 0xf;
  }

  function leapDays(year) {
    return leapMonth(year) ? (LUNAR_INFO[year - 1900] & 0x10000 ? 30 : 29) : 0;
  }

  function monthDays(year, month) {
    return LUNAR_INFO[year - 1900] & (0x10000 >> month) ? 30 : 29;
  }

  function lunarYearDays(year) {
    let days = 348;
    const info = LUNAR_INFO[year - 1900];
    for (let bit = 0x8000; bit > 0x8; bit >>= 1) {
      if (info & bit) days += 1;
    }
    return days + leapDays(year);
  }

  function solarToLunar(date) {
    const year = date.getFullYear();
    if (year < 1900 || year > 2100) return null;

    const month = date.getMonth() + 1;
    const day = date.getDate();
    let offset = Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(1900, 0, 31)) / DAY_MS);
    if (offset < 0) return null;

    let lunarYear = 1900;
    let temp = 0;
    while (lunarYear < 2101 && offset > 0) {
      temp = lunarYearDays(lunarYear);
      offset -= temp;
      lunarYear += 1;
    }
    if (offset < 0) {
      offset += temp;
      lunarYear -= 1;
    }

    const leap = leapMonth(lunarYear);
    let isLeap = false;
    let lunarMonth = 1;

    for (lunarMonth = 1; lunarMonth < 13 && offset > 0; lunarMonth += 1) {
      if (leap > 0 && lunarMonth === leap + 1 && !isLeap) {
        lunarMonth -= 1;
        isLeap = true;
        temp = leapDays(lunarYear);
      } else {
        temp = monthDays(lunarYear, lunarMonth);
      }
      if (isLeap && lunarMonth === leap + 1) isLeap = false;
      offset -= temp;
    }

    if (offset === 0 && leap > 0 && lunarMonth === leap + 1) {
      if (isLeap) {
        isLeap = false;
      } else {
        isLeap = true;
        lunarMonth -= 1;
      }
    }
    if (offset < 0) {
      offset += temp;
      lunarMonth -= 1;
    }

    return { year: lunarYear, month: lunarMonth, day: offset + 1, isLeap };
  }

  function lunarYearName(year) {
    return `${GAN[(year - 4) % 10]}${ZHI[(year - 4) % 12]}`;
  }

  function springFestivalOf(year) {
    if (springCache.has(year)) return springCache.get(year);

    let result = null;
    const index = year - SPRING_START_YEAR;

    if (index >= 0 && index < SPRING_MMDD.length) {
      const mmdd = SPRING_MMDD[index];
      result = new Date(year, Number(mmdd.slice(0, 2)) - 1, Number(mmdd.slice(2)), 0, 0, 0, 0);
    } else {
      for (let offset = 0; offset < 45; offset += 1) {
        const lunar = solarToLunar(new Date(year, 0, 15 + offset, 12));
        if (lunar && lunar.month === 1 && lunar.day === 1 && !lunar.isLeap) {
          result = new Date(year, 0, 15 + offset, 0, 0, 0, 0);
          break;
        }
      }
    }

    springCache.set(year, result);
    return result;
  }

  function nextSpringFestival(nowDate) {
    const year = nowDate.getFullYear();
    let spring = springFestivalOf(year);
    if (!spring || spring.getTime() <= nowDate.getTime()) {
      spring = springFestivalOf(year + 1);
    }
    return spring;
  }

  function isSpringFestivalDay(date) {
    const spring = springFestivalOf(date.getFullYear());
    return (
      !!spring &&
      spring.getFullYear() === date.getFullYear() &&
      spring.getMonth() === date.getMonth() &&
      spring.getDate() === date.getDate()
    );
  }

  function updateLunar(nowDate) {
    const nowMs = nowDate.getTime();
    const dateKey = `${nowDate.getFullYear()}-${nowDate.getMonth()}-${nowDate.getDate()}`;

    if (dateKey !== lunarDateKey) {
      lunarDateKey = dateKey;

      const lunar = solarToLunar(nowDate);
      if (!lunar) {
        els.lunarInfo.hidden = true;
        return;
      }

      els.lunarInfo.hidden = false;
      const monthName = `${lunar.isLeap ? "闰" : ""}${LUNAR_MONTHS[lunar.month - 1]}月`;
      setText(els.lunarDate, `${lunarYearName(lunar.year)}年 ${monthName}${LUNAR_DAYS[lunar.day - 1]}`);

      const spring = nextSpringFestival(nowDate);
      if (spring) {
        setText(els.springCountdown, `下个春节 ${spring.getMonth() + 1}月${spring.getDate()}日`);
        els.springCountdown.title = `${spring.getFullYear()} 年春节：${spring.getFullYear()}.${pad(spring.getMonth() + 1)}.${pad(spring.getDate())}`;
      } else {
        setText(els.springCountdown, "");
      }
    }

    const branch = HOUR_BRANCHES[Math.floor(((nowDate.getHours() + 1) % 24) / 2)];
    setText(els.lunarHour, `${branch}时`);
  }

  function setText(el, text) {
    if (el.textContent !== text) el.textContent = text;
  }

  function setValue(el, text) {
    if (el.textContent === text) return;
    el.textContent = text;
    el.dataset.digits = String(text.length);
    el.classList.remove("is-tick");
    void el.offsetWidth;
    el.classList.add("is-tick");
  }

  function renderGreeting(on) {
    els.clock.classList.toggle("is-greeting", on);
    document.body.classList.toggle("is-new-year", on);

    if (!on) {
      setText(els.heroPrefix, "距离");
      setText(els.targetYear, String(selectedYear));
      setText(els.heroSuffix, "春节");
      setText(els.heroSub, "此后 99 个春节，每一次团圆都算数");
      els.clock.setAttribute("aria-label", "春节倒计时");

      const target = springFestivalOf(selectedYear);
      if (target) {
        setText(
          els.targetDate,
          `${selectedYear}.${pad(target.getMonth() + 1)}.${pad(target.getDate())} 正月初一`
        );
      }
      return;
    }

    const spring = onGreetingDay ? springFestivalOf(BASE_YEAR) : nextSpringFestival(new Date());
    if (!spring) return;

    const springYear = spring.getFullYear();
    const monthDay = `${spring.getMonth() + 1}月${spring.getDate()}日`;

    setText(els.heroPrefix, "农历");
    setText(els.targetYear, `${lunarYearName(springYear)}年`);
    setText(els.heroSuffix, "新春快乐");
    setText(els.heroSub, "正月初一 · 岁岁常欢愉，年年皆胜意");
    setText(
      els.targetDate,
      `${springYear}.${pad(spring.getMonth() + 1)}.${pad(spring.getDate())} 正月初一`
    );
    setText(els.springCountdown, onGreetingDay ? `今日春节 · ${monthDay}` : `春节预览 · ${monthDay}`);

    if (!onGreetingDay) {
      setText(els.lunarDate, `${lunarYearName(springYear)}年 正月初一`);
      setText(els.lunarHour, "新春预览");

      const active = cards.find((card) => card.year === selectedYear);
      if (active) {
        active.tag.textContent = "0 天";
        active.tag.dataset.days = "0";
      }
    }

    els.clock.setAttribute("aria-label", "新年快乐");
  }

  function endGreetingPreview() {
    window.clearTimeout(greetingPreviewTimer);
    greetingPreview = false;
    lunarDateKey = "";
    updateLunar(new Date());
    renderGreeting(false);

    const spring = nextSpringFestival(new Date());
    if (spring) {
      setText(els.springCountdown, `下个春节 ${spring.getMonth() + 1}月${spring.getDate()}日`);
      els.springCountdown.title = `${spring.getFullYear()} 年春节：${spring.getFullYear()}.${pad(spring.getMonth() + 1)}.${pad(spring.getDate())}`;
    }

    lastSecond = -1;
    tick(true);
  }

  function startGreetingPreview() {
    fireworkShow(12);

    if (onGreetingDay) return;

    greetingPreview = true;
    window.clearTimeout(greetingPreviewTimer);
    greetingPreviewTimer = window.setTimeout(endGreetingPreview, 7000);
    renderGreeting(true);
    lastSecond = -1;
    tick(true);
  }

  function diff(target, nowMs) {
    const total = Math.max(0, Math.floor((target.getTime() - nowMs) / 1000));
    return {
      total,
      d: Math.floor(total / 86400),
      h: Math.floor((total % 86400) / 3600),
      m: Math.floor((total % 3600) / 60),
      s: total % 60,
    };
  }

  function buildTimeline() {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < YEAR_SPAN; i += 1) {
      const year = firstTargetYear + i;
      const target = springFestivalOf(year);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "year";
      btn.setAttribute("aria-label", `${year} 年春节倒计时`);

      const num = document.createElement("span");
      num.className = "year__num";
      num.textContent = String(year);

      const tag = document.createElement("span");
      tag.className = "year__tag";
      tag.textContent = "—";

      btn.append(num, tag);
      btn.addEventListener("click", () => select(year, false));
      fragment.appendChild(btn);

      cards.push({ year, btn, tag, target });
    }

    els.years.appendChild(fragment);
  }

  function syncActive() {
    for (const card of cards) {
      const active = card.year === selectedYear;
      card.btn.classList.toggle("is-active", active);
      card.btn.setAttribute("aria-pressed", String(active));
    }
  }

  function select(year, scroll) {
    selectedYear = year;
    celebrated = false;
    lastTargetSeconds = null;

    const target = springFestivalOf(year);
    setText(els.targetYear, String(year));
    setText(
      els.targetDate,
      target ? `${year}.${pad(target.getMonth() + 1)}.${pad(target.getDate())} 正月初一` : "—"
    );
    syncActive();

    if (scroll) {
      const active = cards.find((card) => card.year === year);
      if (active) active.btn.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    lastSecond = -1;
    tick(true);
  }

  function updateYearTags(currentMs) {
    for (const card of cards) {
      if (!card.target) continue;
      const remain = Math.max(0, Math.ceil((card.target.getTime() - currentMs) / DAY_MS));
      const key = String(remain);
      if (card.tag.dataset.days !== key) {
        card.tag.dataset.days = key;
        card.tag.textContent = `${nf.format(remain)} 天`;
      }
    }
  }

  function updateStats(currentMs) {
    const greetingToday = isSpringFestivalDay(new Date(currentMs));
    const previewSpring = greetingPreview ? nextSpringFestival(new Date(currentMs)) : null;
    const progressStartYear = greetingToday
      ? BASE_YEAR
      : previewSpring
        ? previewSpring.getFullYear()
        : firstTargetYear - 1;
    const prevSpring = springFestivalOf(progressStartYear);
    const nextSpring = springFestivalOf(progressStartYear + 1);

    if (prevSpring && nextSpring) {
      const span = nextSpring.getTime() - prevSpring.getTime();
      const ratio = span > 0 ? Math.min(1, Math.max(0, (currentMs - prevSpring.getTime()) / span)) : 0;

      els.progressBar.style.width = `${(ratio * 100).toFixed(2)}%`;
      setText(els.progressLabel, `${lunarYearName(progressStartYear)}年 已过`);
      setText(els.progressPercent, `${(ratio * 100).toFixed(1)}%`);
    }

    const lastSpring = springFestivalOf(lastTargetYear);
    if (lastSpring) {
      const remain = Math.max(0, Math.ceil((lastSpring.getTime() - currentMs) / DAY_MS));
      setText(els.totalDays, `${nf.format(remain)} 天`);
    }
  }

  function tick(force = false) {
    const current = new Date();

    if (current.getFullYear() !== BASE_YEAR) {
      window.location.reload();
      return;
    }

    const todayGreeting = isSpringFestivalDay(current);
    if (onGreetingDay && !todayGreeting) {
      window.location.reload();
      return;
    }
    onGreetingDay = todayGreeting;

    const secondKey = Math.floor(current.getTime() / 1000);
    if (!force && secondKey === lastSecond) return;
    lastSecond = secondKey;

    const target = springFestivalOf(selectedYear);
    if (!target) return;

    const rest = diff(target, current.getTime());
    setValue(els.days, pad(rest.d));
    setValue(els.hours, pad(rest.h));
    setValue(els.minutes, pad(rest.m));
    setValue(els.seconds, pad(rest.s));

    if (
      !celebrated &&
      lastTargetSeconds !== null &&
      lastTargetSeconds > 0 &&
      rest.total === 0
    ) {
      celebrated = true;
      celebrate(selectedYear);
    }
    lastTargetSeconds = rest.total;

    updateYearTags(current.getTime());
    updateStats(current.getTime());
    updateLunar(current);

    renderGreeting(todayGreeting || greetingPreview);
  }

  /* ---------- 星空 / 粒子背景 ---------- */

  const canvas = $("starfield");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const STAR_COLORS = ["255,255,255", "167,139,250", "34,211,238", "255,209,102"];
  const SPARK_COLORS = ["139,92,246", "34,211,238", "255,78,205", "255,209,102"];

  let width = 0;
  let height = 0;
  let stars = [];
  let shooting = [];
  let sparks = [];
  let nextShoot = 0;
  let lastFrame = 0;
  const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

  function makeStars() {
    const count = Math.min(240, Math.max(90, Math.round((width * height) / 9000)));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.25 + 0.35,
      depth: Math.random() * 0.8 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 1.2 + 0.3,
      color: STAR_COLORS[Math.random() < 0.82 ? 0 : 1 + Math.floor(Math.random() * 3)],
    }));
  }

  function drawStatic() {
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${star.color},${(0.2 + star.depth * 0.55).toFixed(3)})`;
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function spawnShoot() {
    const fromLeft = Math.random() > 0.5;
    const startX = width * (0.15 + Math.random() * 0.7);
    const startY = height * (0.04 + Math.random() * 0.32);
    const speed = 520 + Math.random() * 380;
    const angle = Math.PI * (0.18 + Math.random() * 0.12);

    shooting.push({
      x: fromLeft ? startX : width - startX,
      y: startY,
      vx: Math.cos(angle) * speed * (fromLeft ? 1 : -1),
      vy: Math.sin(angle) * speed,
      life: 0.9 + Math.random() * 0.4,
      age: 0,
    });
  }

  function drawShooting(dt, nowMs) {
    if (nowMs > nextShoot) {
      nextShoot = nowMs + 3400 + Math.random() * 5200;
      spawnShoot();
    }

    if (!shooting.length) return;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";

    for (let i = shooting.length - 1; i >= 0; i -= 1) {
      const shot = shooting[i];
      shot.age += dt / 1000;
      shot.x += (shot.vx * dt) / 1000;
      shot.y += (shot.vy * dt) / 1000;

      const progress = shot.age / shot.life;
      if (progress >= 1 || shot.x < -180 || shot.x > width + 180 || shot.y > height + 180) {
        shooting.splice(i, 1);
        continue;
      }

      const alpha = Math.sin(Math.PI * Math.min(1, progress)) * 0.9;
      const tailX = shot.x - shot.vx * 0.16;
      const tailY = shot.y - shot.vy * 0.16;
      const grad = ctx.createLinearGradient(shot.x, shot.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255,255,255,${alpha.toFixed(3)})`);
      grad.addColorStop(0.35, `rgba(165,243,252,${(alpha * 0.6).toFixed(3)})`);
      grad.addColorStop(1, "rgba(139,92,246,0)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(shot.x, shot.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
      ctx.arc(shot.x, shot.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function burst(x, y) {
    const count = 20 + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 260;
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        life: 0.55 + Math.random() * 0.55,
        age: 0,
        size: 1 + Math.random() * 1.8,
        color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
      });
    }
    if (sparks.length > 360) sparks = sparks.slice(-360);
  }

  function drawSparks(dt) {
    if (!sparks.length) return;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (let i = sparks.length - 1; i >= 0; i -= 1) {
      const p = sparks[i];
      p.age += dt / 1000;
      if (p.age >= p.life) {
        sparks.splice(i, 1);
        continue;
      }

      p.vy += (260 * dt) / 1000;
      p.x += (p.vx * dt) / 1000;
      p.y += (p.vy * dt) / 1000;

      const alpha = 1 - p.age / p.life;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.color},${alpha.toFixed(3)})`;
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function frame(nowMs) {
    const dt = Math.min(50, nowMs - (lastFrame || nowMs));
    lastFrame = nowMs;
    const t = nowMs / 1000;

    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;

    ctx.clearRect(0, 0, width, height);

    for (const star of stars) {
      const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * star.speed + star.phase));
      const ox = (pointer.x - 0.5) * star.depth * 22;
      const oy = (pointer.y - 0.5) * star.depth * 16;

      ctx.beginPath();
      ctx.fillStyle = `rgba(${star.color},${(twinkle * star.depth).toFixed(3)})`;
      ctx.arc(star.x + ox, star.y + oy, star.r, 0, Math.PI * 2);
      ctx.fill();
    }

    drawShooting(dt, nowMs);
    drawSparks(dt);

    window.requestAnimationFrame(frame);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    makeStars();
    if (reduceMotion) drawStatic();
  }

  function initCanvas() {
    resize();
    window.addEventListener("resize", resize);

    if (reduceMotion) return;

    window.addEventListener(
      "pointermove",
      (event) => {
        pointer.tx = event.clientX / width;
        pointer.ty = event.clientY / height;
      },
      { passive: true }
    );

    window.addEventListener(
      "pointerdown",
      (event) => {
        burst(event.clientX, event.clientY);
      },
      { passive: true }
    );

    window.requestAnimationFrame(frame);
  }

  /* ---------- 烟花 ---------- */

  const fxCanvas = $("fireworks");
  const fxCtx = fxCanvas.getContext("2d");
  const FX_COLORS = [
    "139,92,246",
    "34,211,238",
    "255,78,205",
    "255,209,102",
    "255,255,255",
    "96,165,250",
    "251,146,60",
  ];

  let fxWidth = 0;
  let fxHeight = 0;
  let fxRockets = [];
  let fxParticles = [];
  let fxRunning = false;
  let fxLast = 0;
  let showToken = 0;

  function resizeFireworks() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    fxWidth = window.innerWidth;
    fxHeight = window.innerHeight;
    fxCanvas.width = Math.round(fxWidth * dpr);
    fxCanvas.height = Math.round(fxHeight * dpr);
    fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function randomFxColor() {
    return FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)];
  }

  function explodeFirework(x, y) {
    const compact = fxWidth < 600;
    const count = (compact ? 58 : 80) + Math.floor(Math.random() * (compact ? 28 : 50));
    const base = randomFxColor();
    const accent = randomFxColor();
    const ring = Math.random() > 0.4;
    const power = 190 + Math.random() * 150;

    fxParticles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 0.34,
      age: 0,
      size: 46,
      color: base,
      phase: 0,
      flash: true,
    });

    for (let i = 0; i < count; i += 1) {
      const angle = ring ? (i / count) * Math.PI * 2 : Math.random() * Math.PI * 2;
      const speed = ring
        ? power * (0.75 + Math.random() * 0.45)
        : power * (0.25 + Math.random() * 0.9);
      const roll = Math.random();

      fxParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.35 + Math.random() * 1.2,
        age: 0,
        size: 1.3 + Math.random() * 1.8,
        color: roll < 0.58 ? base : roll < 0.86 ? accent : "255,255,255",
        phase: Math.random() * Math.PI * 2,
        flash: false,
      });
    }

    if (fxParticles.length > 1800) fxParticles.splice(0, fxParticles.length - 1800);
  }

  function fxFrame(timestamp) {
    const dt = Math.min(0.04, (timestamp - fxLast) / 1000 || 0.016);
    fxLast = timestamp;

    fxCtx.clearRect(0, 0, fxWidth, fxHeight);
    fxCtx.save();
    fxCtx.globalCompositeOperation = "lighter";
    fxCtx.lineCap = "round";

    for (let i = fxRockets.length - 1; i >= 0; i -= 1) {
      const rocket = fxRockets[i];
      rocket.vy += 900 * dt;
      rocket.x += rocket.vx * dt;
      rocket.y += rocket.vy * dt;

      fxCtx.strokeStyle = "rgba(255, 214, 140, 0.95)";
      fxCtx.lineWidth = 2.4;
      fxCtx.beginPath();
      fxCtx.moveTo(rocket.x, rocket.y + 26);
      fxCtx.lineTo(rocket.x, rocket.y);
      fxCtx.stroke();

      fxCtx.fillStyle = "rgba(255, 255, 255, 0.95)";
      fxCtx.beginPath();
      fxCtx.arc(rocket.x, rocket.y, 2, 0, Math.PI * 2);
      fxCtx.fill();

      if (rocket.y <= rocket.targetY || rocket.vy >= 0) {
        explodeFirework(rocket.x, rocket.y);
        fxRockets.splice(i, 1);
      }
    }

    for (let i = fxParticles.length - 1; i >= 0; i -= 1) {
      const particle = fxParticles[i];
      particle.age += dt;

      if (particle.age >= particle.life) {
        fxParticles.splice(i, 1);
        continue;
      }

      if (particle.flash) {
        const alpha = 1 - particle.age / particle.life;
        const radius = particle.size * (1 + particle.age * 4);
        const glow = fxCtx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          radius
        );
        glow.addColorStop(0, `rgba(${particle.color},${(alpha * 0.5).toFixed(3)})`);
        glow.addColorStop(1, `rgba(${particle.color},0)`);
        fxCtx.fillStyle = glow;
        fxCtx.beginPath();
        fxCtx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
        fxCtx.fill();
        continue;
      }

      const drag = Math.pow(0.99, dt * 60);
      particle.vx *= drag;
      particle.vy = particle.vy * drag + 50 * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      const alpha = 1 - particle.age / particle.life;
      const twinkle = 0.65 + 0.35 * Math.sin(particle.age * 22 + particle.phase);

      fxCtx.strokeStyle = `rgba(${particle.color},${(alpha * twinkle).toFixed(3)})`;
      fxCtx.lineWidth = particle.size * (0.6 + alpha * 0.7);
      fxCtx.beginPath();
      fxCtx.moveTo(particle.x - particle.vx * 0.045, particle.y - particle.vy * 0.045);
      fxCtx.lineTo(particle.x, particle.y);
      fxCtx.stroke();

      fxCtx.fillStyle = `rgba(255,255,255,${(alpha * 0.75).toFixed(3)})`;
      fxCtx.beginPath();
      fxCtx.arc(particle.x, particle.y, Math.max(0.55, particle.size * 0.3), 0, Math.PI * 2);
      fxCtx.fill();
    }

    fxCtx.restore();

    if (fxRockets.length || fxParticles.length) {
      window.requestAnimationFrame(fxFrame);
    } else {
      fxRunning = false;
      fxCtx.clearRect(0, 0, fxWidth, fxHeight);
    }
  }

  function ensureFireworksLoop() {
    if (fxRunning) return;
    fxRunning = true;
    fxLast = performance.now();
    window.requestAnimationFrame(fxFrame);
  }

  function launchRocket() {
    const x = fxWidth * (0.12 + Math.random() * 0.76);
    const targetY = fxHeight * (0.1 + Math.random() * 0.34);
    const lift = Math.sqrt(2 * 900 * Math.max(120, fxHeight - targetY));

    fxRockets.push({
      x,
      y: fxHeight + 8,
      vx: (Math.random() - 0.5) * 40,
      vy: -lift,
      targetY,
    });

    ensureFireworksLoop();
  }

  function fireworkShow(count) {
    const token = (showToken += 1);

    window.setTimeout(() => {
      if (token !== showToken) return;
      explodeFirework(
        fxWidth * (0.2 + Math.random() * 0.6),
        fxHeight * (0.16 + Math.random() * 0.22)
      );
      ensureFireworksLoop();
    }, 480);

    for (let i = 0; i < count; i += 1) {
      window.setTimeout(
        () => {
          if (token === showToken) launchRocket();
        },
        i * 250 + Math.random() * 120
      );
    }
  }

  function celebrate(year) {
    setText(els.celebrateYear, `${year} · ${lunarYearName(year)}年`);
    els.celebrate.hidden = false;
    document.body.classList.add("is-celebrating");
    fireworkShow(16);
    els.closeCelebrate.focus({ preventScroll: true });

    window.setTimeout(() => {
      if (!els.celebrate.hidden) fireworkShow(12);
    }, 4200);
  }

  function closeCelebration() {
    els.celebrate.hidden = true;
    document.body.classList.remove("is-celebrating");
    if (els.preview) els.preview.focus({ preventScroll: true });
  }

  function initFireworks() {
    resizeFireworks();
    window.addEventListener("resize", resizeFireworks);

    if (els.preview) els.preview.addEventListener("click", startGreetingPreview);
    els.again.addEventListener("click", () => fireworkShow(12));
    els.closeCelebrate.addEventListener("click", closeCelebration);

    els.celebrate.addEventListener("click", (event) => {
      if (event.target === els.celebrate) closeCelebration();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !els.celebrate.hidden) closeCelebration();
    });
  }

  /* ---------- 启动 ---------- */

  const nextSpring = nextSpringFestival(now);
  onGreetingDay = isSpringFestivalDay(now);
  if (onGreetingDay) firstTargetYear = BASE_YEAR;
  else if (nextSpring) firstTargetYear = nextSpring.getFullYear();
  lastTargetYear = firstTargetYear + YEAR_SPAN - 1;
  selectedYear = firstTargetYear;

  buildTimeline();
  select(firstTargetYear, false);
  updateYearTags(Date.now());

  els.reset.addEventListener("click", () => select(firstTargetYear, true));

  window.setInterval(tick, 250);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tick(true);
  });

  initCanvas();
  initFireworks();
})();
