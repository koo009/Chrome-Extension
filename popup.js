document.getElementById('scrapeButton').addEventListener('click', async () => {
  // Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Execute script to scrape text
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: scrapeText,
  });
});

function scrapeText() {
  // Get all text from the page
  const text = document.body.innerText;
  
  // Create blob and download
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Download the file
  const a = document.createElement('a');
  a.href = url;
  a.download = 'scraped-text.txt';
  a.click();
  
  URL.revokeObjectURL(url);
}
