document.getElementById('generateButton').addEventListener('click', async () => {
    const status = document.getElementById('status');
    const player = document.getElementById('player');
    
    try {
        // Step 1: Scrape text
        status.textContent = 'Scraping text...';
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: scrapeAndCleanText,
        });
        const cleanedText = results[0].result;

        // Step 2: Summarize text
        status.textContent = 'Summarizing text...';
        const summary = await summarizeText(cleanedText);

        // Step 3: Generate song
        status.textContent = 'Generating song...';
        const songData = await generateSong(summary);

        // Step 4: Play the song
        status.textContent = 'Song ready!';
        player.style.display = 'block';
        player.src = songData;

    } catch (error) {
        status.textContent = 'Error: ' + error.message;
        console.error('Error:', error);
    }
});

// Function to scrape and clean text
function scrapeAndCleanText() {
    const text = document.body.innerText;
    return text
        .replace(/[^\w\s.,!?-]/g, '') // Remove special characters
        .replace(/\s+/g, ' ')         // Remove extra whitespace
        .trim();
}

// Function to summarize text using your backend API
async function summarizeText(text) {
    const response = await fetch('YOUR_BACKEND_API_URL/summarize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_API_KEY' // If needed
        },
        body: JSON.stringify({ text })
    });

    if (!response.ok) {
        throw new Error('Summarization failed');
    }

    const data = await response.json();
    return data.summary;
}

// Function to generate song using LLM API
async function generateSong(summary) {
    const response = await fetch('YOUR_LLM_API_URL/generate-song', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_LLM_API_KEY'
        },
        body: JSON.stringify({ summary })
    });

    if (!response.ok) {
        throw new Error('Song generation failed');
    }

    // Assuming the API returns audio data as base64
    const data = await response.json();
    return `data:audio/mp3;base64,${data.audioData}`;
}
