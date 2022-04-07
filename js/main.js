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

customElements.define("year-duration", YearDuration);
