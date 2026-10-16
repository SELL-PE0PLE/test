const powerBtn = document.getElementById('power-btn');
let soundActive = false;
let currentTrack = 'ambient';

let audioCtx = null;
let mainVolume = null;
let activeSources = [];

// Инициализация звукового движка (Web Audio API)
function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    mainVolume = audioCtx.createGain();
    mainVolume.gain.setValueAtTime(0.5, audioCtx.currentTime); // 50% громкости
    mainVolume.connect(audioCtx.destination);
}

// Генератор чистого процедурного шума
function createNoiseBuffer() {
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
    }
    return buffer;
}

function stopSound() {
    activeSources.forEach(src => { try { src.stop(); } catch(e){} });
    activeSources = [];
}

// Воспроизведение выбранного пресета
function playSound() {
    if (!soundActive || !audioCtx) return;
    stopSound();

    if (audioCtx.state === 'suspended') audioCtx.resume();

    // 1. Эмбиент (Глубокие переливы)
    if (currentTrack === 'ambient') {
        const freqs =;
        freqs.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            
            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 1.5);
            
            const lfo = audioCtx.createOscillator();
            const lfoGain = audioCtx.createGain();
            lfo.frequency.setValueAtTime(0.1 + (idx * 0.03), audioCtx.currentTime);
            lfoGain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            
            lfo.connect(lfoGain); lfoGain.connect(gain.gain);
            osc.connect(gain); gain.connect(mainVolume);
            
            osc.start(); lfo.start();
            activeSources.push(osc, lfo);
        });
    } 
    // 2. Морские волны
    else if (currentTrack === 'waves') {
        const noise = audioCtx.createBufferSource();
        noise.buffer = createNoiseBuffer();
        noise.loop = true;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        const gain = audioCtx.createGain();
        
        setInterval(() => {
            if (currentTrack !== 'waves' || !soundActive) return;
            const now = audioCtx.currentTime;
            filter.frequency.linearRampToValueAtTime(250, now);
            filter.frequency.exponentialRampToValueAtTime(700, now + 3);
            gain.gain.linearRampToValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0.3, now + 3);
        }, 6000);

        noise.connect(filter); filter.connect(gain); gain.connect(mainVolume);
        noise.start(); activeSources.push(noise);
    }
    // 3. Дождь
    else if (currentTrack === 'rain') {
        const noise = audioCtx.createBufferSource();
        noise.buffer = createNoiseBuffer();
        noise.loop = true;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);

        noise.connect(filter); filter.connect(gain); gain.connect(mainVolume);
        noise.start(); activeSources.push(noise);
    }
    // 4. Птицы
    else if (currentTrack === 'birds') {
        function chirp() {
            if (currentTrack !== 'birds' || !soundActive) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const now = audioCtx.currentTime;
            
            osc.frequency.setValueAtTime(900 + Math.random() * 300, now);
            osc.frequency.exponentialRampToValueAtTime(1600 + Math.random() * 400, now + 0.08);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            
            osc.connect(gain); gain.connect(mainVolume);
            osc.start(); osc.stop(now + 0.15);
            setTimeout(chirp, 700 + Math.random() * 1800);
        }
        chirp();
    }
}

// Переключение пресетов
window.switchTrack = function(trackName) {
    currentTrack = trackName;
    document.querySelectorAll('.track-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    if (soundActive) playSound();
}

// Логика кнопки ВКЛ/ВЫКЛ
powerBtn.addEventListener('click', function() {
    initAudio();
    
    if (!soundActive) {
        soundActive = true;
        this.innerText = 'ВЫКЛЮЧИТЬ ЗВУК';
        this.classList.add('active');
        playSound();
    } else {
        soundActive = false;
        this.innerText = 'ВКЛЮЧИТЬ ЗВУК';
        this.classList.remove('active');
        stopSound();
    }
});
