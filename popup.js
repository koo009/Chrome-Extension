document.getElementById('scrapeButton').addEventListener('click', async () => {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      console.error('No active tab found');
      return;
    }

    // Execute script to scrape text
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: scrapeText,
    });

    console.log('Script executed', results);
  } catch (error) {
    console.error('Error:', error);
  }
});

function scrapeText() {
  try {
    // Get all text from the page
    const text = document.body.innerText;
    
    // Create blob and download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Download the file
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraped-${document.title || 'page'}.txt`;
    document.body.appendChild(a);  // Need to append the element to the DOM
    a.click();
    document.body.removeChild(a);  // Clean up
    
    URL.revokeObjectURL(url);
    
    return { success: true, message: 'Text scraped successfully' };
  } catch (error) {
    console.error('Scraping error:', error);
    return { success: false, error: error.message };
  }
}
