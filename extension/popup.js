const API_URLS = [
  "https://sentanalysis.vercel.app/api/sentiment",
  "http://127.0.0.1:5000/api/sentiment",
  "http://localhost:5000/api/sentiment",
];

async function callApi(text) {
  for (const url of API_URLS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // try the next URL
    }
  }
  throw new Error("Could not reach the local API. Is the Flask app running?");
}

async function getSelectionFromActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return "";
  const url = tab.url || "";
  const blocked = url.startsWith("chrome://") || url.startsWith("edge://") || url.startsWith("about:") || url.startsWith("chrome-extension://");
  if (blocked) {
    throw new Error("Cannot access chrome:// or similar pages. Open a normal webpage.");
  }
  try {
    const [exec] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => (window.getSelection ? String(window.getSelection()) : "")
    });
    return (exec && exec.result) || "";
  } catch (e) {
    throw new Error("Unable to read selection on this page.");
  }
}

function showStatus(msg, isError=false) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = "status" + (isError ? " error" : "");
}

function showResult(data) {
  document.getElementById("label").textContent = data.sentiment;
  document.getElementById("polarity").textContent = Number(data.polarity).toFixed(3);
  document.getElementById("subjectivity").textContent = Number(data.subjectivity).toFixed(3);
  document.getElementById("result").classList.remove("hidden");
}

async function analyze(text) {
  if (!text.trim()) {
    showStatus("Enter or select some text.", true);
    return;
  }
  showStatus("Analyzing...");
  try {
    const data = await callApi(text);
    showStatus("Done.");
    showResult(data);
  } catch (e) {
    showStatus(e.message || String(e), true);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  document.getElementById("btn-analyze").addEventListener("click", () => analyze(input.value));
  document.getElementById("btn-selection").addEventListener("click", async () => {
    const text = await getSelectionFromActiveTab();
    if (text) input.value = text;
    analyze(input.value);
  });

  // Prefill from background when opened via floating button
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "POPUP_PREFILL" && typeof msg.text === "string") {
      input.value = msg.text;
      analyze(input.value);
    }
  });
});
