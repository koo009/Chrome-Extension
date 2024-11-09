// Create audio element
const audio = new Audio(chrome.runtime.getURL('music.mp3'));

// Set audio properties
audio.volume = 0.5; // 50% volume
audio.loop = true;  // Will loop the music

// Play audio when page loads
document.addEventListener('DOMContentLoaded', () => {
    audio.play().catch(error => {
        console.log('Audio playback failed:', error);
    });
});

// Optional: Add control to stop/start music
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
