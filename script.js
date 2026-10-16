// База данных из 30 вариантов звука для стресс-теста аудиосистем
const soundDatabase = {
    // === СЕКЦИЯ 1: ЧИСТЫЕ СИГНАЛЫ (Пила / Sawtooth) ===
    "1": { type: "sawtooth", freq: 110.00, speed: 400, label: "Вариант 1: Суб-бас пила" },
    "2": { type: "sawtooth", freq: 220.00, speed: 350, label: "Вариант 2: Низкая пила" },
    "3": { type: "sawtooth", freq: 293.66, speed: 400, label: "Вариант 3: Классический лид Ре" },
    "4": { type: "sawtooth", freq: 440.00, speed: 300, label: "Вариант 4: Стандартный тон Ля" },
    "5": { type: "sawtooth", freq: 587.33, speed: 250, label: "Вариант 5: Высокая пила" },
    "6": { type: "sawtooth", freq: 880.00, speed: 200, label: "Вариант 6: Пронзительный зуммер" },

    // === СЕКЦИЯ 2: ПЛОТНЫЕ ИМПУЛЬСЫ (Квадрат / Square) ===
    "7": { type: "square", freq: 130.81, speed: 500, label: "Вариант 7: Басовый квадрат" },
    "8": { type: "square", freq: 196.00, speed: 400, label: "Вариант 8: Ретро Пульс Соль" },
    "9": { type: "square", freq: 261.63, speed: 300, label: "Вариант 9: 8-битное До" },
    "10": { type: "square", freq: 329.63, speed: 350, label: "Вариант 10: Аркадный Ми" },
    "11": { type: "square", freq: 493.88, speed: 250, label: "Вариант 11: Высокий информер" },
    "12": { type: "square", freq: 659.25, speed: 150, label: "Вариант 12: Быстрый чиптюн-клик" },

    // === СЕКЦИЯ 3: МЯГКИЕ ТОНА (Треугольник / Triangle) ===
    "13": { type: "triangle", freq: 98.00, speed: 600, label: "Вариант 13: Мягкий суб-бас" },
    "14": { type: "triangle", freq: 146.83, speed: 500, label: "Вариант 14: Теплый тон" },
    "15": { type: "triangle", freq: 220.00, speed: 450, label: "Вариант 15: Глубокое Ля" },
    "16": { type: "triangle", freq: 349.23, speed: 400, label: "Вариант 16: Спокойный Фа" },
    "17": { type: "triangle", freq: 523.25, speed: 300, label: "Вариант 17: Чистый высокий тон" },
    "18": { type: "triangle", freq: 698.46, speed: 350, label: "Вариант 18: Колокольчик треугольника" },

    // === СЕКЦИЯ 4: ЧИСТЫЙ СИНУС (Синусоида / Sine) ===
    "19": { type: "sine", freq: 120.00, speed: 400, label: "Вариант 19: Акустический гул" },
    "20": { type: "sine", freq: 180.00, speed: 500, label: "Вариант 20: Эмбиент бас" },
    "21": { type: "sine", freq: 240.00, speed: 450, label: "Вариант 21: Камертон 240Гц" },
    "22": { type: "sine", freq: 360.00, speed: 350, label: "Вариант 22: Фоновое колебание" },
    "23": { type: "sine", freq: 480.00, speed: 300, label: "Вариант 23: Сигнал уведомления" },
    "24": { type: "sine", freq: 720.00, speed: 200, label: "Вариант 24: Свист синуса" },

    // === СЕКЦИЯ 5: ЭКСТРЕМАЛЬНЫЕ ТЕСТЫ (Ультра-частоты) ===
    "25": { type: "sawtooth", freq: 65.41, speed: 600, label: "Вариант 25: Предельный бас пилы" },
    "26": { type: "square", freq: 82.41, speed: 500, label: "Вариант 26: Низкий гудящий квадрат" },
    "27": { type: "sine", freq: 1000.00, speed: 150, label: "Вариант 27: Тестовый писк 1кГц" },
    "28": { type: "triangle", freq: 1200.00, speed: 200, label: "Вариант 28: Высокий кристалл" },
    "29": { type: "sine", freq: 1500.00, speed: 250, label: "Вариант 29: Ультра-сигнал" },
    "30": { type: "square", freq: 2000.00, speed: 100, label: "Вариант 30: Предельный лазер" }
};

const triggerBtn = document.getElementById('trigger-btn');
const disc = document.getElementById('disc');
const nowPlaying = document.getElementById('now-playing');
const playlistContainer = document.getElementById('playlist');

let isPlaying = false;
let activeTrackId = "1";
let audioCtx = null;
let soundInterval = null;

// Автоматическая генерация 30 треков в интерфейсе
function buildPlaylist() {
    playlistContainer.innerHTML = Object.keys(soundDatabase).map(id => `
        <div class="track ${id === '1' ? 'active' : ''}" data-id="${id}">
            🎵 ${soundDatabase[id].label}
        </div>
    `).join('');

    // Навешиваем клики на новые элементы
    document.querySelectorAll('.track').forEach(track => {
        track.addEventListener('click', function() {
            document.querySelectorAll('.track').forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            activeTrackId = this.getAttribute('data-id');
            nowPlaying.innerText = "Текущий трек: " + soundDatabase[activeTrackId].label;

            if (isPlaying) {
                runLoop();
                playSoundStroke();
            }
        });
    });
}

// Генерация звука на 100% громкости
function playSoundStroke() {
    if (!isPlaying || !audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    // Устанавливаем 100% громкость звукового узла
    gain.gain.setValueAtTime(1.0, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    const trackConfig = soundDatabase[activeTrackId] || soundDatabase["1"];
    
    osc.type = trackConfig.type;
    osc.frequency.setValueAtTime(trackConfig.freq, audioCtx.currentTime);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
}

function runLoop() {
    clearInterval(soundInterval);
    if (!isPlaying) return;
    
    const trackConfig = soundDatabase[activeTrackId] || soundDatabase["1"];
    soundInterval = setInterval(playSoundStroke, trackConfig.speed);
}

// Логика кнопки управления
triggerBtn.addEventListener('click', function() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (!isPlaying) {
        isPlaying = true;
        this.innerText = 'ПАУЗА';
        this.classList.add('active');
        disc.classList.add('playing');
        runLoop();
        playSoundStroke();
    } else {
        isPlaying = false;
        this.innerText = 'ВКЛЮЧИТЬ ЗВУК';
        this.classList.remove('active');
        disc.classList.remove('playing');
        clearInterval(soundInterval);
    }
});

// Инициализация при загрузке
buildPlaylist();
           
