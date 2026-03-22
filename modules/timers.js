export function renderTimers(container) {
    container.innerHTML = `
        <div class="flex gap-4 mb-6" id="timer-tabs">
            <button class="btn-primary" data-tab="pomodoro">Pomodoro</button>
            <button class="btn-secondary" data-tab="stopwatch">Stopwatch</button>
            <button class="btn-secondary" data-tab="worldclock">World Clock</button>
        </div>
        
        <div id="tab-content"></div>
    `;

    const tabs = container.querySelectorAll('#timer-tabs button');
    tabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabs.forEach(t => { t.className = 'btn-secondary'; });
            e.target.className = 'btn-primary';
            renderTab(e.target.dataset.tab, container.querySelector('#tab-content'));
            if (window.lucide) window.lucide.createIcons();
        });
    });

    // Handle Pomodoro state out of DOM so it persists across tab switches
    // But for a simple prototype, we'll keep it simple and reset on tab switch 
    // or just render Pomodoro initially.
    renderTab('pomodoro', container.querySelector('#tab-content'));
}

let pomodoroInterval;
let stopwatchInterval;
let timeLeft = 25 * 60; // 25 min defaults
let isPomodoroRunning = false;
let swTime = 0;
let isSwRunning = false;

function renderTab(tab, contentDiv) {
    clearInterval(pomodoroInterval); 
    clearInterval(stopwatchInterval);
    
    if (tab === 'pomodoro') {
        contentDiv.innerHTML = `
            <div class="card flex-col items-center" style="text-align: center; padding: 48px 24px;">
                <h2 class="mb-4" style="font-size: 2rem;">Pomodoro Timer</h2>
                <div class="flex gap-4 mb-6">
                    <button class="btn-secondary" id="pom-25">25:00</button>
                    <button class="btn-secondary" id="pom-5">05:00</button>
                    <button class="btn-secondary" id="pom-15">15:00</button>
                </div>
                <div id="pom-display" style="font-size: 6rem; font-weight: 700; letter-spacing: -2px; margin-bottom: 32px; font-variant-numeric: tabular-nums;">
                    ${formatTime(timeLeft)}
                </div>
                <div class="flex gap-4">
                    <button class="btn-primary" id="pom-start-btn" style="width: 150px; font-size: 1.25rem;">${isPomodoroRunning ? 'Pause' : 'Start'}</button>
                    <button class="btn-secondary" id="pom-reset-btn" style="width: 150px; font-size: 1.25rem;">Reset</button>
                </div>
            </div>
        `;
        
        const display = contentDiv.querySelector('#pom-display');
        const startBtn = contentDiv.querySelector('#pom-start-btn');
        
        const updateDisplay = () => { display.textContent = formatTime(timeLeft); };
        
        contentDiv.querySelector('#pom-25').onclick = () => { timeLeft = 25*60; isPomodoroRunning=false; updateDisplay(); startBtn.textContent='Start'; };
        contentDiv.querySelector('#pom-5').onclick = () => { timeLeft = 5*60; isPomodoroRunning=false; updateDisplay(); startBtn.textContent='Start'; };
        contentDiv.querySelector('#pom-15').onclick = () => { timeLeft = 15*60; isPomodoroRunning=false; updateDisplay(); startBtn.textContent='Start'; };
        
        startBtn.onclick = () => {
            if (isPomodoroRunning) {
                clearInterval(pomodoroInterval);
                isPomodoroRunning = false;
                startBtn.textContent = 'Start';
            } else {
                isPomodoroRunning = true;
                startBtn.textContent = 'Pause';
                pomodoroInterval = setInterval(() => {
                    timeLeft--;
                    updateDisplay();
                    if(timeLeft <= 0) {
                        clearInterval(pomodoroInterval);
                        isPomodoroRunning = false;
                        startBtn.textContent = 'Start';
                        new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play();
                        alert('Time is up!');
                    }
                }, 1000);
            }
        };
        
        contentDiv.querySelector('#pom-reset-btn').onclick = () => {
            clearInterval(pomodoroInterval);
            isPomodoroRunning = false;
            timeLeft = 25*60;
            updateDisplay();
            startBtn.textContent = 'Start';
        };
        
        // Resume if already running
        if(isPomodoroRunning) {
             pomodoroInterval = setInterval(() => {
                timeLeft--;
                updateDisplay();
                if(timeLeft <= 0) {
                    clearInterval(pomodoroInterval);
                    isPomodoroRunning = false;
                    startBtn.textContent = 'Start';
                    new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play();
                    alert('Time is up!');
                }
            }, 1000);
        }

    } else if (tab === 'stopwatch') {
         contentDiv.innerHTML = `
            <div class="card flex-col items-center" style="text-align: center; padding: 48px 24px;">
                <h2 class="mb-4" style="font-size: 2rem;">Stopwatch</h2>
                <div id="sw-display" style="font-size: 6rem; font-weight: 700; letter-spacing: -2px; margin-bottom: 32px; font-variant-numeric: tabular-nums;">
                    ${formatTimeMs(swTime)}
                </div>
                <div class="flex gap-4">
                    <button class="btn-primary" id="sw-start-btn" style="width: 150px; font-size: 1.25rem;">${isSwRunning ? 'Pause' : 'Start'}</button>
                    <button class="btn-secondary" id="sw-reset-btn" style="width: 150px; font-size: 1.25rem;">Reset</button>
                    <button class="btn-secondary" id="sw-lap-btn" style="width: 150px; font-size: 1.25rem;">Lap</button>
                </div>
                <div id="sw-laps" class="mt-6 w-full text-left max-w-md mx-auto" style="margin-top: 32px; width: 100%; max-width: 400px; text-align: left;">
                    <!-- Laps -->
                </div>
            </div>
        `;
        
        const display = contentDiv.querySelector('#sw-display');
        const startBtn = contentDiv.querySelector('#sw-start-btn');
        const lapsContainer = contentDiv.querySelector('#sw-laps');
        let lapCount = 1;
        
        const updateDisplay = () => { display.textContent = formatTimeMs(swTime); };
        
        startBtn.onclick = () => {
            if (isSwRunning) {
                clearInterval(stopwatchInterval);
                isSwRunning = false;
                startBtn.textContent = 'Start';
            } else {
                isSwRunning = true;
                startBtn.textContent = 'Pause';
                stopwatchInterval = setInterval(() => {
                    swTime += 10;
                    updateDisplay();
                }, 10);
            }
        };
        
        contentDiv.querySelector('#sw-reset-btn').onclick = () => {
             clearInterval(stopwatchInterval);
             isSwRunning = false;
             swTime = 0;
             lapCount = 1;
             updateDisplay();
             startBtn.textContent = 'Start';
             lapsContainer.innerHTML = '';
        };
        
        contentDiv.querySelector('#sw-lap-btn').onclick = () => {
            if(swTime > 0) {
                 const l = document.createElement('div');
                 l.className = 'flex space-between p-2 border-b';
                 l.style = 'border-bottom: var(--glass-border); padding: 8px 0;';
                 l.innerHTML = `<span>Lap ${lapCount++}</span> <span style="font-family: monospace; font-size:1.1rem">${formatTimeMs(swTime)}</span>`;
                 lapsContainer.prepend(l);
            }
        }
        
    } else if (tab === 'worldclock') {
        const zones = [
            { name: "New York", tz: "America/New_York" },
            { name: "London", tz: "Europe/London" },
            { name: "Dubai", tz: "Asia/Dubai" },
            { name: "Tokyo", tz: "Asia/Tokyo" },
            { name: "Sydney", tz: "Australia/Sydney" }
        ];
        
        let html = '<div class="grid grid-cols-2 gap-4">';
        zones.forEach(z => {
            html += `
                <div class="card flex space-between items-center" style="padding: 32px 24px;">
                    <div>
                        <h3 style="font-size: 1.5rem; color: var(--text-secondary);">${z.name}</h3>
                        <p style="font-size: 0.9rem; color: var(--text-muted);">${z.tz}</p>
                    </div>
                    <div style="font-size: 2.5rem; font-weight: 600;" class="tz-time" data-tz="${z.tz}">--:--</div>
                </div>
            `;
        });
        html += '</div>';
        contentDiv.innerHTML = html;
        
        const updateClocks = () => {
            contentDiv.querySelectorAll('.tz-time').forEach(el => {
                const tz = el.dataset.tz;
                el.textContent = new Date().toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
            });
        };
        updateClocks();
        stopwatchInterval = setInterval(updateClocks, 1000); // reuse interval var
    }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function formatTimeMs(ms) {
    const m = Math.floor(ms / 60000).toString().padStart(2, '0');
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const msFormatted = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${m}:${s}.${msFormatted}`;
}
