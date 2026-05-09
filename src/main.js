import Experience from './experience/Experience.js';

const experience = new Experience(document.querySelector('canvas#webgl-canvas'));

const loadingOverlay = document.getElementById('loading-overlay');
const startContainer = document.getElementById('start-container');
const btnWithMusic = document.getElementById('btn-with-music');
const btnNoMusic = document.getElementById('btn-no-music');
const uiLayer = document.getElementById('ui-layer');
const welcomeModal = document.getElementById('welcome-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const dontShowAgain = document.getElementById('dont-show-again');

// Simple loading progress simulation since actual loading might be fast
let progress = 0;
const loadingText = document.getElementById('loading-text');

const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 10) + 5;
    if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        loadingText.style.display = 'none';
        document.querySelector('.web-spinner').style.display = 'none';
        startContainer.style.display = 'flex';
    }
    loadingText.innerText = `${progress}%`;
}, 100);

const startExperience = (withMusic) => {
    loadingOverlay.style.opacity = '0';
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
        uiLayer.style.opacity = '1';
        
        if (withMusic && experience.audioManager) {
            experience.audioManager.play();
        }

        const showModal = localStorage.getItem('spider-man-welcome-hidden') !== 'true';
        if (showModal) {
            welcomeModal.style.display = 'flex';
        }
    }, 1000);
};

btnWithMusic.addEventListener('click', () => startExperience(true));
btnNoMusic.addEventListener('click', () => startExperience(false));

btnCloseModal.addEventListener('click', () => {
    if (dontShowAgain.checked) {
        localStorage.setItem('spider-man-welcome-hidden', 'true');
    }
    welcomeModal.style.display = 'none';
});
