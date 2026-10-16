<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Аудио Плеер</title>
    <style>
        body {
            margin: 0;
            background: #0d1117;
            color: #c9d1d9;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        /* Стильный контейнер плеера */
        .player-container {
            background: #161b22;
            padding: 30px;
            border-radius: 20px;
            border: 1px solid #30363d;
            width: 320px;
            text-align: center;
            box-shadow: 0 12px 32px rgba(0,0,0,0.5);
        }

        /* Виниловая пластинка / Обложка */
        .cover {
            width: 140px;
            height: 140px;
            background: linear-gradient(45deg, #1f6feb, #238636);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 5px solid #21262d;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            transition: transform 0.5s ease;
        }

        .cover.playing {
            animation: rotate 4s linear infinite;
        }

        .cover-inner {
            width: 40px;
            height: 40px;
            background: #0d1117;
            border-radius: 50%;
        }

        h2 {
            font-size: 18px;
            margin: 0 0 5px;
            color: #fff;
        }

        .author {
            font-size: 14px;
            color: #8b949e;
            margin-bottom: 25px;
        }

        /* Кнопка Play */
        .play-btn {
            background: #238636;
            color: #fff;
            border: none;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(35, 134, 54, 0.4);
            margin-bottom: 20px;
        }

        .play-btn:hover {
            transform: scale(1.05);
        }

        .play-btn.playing {
            background: #da3637;
            box-shadow: 0 4px 12px rgba(218, 54, 55, 0.4);
        }

        /* Ползунок громкости */
        .volume-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 25px;
        }

        .volume-slider {
            width: 150px;
            cursor: pointer;
        }

        /* Список треков с четкой обводкой */
        .track-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
            border-top: 1px solid #30363d;
            padding-top: 20px;
        }

        .track-item {
            background: #21262d;
            color: #c9d1d9;
            border: 2px solid transparent; /* Заготовка под обводку */
            padding: 12px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            text-align: left;
            transition: all 0.2s ease;
        }

        .track-item:hover {
            background: #30363d;
        }

        /* Активное состояние — ЧЕТКАЯ ОБВОДКА */
        .track-item.active {
            border-color: #58a6ff !important;
            background: rgba(88, 166, 255, 0.1);
            color: #58a6ff;
            font-weight: 600;
        }

        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>

    <div class="player-container">
        <!-- Обложка -->
        <div id="cover" class="cover">
            <div class="cover-inner"></div>
        </div>

        <!-- Информация о треке -->
        <h2 id="track-title">Ночной Эмбиент</h2>
        <div class="author">Встроенный синтезатор звука</div>

        <!-- Кнопка управления -->
        <button id="play-btn" class="play-btn">PLAY</button>

        <!-- Контроль громкости -->
        <div class="volume-container">
            <span>🔈</span>
            <input type="range" id="volume" class="volume-slider" min="0" max="1" step="0.05" value="1">
            <span>🔊</span>
        </div>

        <!-- Интерактивный плейлист -->
        <div class="track-list">
            <div class="track-item active" data-track="ambient">✨ Мелодия 1: Ночной Эмбиент</div>
            <div class="track-item" data-track="waves">🎹 Мелодия 2: Глубокие Клавиши</div>
            <div class="track-item" data-track="space">🚀 Мелодия 3: Космический Пульс</div>
        </div>
    </div>

    <script>
        const playBtn = document.getElementById('play-btn');
        const cover = document.getElementById('cover');
        const trackTitle = document.getElementById('track-title');
        const volumeSlider = document.getElementById('volume');
        const trackItems = document.querySelectorAll('.track-item');

        let isPlaying = false;
        let currentTrack = 'ambient';
        let audioCtx = null;
        let mainVolume = null;
        let soundInterval = null;

        // Инициализация Web Audio API
        function initAudio() {
            if (audioCtx) return;
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            mainVolume = audioCtx.createGain();
            mainVolume.gain.setValueAtTime(volumeSlider.value, audioCtx.currentTime); 
            mainVolume.connect(audioCtx.destination);
        }

        // Чистая генерация музыкальных нот (музыка из кода без багов)
        function playTone(freq, type, duration) {
            if (!audioCtx || !isPlaying) return;
            
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            
            gainNode.gain.setValueAtTime(mainVolume.gain.value * 0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        }

        // Музыкальные циклы плеера
        function startMusicLoop() {
            clearInterval(soundInterval);
            if (!isPlaying) return;

            if (currentTrack === 'ambient') {
                const chord = [261.63, 329.63, 392.00, 493.88]; // Красивый аккорд Cmaj7
                soundInterval = setInterval(() => {
                    const note = chord[Math.floor(Math.random() * chord.length)];
                    playTone(note, 'sine', 1.5);
                }, 600);
            } 
            else if (currentTrack === 'waves') {
                const chord = [196.00, 246.94, 293.66, 369.99]; // Меланхоличный Gmaj7 в басу
                soundInterval = setInterval(() => {
                    const note = chord[Math.floor(Math.random() * chord.length)];
                    playTone(note, 'triangle', 2.0);
                }, 1000);
            } 
            else if (currentTrack === 'space') {
                const sequence = [110.00, 220.00, 165.00, 330.00]; // Пульсирующий арпеджио
                let step = 0;
                soundInterval = setInterval(() => {
                    playTone(sequence[step % sequence.length], 'sine', 0.4);
                    step++;
                }, 300);
            }
        }

        function stopMusicLoop() {
            clearInterval(soundInterval);
        }

        // Переключение состояний Play / Pause
        function togglePlay() {
            initAudio();
            if (audioCtx.state === 'suspended') audioCtx.resume();

            if (!isPlaying) {
                isPlaying = true;
                playBtn.innerText = 'PAUSE';
                playBtn.classList.add('playing');
                cover.classList.add('playing');
                startMusicLoop();
            } else {
                isPlaying = false;
                playBtn.innerText = 'PLAY';
                playBtn.classList.remove('playing');
                cover.classList.remove('playing');
                stopMusicLoop();
            }
        }

        playBtn.addEventListener('click', togglePlay);

        // Изменение громкости на лету
        volumeSlider.addEventListener('input', function() {
            if (mainVolume) {
                mainVolume.gain.setValueAtTime(this.value, audioCtx.currentTime);
            }
        });

        // Клик по трекам из списка — ОБВОДКА ТЕПЕРЬ ПЕРЕХОДИТ
        trackItems.forEach(item => {
            item.addEventListener('click', function() {
                // Снимаем класс active со всех треков
                trackItems.forEach(t => t.classList.remove('active'));
                
                // Добавляем класс active на тот, по которому кликнули
                this.classList.add('active');

                // Меняем текущий трек и заголовок
                currentTrack = this.getAttribute('data-track');
                trackTitle.innerText = this.innerText.substring(11); // Убираем эмодзи из заголовка

                if (isPlaying) {
                    startMusicLoop();
                }
            });
        });
    </script>
</body>
</html>
                
