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
        max-width: 350px;
    `;

    // Create status display
    const statusDisplay = document.createElement('div');
    statusDisplay.id = 'status-display';
    statusDisplay.style.cssText = `
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
    `;
    statusDisplay.textContent = 'Ready to generate summary';

    // Create output type selector
    const outputTypeSelector = document.createElement('select');
    outputTypeSelector.style.cssText = `
        padding: 5px;
        margin-bottom: 10px;
        border-radius: 4px;
        border: 1px solid #ccc;
    `;

    ['music', 'edm', 'podcast'].forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type.toUpperCase();
        outputTypeSelector.appendChild(option);
    });

    // Create generate button
    const generateButton = document.createElement('button');
    generateButton.textContent = 'Generate Summary';
    generateButton.style.cssText = `
        padding: 8px 15px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin-bottom: 10px;
        transition: background-color 0.3s;
    `;

    generateButton.addEventListener('mouseenter', () => {
        generateButton.style.backgroundColor = '#45a049';
    });

    generateButton.addEventListener('mouseleave', () => {
        generateButton.style.backgroundColor = '#4CAF50';
    });

    // Add event listener for generate button
    generateButton.addEventListener('click', async () => {
        try {
            // Update status
            statusDisplay.textContent = 'Processing content...';
            generateButton.disabled = true;
            generateButton.style.backgroundColor = '#cccccc';

            // Scrape content
            const websiteContent = await scrapeAndCleanText();
            websiteContent.output_type = outputTypeSelector.value;

            // Process content through backend
            const result = await processContent(websiteContent);

            // Display summary
            const summaryElement = document.createElement('div');
            summaryElement.style.cssText = `
                margin: 10px 0;
                padding: 10px;
                background: #f5f5f5;
                border-radius: 4px;
                font-size: 14px;
                max-height: 200px;
                overflow-y: auto;
                line-height: 1.4;
            `;
            summaryElement.textContent = result.summary;
            
            // Remove previous summary if exists
            const previousSummary = content.querySelector('.summary');
            if (previousSummary) {
                previousSummary.remove();
            }
            
            summaryElement.classList.add('summary');
            content.appendChild(summaryElement);

            statusDisplay.textContent = 'Summary generated successfully';
            
            // Add a note about audio generation
            const audioNote = document.createElement('div');
            audioNote.style.cssText = `
                margin-top: 10px;
                font-size: 12px;
                color: #666;
                font-style: italic;
                text-align: center;
            `;
            audioNote.textContent = 'Audio generation feature coming soon!';
            content.appendChild(audioNote);

        } catch (error) {
            statusDisplay.textContent = 'Error: ' + error.message;
            console.error('Error:', error);
        } finally {
            generateButton.disabled = false;
            generateButton.style.backgroundColor = '#4CAF50';
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
        transition: color 0.3s;
    `;
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.color = '#000';
    });
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.color = '#666';
    });
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
        transition: color 0.3s;
    `;
    minimizeButton.addEventListener('mouseenter', () => {
        minimizeButton.style.color = '#000';
    });
    minimizeButton.addEventListener('mouseleave', () => {
        minimizeButton.style.color = '#666';
    });

    const content = document.createElement('div');
    content.appendChild(statusDisplay);
    content.appendChild(outputTypeSelector);
    content.appendChild(generateButton);

    popup.appendChild(closeButton);
    popup.appendChild(minimizeButton);
    popup.appendChild(content);

    // Minimize functionality
    minimizeButton.addEventListener('click', () => {
        if (content.style.display === 'none') {
            content.style.display = 'block';
            minimizeButton.innerHTML = '−';
            popup.style.height = 'auto';
        } else {
            content.style.display = 'none';
            minimizeButton.innerHTML = '+';
            popup.style.height = '30px';
        }
    });

    // Make popup draggable
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    popup.addEventListener('mousedown', (e) => {
        if (e.target === popup || e.target === statusDisplay) {
            isDragging = true;
            initialX = e.clientX - popup.offsetLeft;
            initialY = e.clientY - popup.offsetTop;
            popup.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            // Keep popup within window bounds
            currentX = Math.max(0, Math.min(currentX, window.innerWidth - popup.offsetWidth));
            currentY = Math.max(0, Math.min(currentY, window.innerHeight - popup.offsetHeight));
            
            popup.style.left = currentX + 'px';
            popup.style.top = currentY + 'px';
            popup.style.right = 'auto';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        popup.style.cursor = 'default';
    });

    document.body.appendChild(popup);
}

// Helper functions for API integration
async function scrapeAndCleanText() {
    const text = document.body.innerText;
    const cleanedText = text
        .replace(/[^\w\s.,!?-]/g, '') // Remove special characters
        .replace(/\s+/g, ' ')         // Remove extra whitespace
        .trim();

    return {
        url: window.location.href,
        content: cleanedText,
        output_type: "music" // Default value, will be updated by selector
    };
}

async function processContent(websiteContent) {
    const response = await fetch('http://localhost:8000/process', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(websiteContent)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Processing failed');
    }

    return await response.json();
}

// Initialize popup when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPopup);
} else {
    createPopup();
}
