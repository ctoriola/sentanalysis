// Open the popup prefilled with provided text when content script requests analysis
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "SENTIMENT_ANALYZE" && typeof msg.text === "string") {
    // Set the popup's textarea content by sending a message to the popup when it opens
    const tryOpen = chrome.action.openPopup();
    if (tryOpen && typeof tryOpen.then === "function") {
      tryOpen
        .then(() => {
          // After popup opens, send the text to it
          chrome.runtime.sendMessage({ type: "POPUP_PREFILL", text: msg.text });
        })
        .catch(async () => {
          // Edge fallback: inline analyze on active tab
          try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs && tabs[0] && tabs[0].id) {
              chrome.tabs.sendMessage(tabs[0].id, { type: "INLINE_ANALYZE", text: msg.text });
            }
          } catch {}
        });
    } else {
      // If openPopup is not a promise (older implementations), attempt inline
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: "INLINE_ANALYZE", text: msg.text });
        }
      });
    }
  }
});
