(function () {
  if (window.__cbStandaloneLoaded) return;
  window.__cbStandaloneLoaded = true;

  const MODES = {
    normal: {
      label: "Normal",
      pill: "Normal",
      badge: "Default",
      description: "Standard color display with no simulation applied.",
      tip: "Use this as your baseline before comparing other simulations.",
      filterId: ""
    },
    protanopia: {
      label: "Protanopia",
      pill: "Protan.",
      badge: "Red-Green",
      description:
        "Reduced or absent red cone response. Red-green differences can become harder to distinguish.",
      tip: "Check buttons, alerts, and charts that depend on red or green meaning.",
      filterId: "cb-filter-protanopia"
    },
    deuteranopia: {
      label: "Deuteranopia",
      pill: "Deutan.",
      badge: "Red-Green",
      description:
        "Reduced or absent green cone response. Red-green color cues may blend together.",
      tip: "Make sure success and error states do not rely only on color.",
      filterId: "cb-filter-deuteranopia"
    },
    tritanopia: {
      label: "Tritanopia",
      pill: "Tritan.",
      badge: "Blue-Yellow",
      description:
        "Complete absence of blue cone response. Blue appears green and yellow looks pink.",
      tip: "Check that status indicators, charts, and alerts remain distinguishable under this simulation.",
      filterId: "cb-filter-tritanopia"
    },
    protanomaly: {
      label: "Pro. weak",
      pill: "Pro. weak",
      badge: "Mild",
      description:
        "Weakened sensitivity to red hues. Red shades may appear duller than expected.",
      tip: "Low-saturation reds can lose clarity, so pair them with icons or labels.",
      filterId: "cb-filter-protanomaly"
    },
    deuteranomaly: {
      label: "Deu. weak",
      pill: "Deu. weak",
      badge: "Mild",
      description:
        "Weakened sensitivity to green hues. Similar colors can become harder to separate.",
      tip: "Important states should not rely on green alone.",
      filterId: "cb-filter-deuteranomaly"
    },
    achromatopsia: {
      label: "Achrom.",
      pill: "Achrom.",
      badge: "Grayscale",
      description:
        "Very limited or absent color perception. Most of the interface appears grayscale.",
      tip: "Make sure contrast, borders, icons, and text labels still communicate meaning.",
      filterId: "cb-filter-achromatopsia"
    }
  };

  const state = {
    open: false,
    mode: localStorage.getItem("cb-mode") || "tritanopia"
  };

  function sx(el, styles) {
    Object.assign(el.style, styles);
    return el;
  }

  function make(tag, styles, text) {
    const el = document.createElement(tag);
    if (styles) sx(el, styles);
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function createSvgFilters() {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    sx(svg, {
      position: "absolute",
      width: "0",
      height: "0",
      overflow: "hidden",
      pointerEvents: "none"
    });

    const defs = document.createElementNS(NS, "defs");
    svg.appendChild(defs);

    const matrices = {
      "cb-filter-protanopia": [
        0.567, 0.433, 0, 0, 0,
        0.558, 0.442, 0, 0, 0,
        0, 0.242, 0.758, 0, 0,
        0, 0, 0, 1, 0
      ],
      "cb-filter-deuteranopia": [
        0.625, 0.375, 0, 0, 0,
        0.7, 0.3, 0, 0, 0,
        0, 0.3, 0.7, 0, 0,
        0, 0, 0, 1, 0
      ],
      "cb-filter-tritanopia": [
        0.95, 0.05, 0, 0, 0,
        0, 0.433, 0.567, 0, 0,
        0, 0.475, 0.525, 0, 0,
        0, 0, 0, 1, 0
      ],
      "cb-filter-protanomaly": [
        0.817, 0.183, 0, 0, 0,
        0.333, 0.667, 0, 0, 0,
        0, 0.125, 0.875, 0, 0,
        0, 0, 0, 1, 0
      ],
      "cb-filter-deuteranomaly": [
        0.8, 0.2, 0, 0, 0,
        0.258, 0.742, 0, 0, 0,
        0, 0.142, 0.858, 0, 0,
        0, 0, 0, 1, 0
      ],
      "cb-filter-achromatopsia": [
        0.299, 0.587, 0.114, 0, 0,
        0.299, 0.587, 0.114, 0, 0,
        0.299, 0.587, 0.114, 0, 0,
        0, 0, 0, 1, 0
      ]
    };

    Object.entries(matrices).forEach(([id, values]) => {
      const filter = document.createElementNS(NS, "filter");
      filter.setAttribute("id", id);
      filter.setAttribute("color-interpolation-filters", "sRGB");

      const matrix = document.createElementNS(NS, "feColorMatrix");
      matrix.setAttribute("type", "matrix");
      matrix.setAttribute("values", values.join(" "));
      filter.appendChild(matrix);
      defs.appendChild(filter);
    });

    document.body.appendChild(svg);
  }

  let root;
  let panel;
  let toggleBtn;
  let pillText;
  let statusMain;
  let statusBadge;
  let descriptionText;
  let tipText;
  let selectEl;
  let modeButtons = [];

  function buildUI() {
    root = make("div", {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      zIndex: "2147483647",
      fontFamily: "Inter, Arial, sans-serif",
      boxSizing: "border-box"
    });

    panel = make("div", {
      position: "absolute",
      right: "0",
      bottom: "58px",
      width: "334px",
      maxWidth: "calc(100vw - 24px)",
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "18px",
      overflow: "hidden",
      boxShadow: "0 20px 48px rgba(15, 23, 42, 0.18)",
      display: "none"
    });

    const header = make("div", {
      background: "#0f1b34",
      color: "#ffffff",
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    });

    const headerLeft = make("div", {
      display: "flex",
      alignItems: "center",
      gap: "8px"
    });

    const icon = make("span", null, "⚗");
    const title = make("span", {
      fontSize: "16px",
      fontWeight: "700"
    }, "Accessibility Validation");

    const dev = make("span", {
      background: "#facc15",
      color: "#111827",
      fontSize: "11px",
      fontWeight: "700",
      padding: "3px 7px",
      borderRadius: "6px"
    }, "DEV");

    const closeBtn = make("button", {
      border: "none",
      background: "transparent",
      color: "#ffffff",
      fontSize: "20px",
      cursor: "pointer",
      padding: "0",
      lineHeight: "1"
    }, "×");

    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close");

    headerLeft.append(icon, title, dev);
    header.append(headerLeft, closeBtn);

    const status = make("div", {
      background: "#f3ecdd",
      borderBottom: "1px solid #ebe3d0",
      padding: "14px 16px",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "12px"
    });

    const statusLeft = make("div");
    const simLabel = make("div", {
      fontSize: "12px",
      color: "#6b7280",
      marginBottom: "4px"
    }, "Simulating");

    statusMain = make("div", {
      fontSize: "28px",
      lineHeight: "1",
      color: "#c96a00",
      fontWeight: "500"
    });

    statusBadge = make("div", {
      background: "#dbeafe",
      color: "#2563eb",
      borderRadius: "999px",
      padding: "6px 10px",
      fontSize: "12px",
      whiteSpace: "nowrap"
    });

    statusLeft.append(simLabel, statusMain);
    status.append(statusLeft, statusBadge);

    const body = make("div", {
      padding: "14px 16px 16px"
    });

    selectEl = make("select", {
      width: "100%",
      border: "1px solid #d1d5db",
      borderRadius: "12px",
      padding: "12px 14px",
      fontSize: "15px",
      color: "#1f2937",
      background: "#ffffff",
      outline: "none",
      marginBottom: "16px"
    });

    Object.keys(MODES).forEach((key) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = MODES[key].label;
      selectEl.appendChild(option);
    });

    descriptionText = make("p", {
      margin: "0 0 16px",
      color: "#4b5563",
      fontSize: "15px",
      lineHeight: "1.5"
    });

    tipText = make("div", {
      background: "#fff8e8",
      border: "1px solid #f2cf66",
      color: "#9a4d00",
      borderRadius: "12px",
      padding: "12px 14px",
      fontSize: "14px",
      lineHeight: "1.45",
      marginBottom: "16px"
    });

    const preview = make("div", {
      border: "1px solid #e5e7eb",
      borderRadius: "14px",
      padding: "12px",
      marginBottom: "16px"
    });

    function previewRow(dotColor, text) {
      const row = make("div", {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "10px",
        fontSize: "14px",
        color: "#1f2937"
      });

      const dot = make("span", {
        width: "12px",
        height: "12px",
        borderRadius: "999px",
        background: dotColor,
        flexShrink: "0",
        display: "inline-block"
      });

      const label = make("span", null, text);
      row.append(dot, label);
      return row;
    }

    preview.append(
      previewRow("#22c55e", "Normal"),
      previewRow("#ef4444", "Abnormal")
    );

    const row3 = make("div", {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "14px",
      color: "#1f2937"
    });

    const alertChip = make("span", {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "56px",
      borderRadius: "999px",
      padding: "6px 10px",
      fontSize: "12px",
      fontWeight: "700",
      background: "#f59e0b",
      color: "#111827"
    }, "Alert");

    const infoChip = make("span", {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "56px",
      borderRadius: "999px",
      padding: "6px 10px",
      fontSize: "12px",
      fontWeight: "700",
      border: "1px solid #3b82f6",
      color: "#3b82f6",
      background: "transparent"
    }, "Info");

    row3.append(alertChip, infoChip);
    preview.appendChild(row3);

    const modesWrap = make("div", {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px"
    });

    modeButtons = [];

    Object.keys(MODES).forEach((key) => {
      const btn = make("button", {
        border: "1px solid #d1d5db",
        background: "#ffffff",
        color: "#374151",
        borderRadius: "10px",
        padding: "7px 10px",
        fontSize: "13px",
        cursor: "pointer"
      }, MODES[key].pill);

      btn.type = "button";
      btn.dataset.mode = key;
      modeButtons.push(btn);
      modesWrap.appendChild(btn);
    });

    body.append(selectEl, descriptionText, tipText, preview, modesWrap);
    panel.append(header, status, body);

    toggleBtn = make("button", {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      border: "none",
      borderRadius: "14px",
      background: "#f59e0b",
      color: "#ffffff",
      padding: "10px 14px",
      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.18)",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      lineHeight: "1"
    });

    toggleBtn.type = "button";

    const eye = make("span", null, "◌");
    pillText = make("span");
    const flask = make("span", null, "⚗");

    toggleBtn.append(eye, pillText, flask);
    root.append(panel, toggleBtn);
    document.body.appendChild(root);

    closeBtn.addEventListener("click", () => setOpen(false));
    toggleBtn.addEventListener("click", () => setOpen(!state.open));

    selectEl.addEventListener("change", (e) => {
      applyMode(e.target.value);
    });

    modeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        applyMode(btn.dataset.mode);
      });
    });

    document.addEventListener("click", (e) => {
      if (state.open && root && !root.contains(e.target)) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.open) {
        setOpen(false);
      }
    });
  }

  function setOpen(open) {
    state.open = open;
    panel.style.display = open ? "block" : "none";
    toggleBtn.setAttribute("aria-expanded", String(open));
  }

  function applyMode(mode) {
    const config = MODES[mode] || MODES.normal;
    state.mode = mode;
    localStorage.setItem("cb-mode", mode);

    statusMain.textContent = config.label;
    statusBadge.textContent = config.badge;
    descriptionText.textContent = config.description;
    tipText.textContent = "Tip: " + config.tip;
    selectEl.value = mode;
    pillText.textContent = config.pill;

    modeButtons.forEach((btn) => {
      const active = btn.dataset.mode === mode;
      btn.style.background = active ? "#0f1b34" : "#ffffff";
      btn.style.color = active ? "#ffffff" : "#374151";
      btn.style.borderColor = active ? "#0f1b34" : "#d1d5db";
    });

    if (config.filterId) {
      document.documentElement.style.filter = `url(#${config.filterId})`;
    } else {
      document.documentElement.style.filter = "";
    }
  }

  function init() {
    if (!document.body) {
      window.addEventListener("DOMContentLoaded", init, { once: true });
      return;
    }

    createSvgFilters();
    buildUI();
    applyMode(state.mode);
    setOpen(false);
  }

  init();
})();