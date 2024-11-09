function scrapeText() {
    // Get all text content from the page
    const textContent = document.body.innerText;
    
    // Remove extra whitespace and special characters
    const cleanText = textContent
        .replace(/\s+/g, ' ')
        .trim();
    
    return cleanText;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrapeText") {
        const text = scrapeText();
        sendResponse({text: text});
    }
});
