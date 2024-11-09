// Create audio element
const audio = new Audio(chrome.runtime.getURL('music.mp3'));
audio.volume = 0.5;
audio.loop = true;

// Create toggle button
const toggleButton = document.createElement('button');
toggleButton.innerHTML = '🔇';
toggleButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    padding: 10px;
    border-radius: 50%;
    cursor: pointer;
    background: white;
    border: 1px solid #ccc;
`;

toggleButton.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        toggleButton.innerHTML = '🔊';
    } else {
        audio.pause();
        toggleButton.innerHTML = '🔇';
    }
});

document.body.appendChild(toggleButton);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleMusic") {
        if (audio.paused) {
            audio.play();
            toggleButton.innerHTML = '🔊';
        } else {
            audio.pause();
            toggleButton.innerHTML = '🔇';
        }
    }
});
