export default class AudioManager {
    constructor() {
        this.audioContext = null;
        this.gainNode = null;
        this.source = null;
        this.audioBuffer = null;
        this.isPlaying = false;
        
        // We defer AudioContext creation until user interaction (start button)
    }

    async init() {
        if (this.audioContext) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            
            // Start volume at 0 for fade in
            this.gainNode.gain.value = 0;
            
            const response = await fetch('/theme.mp3');
            const arrayBuffer = await response.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        } catch (e) {
            console.error("Audio initialization failed:", e);
        }
    }

    async play() {
        await this.init();
        
        if (!this.audioBuffer || this.isPlaying) return;
        
        // Ensure context is running (required by some browsers)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.audioBuffer;
        this.source.loop = true;
        this.source.connect(this.gainNode);
        
        this.source.start(0);
        this.isPlaying = true;
        
        // Fade in over 2s
        this.gainNode.gain.setTargetAtTime(1.0, this.audioContext.currentTime, 0.5);
    }

    stop() {
        if (!this.isPlaying || !this.source) return;
        
        // Fade out
        this.gainNode.gain.setTargetAtTime(0.0, this.audioContext.currentTime, 0.5);
        
        setTimeout(() => {
            this.source.stop();
            this.source.disconnect();
            this.source = null;
            this.isPlaying = false;
        }, 2000);
    }
}
