// Create and inject the popup immediately
function createPopup() {
    // Don't create popup on Google search
    if (window.location.hostname.includes('google') && 
        window.location.pathname.includes('search')) {
        return;
    }

    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 250px;
    `;

    // Create status display
    const statusDisplay = document.createElement('div');
    statusDisplay.id = 'status-display';
    statusDisplay.style.cssText = `
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
    `;
    statusDisplay.textContent = 'Ready to generate';

    // Create generate button
    const generateButton = document.createElement('button');
    generateButton.textContent = 'Generate Song from Page';
    generateButton.style.cssText = `
        padding: 8px 15px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin-bottom: 10px;
    `;

    // Create audio player (hidden initially)
    const audioPlayer = document.createElement('audio');
    audioPlayer.controls = true;
    audioPlayer.style.cssText = `
        width: 100%;
        display: none;
        margin-top: 10px;
    `;

    // Add event listener for generate button
    generateButton.addEventListener('click', async () => {
        try {
            // Step 1: Scrape and clean text
            statusDisplay.textContent = 'Scraping text...';
            const cleanedText = scrapeAndCleanText();

            // Step 2: Summarize text
            statusDisplay.textContent = 'Summarizing text...';
            const summary = await summarizeText(cleanedText);

            // Step 3: Generate song
            statusDisplay.textContent = 'Generating song...';
            const songData = await generateSong(summary);

            // Step 4: Play the song
            statusDisplay.textContent = 'Song ready!';
            audioPlayer.style.display = 'block';
            audioPlayer.src = songData;

        } catch (error) {
            statusDisplay.textContent = 'Error: ' + error.message;
            console.error('Error:', error);
        }
    });

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✖';
    closeButton.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: #666;
    `;
    closeButton.addEventListener('click', () => popup.remove());

    // Add minimize button
    const minimizeButton = document.createElement('button');
    minimizeButton.innerHTML = '−';
    minimizeButton.style.cssText = `
        position: absolute;
        top: 5px;
        right: 25px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: #666;
    `;

    const content = document.createElement('div');
    content.appendChild(statusDisplay);
    content.appendChild(generateButton);
    content.appendChild(audioPlayer);

    popup.appendChild(closeButton);
    popup.appendChild(minimizeButton);
    popup.appendChild(content);

    // Minimize functionality
    minimizeButton.addEventListener('click', () => {
        if (content.style.display === 'none') {
            content.style.display = 'block';
            minimizeButton.innerHTML = '−';
        } else {
            content.style.display = 'none';
            minimizeButton.innerHTML = '+';
        }
    });

    // Make popup draggable
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    popup.addEventListener('mousedown', (e) => {
        if (e.target === popup) {
            isDragging = true;
            initialX = e.clientX - popup.offsetLeft;
            initialY = e.clientY - popup.offsetTop;
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            popup.style.left = currentX + 'px';
            popup.style.top = currentY + 'px';
            popup.style.right = 'auto';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    document.body.appendChild(popup);
}

// Helper functions for text processing and API calls
function scrapeAndCleanText() {
    const text = document.body.innerText;
    return text
        .replace(/[^\w\s.,!?-]/g, '') // Remove special characters
        .replace(/\s+/g, ' ')         // Remove extra whitespace
        .trim();
}

async function summarizeText(text) {
    const response = await fetch('YOUR_BACKEND_API_URL/summarize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
    });

    if (!response.ok) {
        throw new Error('Summarization failed');
    }

    const data = await response.json();
    return data.summary;
}

async function generateSong(summary) {
    const response = await fetch('YOUR_LLM_API_URL/generate-song', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary })
    });

    if (!response.ok) {
        throw new Error('Song generation failed');
    }

    const data = await response.json();
    return `data:audio/mp3;base64,${data.audioData}`;
}

// Initialize popup when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPopup);
} else {
    createPopup();
}
