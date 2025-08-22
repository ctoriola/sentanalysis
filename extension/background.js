// Open the popup prefilled with provided text when content script requests analysis
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "SENTIMENT_ANALYZE" && typeof msg.text === "string") {
    // Set the popup's textarea content by sending a message to the popup when it opens
    chrome.action.openPopup().then(() => {
      // After popup opens, send the text to it
      chrome.runtime.sendMessage({ type: "POPUP_PREFILL", text: msg.text });
    });
  }
});
