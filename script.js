const triggerBtn = document.getElementById('trigger-btn');
const disc = document.getElementById('disc');
const nowPlaying = document.getElementById('now-playing');
const tracks = document.querySelectorAll('.track');

let isPlaying = false;
let activeTrackId = "relax";
let audioCtx = null;
let soundInterval = null;

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

// Генератор мягких, обволакивающих музыкальных нот
function playSoftTone(freq, duration, volume = 0.2) {
    if (!isPlaying || !audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Только гладкая синусоида (sine), никаких резких пил!
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Срезаем высокие частоты, делая звук максимально тёплым и глухим
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, audioCtx.currentTime);

    // Плавное нарастание (Attack) и долгое, мягкое затухание (Release)
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// Музыкальные релакс-алгоритмы
function runMusicLoop() {
    clearInterval(soundInterval);
    if (!isPlaying) return;

    if (activeTrackId === "relax") {
        // Красивый, расслабляющий пятидольный аккорд (гармония покоя)
        const notes = [261.63, 329.63, 392.00, 440.00, 523.25]; // До-Ми-Соль-Ля-До
        soundInterval = setInterval(() => {
            const randomNote = notes[Math.floor(Math.random() * notes.length)];
            playSoftTone(randomNote, 3.0, 0.15); // Длинное звучание нот с наложением друг на друга
        }, 1200);
    } 
    else if (activeTrackId === "piano") {
        // Медленный перебор нот ночного фортепиано
        const melody = [196.00, 246.94, 293.66, 392.00, 493.88]; // Соль-Си-Ре-Соль-Си
        let step = 0;
        soundInterval = setInterval(() => {
            playSoftTone(melody[step % melody.length], 2.5, 0.2);
            step++;
        }, 1500);
    } 
    else if (activeTrackId === "space") {
        // Глубокие, редкие космические переливы в низком регистре
        const spaceNotes = [146.83, 220.00, 293.66, 349.23]; // Ре-Ля-Ре-Фа
        soundInterval = setInterval(() => {
            const randomNote = spaceNotes[Math.floor(Math.random() * spaceNotes.length)];
            playSoftTone(randomNote, 4.0, 0.25);
        }, 2000);
    }
}

// Кнопка Play/Pause
triggerBtn.addEventListener('click', function() {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    if (!isPlaying) {
        isPlaying = true;
        this.innerText = 'ПАУЗА';
        this.classList.add('active');
        disc.classList.add('playing');
        runMusicLoop();
    } else {
        isPlaying = false;
        this.innerText = 'ВКЛЮЧИТЬ МУЗЫКУ';
        this.classList.remove('active');
        disc.classList.remove('playing');
        clearInterval(soundInterval);
    }
});

// Переключение треков и обводки
tracks.forEach(track => {
    track.addEventListener('click', function() {
        tracks.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        activeTrackId = this.getAttribute('data-id');
        nowPlaying.innerText = "Текущий трек: " + this.innerText.substring(11);

        if (isPlaying) {
            runMusicLoop();
        }
    });
});
