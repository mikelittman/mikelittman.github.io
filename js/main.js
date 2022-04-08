"use strict";

class YearDuration extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    const duration = document.createElement("span");
    duration.classList.add("duration");

    this.shadowRoot.append(duration);
  }

  connectedCallback() {
    const dataStart = this.getAttribute("data-start");
    const years = this.diffYears(new Date(dataStart), new Date());
    const durationElem = this.shadowRoot.querySelector(".duration");
    durationElem.textContent = `${years} years`;
  }

  /**
   * Roughly calculate the difference between two dates in years
   * @param {Date} start
   * @param {Date} end
   * @returns {number} number of years between start and end
   */
  diffYears(start, end) {
    const diff = end.getTime() - start.getTime();
    return Math.abs(Math.round(diff / (1000 * 60 * 60 * 24 * 365)));
  }
}

const THEME_LIGHT = "light";
const THEME_DARK = "dark";

class DayNightToggle extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    const wrapper = document.createElement("div");
    const style = document.createElement('style');
    style.textContent = `
    div {
      cursor: pointer;
      display: inline-block;
    }`

    wrapper.addEventListener("click", () => {
      this.toggleMode();
    });

    this.shadowRoot.append(style, wrapper);
  }

  /**
   * Determine if the page is in day or night mode
   * @returns {boolean}
   */
  isDark() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const hasTheme = currentTheme !== null;
    const themeDark = currentTheme === THEME_DARK;
    const preferDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    return hasTheme ? themeDark : preferDark;
  }

  /**
   * Set theme to dark or light
   * @param {'dark' | 'light'} theme
   */
  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  toggleMode() {
    this.setTheme(this.isDark() ? THEME_LIGHT : THEME_DARK);
    this.refreshDisplay();
  }

  refreshDisplay() {
    const mode = this.isDark() ? "🌑" : "☀️";
    this.shadowRoot.querySelector("div").textContent = `${mode}`;
  }

  connectedCallback() {
    this.refreshDisplay();
  }
}

customElements.define("year-duration", YearDuration);
customElements.define("day-night-toggle", DayNightToggle);
