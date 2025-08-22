// Inject a floating action button (FAB) that appears near selected text
(function () {
  const ID = "sentanalysis-fab";
  const HOVER_ID = "sentanalysis-fab-hover";

  let fab = null;
  let currentText = "";
  let tooltip = null;

  const PROD_API = "https://sentanalysis.vercel.app/api/sentiment";

  function ensureTooltip() {
    if (tooltip) return tooltip;
    tooltip = document.createElement("div");
    tooltip.className = "sentanalysis-tooltip";
    tooltip.style.position = "absolute";
    tooltip.style.zIndex = 2147483647;
    tooltip.style.padding = "8px 10px";
    tooltip.style.borderRadius = "8px";
    tooltip.style.background = "#111827";
    tooltip.style.color = "#fff";
    tooltip.style.boxShadow = "0 6px 20px rgba(0,0,0,.25)";
    tooltip.style.fontSize = "12px";
    tooltip.style.opacity = "0";
    tooltip.style.transition = "opacity 120ms ease";
    document.documentElement.appendChild(tooltip);
    return tooltip;
  }

  function showTooltipAt(x, y, html) {
    const tip = ensureTooltip();
    tip.innerHTML = html;
    tip.style.left = `${x + 12}px`;
    tip.style.top = `${y + 54}px`; // below the FAB
    tip.style.opacity = "1";
  }

  function hideTooltip() {
    if (tooltip) tooltip.style.opacity = "0";
  }

  function createFab() {
    if (fab) return fab;
    fab = document.createElement("div");
    fab.id = ID;
    fab.className = "sentanalysis-fab";
    fab.title = "Analyze sentiment";
    fab.innerHTML = "\uD83D\uDCCA"; // chart icon

    async function inlineAnalyze(text, ev) {
      try {
        showTooltipAt((ev?.pageX) || 0, (ev?.pageY) || 0, "Analyzing...");
        const res = await fetch(PROD_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });
        const data = await res.json();
        const label = data?.sentiment ?? "-";
        const pol = typeof data?.polarity === "number" ? data.polarity.toFixed(3) : "-";
        showTooltipAt((ev?.pageX) || 0, (ev?.pageY) || 0, `<strong>Sentiment:</strong> ${label}<br/><strong>Polarity:</strong> ${pol}`);
      } catch (err) {
        showTooltipAt((ev?.pageX) || 0, (ev?.pageY) || 0, "Analysis failed.");
      }
      setTimeout(hideTooltip, 3000);
    }

    fab.addEventListener("click", async (ev) => {
      // Send the selected or last-captured text to background/popup
      const text = getSelectedText() || currentText;
      if (!text) return;
      try {
        if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ type: "SENTIMENT_ANALYZE", text });
          return;
        }
        throw new Error("runtime unavailable");
      } catch (e) {
        // Fallback: inline analyze
        inlineAnalyze(text, ev);
      }
    });

    // Background fallback: request inline analysis
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg?.type === "INLINE_ANALYZE" && typeof msg.text === "string") {
          inlineAnalyze(msg.text);
        }
      });
    }

    document.documentElement.appendChild(fab);
    return fab;
  }

  function getSelectedText() {
    try { return String(window.getSelection ? window.getSelection() : ""); }
    catch { return ""; }
  }

  function positionFab(x, y) {
    const el = createFab();
    el.style.left = `${x + 12}px`;
    el.style.top = `${y + 12}px`;
    el.style.opacity = "1";
    el.style.pointerEvents = "auto";
  }

  function hideFab() {
    if (!fab) return;
    fab.style.opacity = "0";
    fab.style.pointerEvents = "none";
  }

  document.addEventListener("selectionchange", () => {
    const text = getSelectedText().trim();
    if (text && text.length > 1) {
      currentText = text;
      // Try to position near the selection end
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        const rects = range.getClientRects();
        const rect = rects[rects.length - 1] || range.getBoundingClientRect();
        const x = rect.right + window.scrollX;
        const y = rect.bottom + window.scrollY;
        positionFab(x, y);
      } else {
        // Fallback to mouse pos (requires mouseup handler)
      }
    } else {
      hideFab();
    }
  });

  document.addEventListener("mouseup", (e) => {
    const text = getSelectedText().trim();
    if (text && text.length > 1) {
      currentText = text;
      positionFab(e.pageX, e.pageY);
    }
  });

  // Hide when clicking elsewhere
  document.addEventListener("mousedown", (e) => {
    if (fab && !fab.contains(e.target)) {
      // Keep visible if selection still exists
      const text = getSelectedText().trim();
      if (!text) hideFab();
    }
  });
})();
