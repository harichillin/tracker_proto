// --- DASHBOARD MODULE ---
function renderDashboard(container) {
    container.innerHTML = `
        <div class="grid gap-6">
            <div class="grid grid-cols-4">
                <div class="card stat-card"><div class="stat-icon">[T]</div><div class="stat-content"><h3>Study Time</h3><p id="dash-study-time">0h 0m</p></div></div>
                <div class="card stat-card"><div class="stat-icon">[S]</div><div class="stat-content"><h3>Streak</h3><p id="dash-streak">0 days</p></div></div>
                <div class="card stat-card"><div class="stat-icon">[W]</div><div class="stat-content"><h3>Water</h3><p id="dash-water">0 / 8</p></div></div>
                <div class="card stat-card"><div class="stat-icon">[D]</div><div class="stat-content"><h3>Tasks</h3><p id="dash-tasks">0 / 0</p></div></div>
            </div>
            <div class="grid grid-cols-3">
                <div class="card" style="grid-column: span 2;">
                    <div class="flex space-between items-center mb-4"><h2 style="font-size: 1.25rem;">Upcoming Events</h2><button class="icon-btn" onclick="window.openApp('calendar')">→</button></div>
                    <div id="dash-events-list"></div>
                </div>
                <div class="card">
                    <div class="flex space-between items-center mb-4"><h2 style="font-size: 1.25rem;">Next Action</h2><button class="icon-btn" onclick="window.openApp('todos')">+</button></div>
                    <div id="dash-next-action"></div>
                </div>
            </div>
            <div class="card">
                <h2 style="font-size: 1.25rem; margin-bottom: 16px;">Quick Actions</h2>
                <div class="flex gap-4">
                    <button class="btn-primary flex items-center gap-2" onclick="window.openApp('timers')">Start Pomodoro</button>
                    <button class="btn-secondary flex items-center gap-2" onclick="window.openApp('planner')">+ Add Log</button>
                    <button class="btn-secondary flex items-center gap-2" onclick="window.openApp('ai')">Ask AI</button>
                </div>
            </div>
        </div>
    `;
    loadDashboardStats(container);
}

function loadDashboardStats(container) {
    const healthDataStr = localStorage.getItem('lumina_health');
    if (healthDataStr) {
        const data = JSON.parse(healthDataStr);
        const todayStr = new Date().toISOString().split('T')[0];
        const todayData = data[todayStr] || {};
        const waterElem = container.querySelector('#dash-water');
        if (todayData.water !== undefined && waterElem) waterElem.textContent = `${todayData.water} / 8`;
    }

    const todosStr = localStorage.getItem('lumina_todos');
    const todosList = container.querySelector('#dash-next-action');
    const tasksCountElem = container.querySelector('#dash-tasks');
    if (todosStr) {
        const todos = JSON.parse(todosStr);
        const pending = todos.filter(t => !t.completed);
        const completed = todos.filter(t => t.completed);
        if (tasksCountElem) tasksCountElem.textContent = `${completed.length} / ${todos.length}`;
        if (todosList) {
            if (pending.length > 0) todosList.innerHTML = `<div class="card mb-2" style="padding:12px;">[*] ${pending[0].title}</div>`;
            else todosList.innerHTML = `<p class="text-muted">All caught up!</p>`;
        }
    } else if (todosList) todosList.innerHTML = `<p class="text-muted">All caught up!</p>`;

    const eventsList = container.querySelector('#dash-events-list');
    const eventsDataStr = localStorage.getItem('lumina_events');
    if (eventsList) {
        if (!eventsDataStr) eventsList.innerHTML = `<p class="text-muted">No upcoming events.</p>`;
        else {
            const data = JSON.parse(eventsDataStr);
            const list = [];
            const today = new Date();
            for(let i=0; i<7; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() + i);
                const fullD = d.toISOString().split('T')[0];
                const parts = fullD.split('-');
                const monthDay = parts[1]+"-"+parts[2];
                const dayEvs = (data[fullD] || []).concat(data[monthDay] || []);
                dayEvs.forEach(ev => {
                    list.push({ dateStr: fullD, displayDate: i===0?"Today":d.toLocaleDateString([], {weekday:'short', month:'short', day:'numeric'}), title: ev.title, isRec: ev.recurring });
                });
            }
            if (list.length > 0) {
                eventsList.innerHTML = list.slice(0, 5).map(ev => `
                    <div class="flex space-between items-center mb-2 p-2 border-b" style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                        <div>
                            <span style="font-weight: bold;">${ev.title}</span>
                            ${ev.isRec ? '<span style="font-size: 0.7rem; border: 1px solid var(--text-main); padding: 2px 6px; margin-left:8px;">Yearly</span>' : ''}
                        </div>
                        <span style="font-size: 0.85rem;">[${ev.displayDate}]</span>
                    </div>
                `).join('');
            } else eventsList.innerHTML = `<p class="text-muted">No upcoming events.</p>`;
        }
    }
}

// --- CALENDAR MODULE ---
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDateStr = new Date().toISOString().split('T')[0];

function renderCalendar(container) {
    container.innerHTML = `
        <div class="card mb-6 flex space-between items-center">
            <h2 style="font-size: 1.5rem;" id="cal-header-title">Calendar</h2>
            <div class="flex gap-2">
                <button class="icon-btn" id="cal-prev">←</button>
                <button class="btn-secondary" id="cal-today">Today</button>
                <button class="icon-btn" id="cal-next">→</button>
            </div>
        </div>
        <div class="grid grid-cols-2">
            <div class="card">
                <div class="flex space-between mb-4" style="text-align: center; font-weight: bold; font-size: 0.85rem;">
                    <div style="width:14%">Sun</div><div style="width:14%">Mon</div><div style="width:14%">Tue</div><div style="width:14%">Wed</div>
                    <div style="width:14%">Thu</div><div style="width:14%">Fri</div><div style="width:14%">Sat</div>
                </div>
                <div id="cal-grid" style="display: flex; flex-wrap: wrap; gap: 4px;"></div>
            </div>
            <div class="card flex-col" style="max-height: 500px">
                <div class="flex space-between items-center mb-4">
                    <h3 id="selected-date-display" style="font-size: 1.25rem;">Selected Date</h3>
                    <button class="btn-primary flex items-center gap-2" id="add-event-btn">+ Event</button>
                </div>
                <div id="day-events-list" style="flex: 1; overflow-y: auto;"></div>
                <div id="add-event-form" class="mt-4" style="display: none; border-top: 1px dashed var(--border-color); padding-top: 16px;">
                    <input type="text" id="event-title" placeholder="Event Title" class="mb-4">
                    <label class="flex items-center gap-2 mb-4" style="cursor: pointer;">
                        <input type="checkbox" id="event-recurring" style="width: auto;">
                        <span class="text-muted">Occurs every year</span>
                    </label>
                    <div class="flex gap-2">
                        <button class="btn-primary flex-1" id="save-event-btn">Save</button>
                        <button class="btn-secondary flex-1" id="cancel-event-btn">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    setupCalendar(container);
    generateCalendar(container);
}

function setupCalendar(container) {
    container.querySelector('#cal-prev').onclick = () => { currentMonth--; if(currentMonth<0){currentMonth=11;currentYear--;} generateCalendar(container); };
    container.querySelector('#cal-next').onclick = () => { currentMonth++; if(currentMonth>11){currentMonth=0;currentYear++;} generateCalendar(container); };
    container.querySelector('#cal-today').onclick = () => { const d=new Date(); currentMonth=d.getMonth(); currentYear=d.getFullYear(); selectedDateStr=d.toISOString().split('T')[0]; generateCalendar(container); };
    container.querySelector('#add-event-btn').onclick = () => { container.querySelector('#add-event-form').style.display='block'; container.querySelector('#event-title').focus(); };
    container.querySelector('#cancel-event-btn').onclick = () => { container.querySelector('#add-event-form').style.display='none'; container.querySelector('#event-title').value=''; container.querySelector('#event-recurring').checked=false; };
    container.querySelector('#save-event-btn').onclick = () => {
        const title=container.querySelector('#event-title').value.trim();
        const recurring=container.querySelector('#event-recurring').checked;
        if(!title) return;
        let evData=getEventsData();
        let key=recurring ? selectedDateStr.substring(5) : selectedDateStr;
        if(!evData[key]) evData[key]=[];
        evData[key].push({ id:Date.now().toString(), title, recurring });
        localStorage.setItem('lumina_events', JSON.stringify(evData));
        container.querySelector('#add-event-form').style.display='none';
        container.querySelector('#event-title').value='';
        generateCalendar(container);
    };
}

function getEventsData() { try { return JSON.parse(localStorage.getItem('lumina_events')||'{}'); } catch(e){return {};} }
function generateCalendar(container) {
    const grid = container.querySelector('#cal-grid');
    if(!grid) return;
    container.querySelector('#cal-header-title').textContent = `${["January","February","March","April","May","June","July","August","September","October","November","December"][currentMonth]} ${currentYear}`;
    grid.innerHTML='';
    const firstDay=new Date(currentYear,currentMonth,1).getDay();
    const days=new Date(currentYear,currentMonth+1,0).getDate();
    const evData=getEventsData();
    for(let i=0;i<firstDay;i++){ const c=document.createElement('div'); c.style.width='calc(14.28% - 4px)'; grid.appendChild(c); }
    const todayStrFull=new Date().toISOString().split('T')[0];
    for(let i=1;i<=days;i++){
        const dateStr=`${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        const mdStr=dateStr.substring(5);
        const isToday=dateStr===todayStrFull, isSel=dateStr===selectedDateStr;
        const cell=document.createElement('div');
        cell.className='cal-day';
        cell.style=`width:calc(14.28% - 4px);aspect-ratio:1;display:flex;align-items:center;justify-content:center;cursor:pointer;background:${isSel?'var(--text-main)':'transparent'};color:${isSel?'var(--bg-main)':'inherit'};font-weight:${isToday||isSel?'bold':'normal'};border:${isToday&&!isSel?'1px dashed var(--text-main)':'1px solid var(--border-color)'}`;
        cell.textContent=i;
        const dayEvs=(evData[dateStr]||[]).concat(evData[mdStr]||[]);
        if(dayEvs.length>0){ const d=document.createElement('div'); d.style=`position:absolute;bottom:2px;right:2px;font-size:0.7rem`;d.textContent='*'; cell.appendChild(d); }
        cell.onclick=()=>{selectedDateStr=dateStr; generateCalendar(container);};
        grid.appendChild(cell);
    }
    displayEventsForDate(container, selectedDateStr);
}
function displayEventsForDate(container, dtStr) {
    const list=container.querySelector('#day-events-list'), title=container.querySelector('#selected-date-display');
    if(!list||!title) return;
    const [y,m,d]=dtStr.split('-');
    title.textContent=new Date(y,m-1,d).toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'});
    const evD=getEventsData(); const md=dtStr.substring(5);
    const evs=(evD[dtStr]||[]).concat(evD[md]||[]);
    if(evs.length===0){ list.innerHTML=`<p class="text-muted" style="text-align:center;padding:24px 0;">No events planned.</p>`; return; }
    list.innerHTML='';
    evs.forEach(ev=>{
        const el=document.createElement('div'); el.className='card mb-4'; el.style='padding:12px 16px;display:flex;justify-content:space-between;align-items:center;';
        el.innerHTML=`<div class="flex items-center gap-2"><span>${ev.title}</span>${ev.recurring?'<span style="font-size:0.75rem;border:1px solid var(--accent);padding:2px 6px;margin-left:8px;border-radius:4px">Yearly</span>':''}</div><button class="icon-btn del-btn" data-id="${ev.id}" data-rec="${ev.recurring}">×</button>`;
        list.appendChild(el);
    });
    list.querySelectorAll('.del-btn').forEach(btn=>btn.onclick=(e)=>{
        const id=e.currentTarget.dataset.id, isRec=e.currentTarget.dataset.rec==='true', k=isRec?md:dtStr, dLocal=getEventsData();
        if(dLocal[k]){ dLocal[k]=dLocal[k].filter(i=>i.id!==id); if(dLocal[k].length===0) delete dLocal[k]; localStorage.setItem('lumina_events',JSON.stringify(dLocal)); generateCalendar(container); }
    });
}

// --- TIMERS MODULE ---
let timerState = { tab: 'pomodoro', pomodoroInterval: null, swInterval: null, timeLeft: 25*60, isPomRunning: false, swTime: 0, isSwRunning: false };

function renderTimers(container) {
    container.innerHTML=`<div class="flex gap-4 mb-6" id="timer-tabs"><button class="btn-primary" data-tab="pomodoro">Pomodoro</button><button class="btn-secondary" data-tab="stopwatch">Stopwatch</button><button class="btn-secondary" data-tab="worldclock">World Clock</button></div><div id="tab-content"></div>`;
    const tabs=container.querySelectorAll('#timer-tabs button');
    tabs.forEach(b=>b.onclick=(e)=>{ 
        tabs.forEach(t=>t.className='btn-secondary'); 
        e.target.className='btn-primary'; 
        timerState.tab = e.target.dataset.tab;
        renderTimerTab(container, timerState.tab, container.querySelector('#tab-content')); 
    });
    renderTimerTab(container, timerState.tab, container.querySelector('#tab-content'));
}
function renderTimerTab(container, tab, contentDiv) {
    // We don't clear intervals globally so they keep running, but we update display
    if(tab==='pomodoro'){
        contentDiv.innerHTML=`<div class="card flex-col items-center" style="text-align:center;padding:48px 24px;"><h2 class="mb-4" style="font-size:2rem">Pomodoro Timer</h2><div class="flex gap-4 mb-6"><button class="btn-secondary" id="pom-25">25:00</button><button class="btn-secondary" id="pom-15">15:00</button><button class="btn-secondary" id="pom-5">05:00</button></div><div id="pom-display" style="font-size:6rem;font-weight:bold;letter-spacing:-2px;margin-bottom:32px;font-variant-numeric:tabular-nums">${formatTime(timerState.timeLeft)}</div><div class="flex gap-4"><button class="btn-primary" id="pom-start-btn" style="width:150px;font-size:1.25rem">${timerState.isPomRunning?'Pause':'Start'}</button><button class="btn-secondary" id="pom-reset-btn" style="width:150px;font-size:1.25rem">Reset</button></div></div>`;
        const disp=contentDiv.querySelector('#pom-display'), startBtn=contentDiv.querySelector('#pom-start-btn'), upd=()=>{if(disp)disp.textContent=formatTime(timerState.timeLeft);};
        const setTime=(m)=>{timerState.timeLeft=m*60; timerState.isPomRunning=false; clearInterval(timerState.pomodoroInterval); upd(); startBtn.textContent='Start';};
        contentDiv.querySelector('#pom-25').onclick=()=>setTime(25); contentDiv.querySelector('#pom-15').onclick=()=>setTime(15); contentDiv.querySelector('#pom-5').onclick=()=>setTime(5);
        startBtn.onclick=()=>{
            if(timerState.isPomRunning){clearInterval(timerState.pomodoroInterval);timerState.isPomRunning=false;startBtn.textContent='Start';}
            else{
                timerState.isPomRunning=true;startBtn.textContent='Pause';
                timerState.pomodoroInterval=setInterval(()=>{
                    timerState.timeLeft--;
                    upd();
                    if(timerState.timeLeft<=0){clearInterval(timerState.pomodoroInterval);timerState.isPomRunning=false;startBtn.textContent='Start';alert('Time is up!');}
                },1000);
            }
        };
        contentDiv.querySelector('#pom-reset-btn').onclick=()=>setTime(25);
    } else if(tab==='stopwatch') {
        contentDiv.innerHTML=`<div class="card flex-col items-center" style="text-align:center;padding:48px 24px;"><h2 class="mb-4" style="font-size:2rem">Stopwatch</h2><div id="sw-display" style="font-size:6rem;font-weight:bold;letter-spacing:-2px;margin-bottom:32px;font-variant-numeric:tabular-nums">${formatTimeMs(timerState.swTime)}</div><div class="flex gap-4"><button class="btn-primary" id="sw-start" style="width:150px;font-size:1.25rem">${timerState.isSwRunning?'Pause':'Start'}</button><button class="btn-secondary" id="sw-reset" style="width:150px;font-size:1.25rem">Reset</button><button class="btn-secondary" id="sw-lap" style="width:150px;font-size:1.25rem">Lap</button></div><div id="sw-laps" class="mt-6 w-full text-left max-w-md mx-auto" style="margin-top:32px;width:100%;max-width:400px;"></div></div>`;
        const disp=contentDiv.querySelector('#sw-display'), startBtn=contentDiv.querySelector('#sw-start'), lapsC=contentDiv.querySelector('#sw-laps'), upd=()=>{if(disp)disp.textContent=formatTimeMs(timerState.swTime);};
        let lapCnt=1;
        startBtn.onclick=()=>{
            if(timerState.isSwRunning){clearInterval(timerState.swInterval);timerState.isSwRunning=false;startBtn.textContent='Start';}
            else{timerState.isSwRunning=true;startBtn.textContent='Pause';timerState.swInterval=setInterval(()=>{timerState.swTime+=10;upd();},10);}
        };
        contentDiv.querySelector('#sw-reset').onclick=()=>{clearInterval(timerState.swInterval);timerState.isSwRunning=false;timerState.swTime=0;lapCnt=1;upd();startBtn.textContent='Start';lapsC.innerHTML='';};
        contentDiv.querySelector('#sw-lap').onclick=()=>{if(timerState.swTime>0){const l=document.createElement('div');l.className='flex space-between p-2';l.style='border-bottom:1px dashed var(--border-color);padding:8px 0;';l.innerHTML=`<span>Lap ${lapCnt++}</span><span style="font-size:1.1rem">${formatTimeMs(timerState.swTime)}</span>`;lapsC.prepend(l);}}
    } else if(tab==='worldclock') {
        const zones=[{n:"New York",tz:"America/New_York"},{n:"London",tz:"Europe/London"},{n:"Dubai",tz:"Asia/Dubai"},{n:"Tokyo",tz:"Asia/Tokyo"},{n:"Sydney",tz:"Australia/Sydney"}];
        let h='<div class="grid grid-cols-2 gap-4">';
        zones.forEach(z=>h+=`<div class="card flex space-between items-center" style="padding:32px 24px;"><div><h3 style="font-size:1.5rem;">${z.n}</h3><p style="font-size:0.9rem;" class="text-muted">${z.tz}</p></div><div style="font-size:2.5rem;font-weight:bold" class="tz-t" data-tz="${z.tz}">--:--</div></div>`);
        h+='</div>'; contentDiv.innerHTML=h;
        const upd=()=>{contentDiv.querySelectorAll('.tz-t').forEach(el=>el.textContent=new Date().toLocaleTimeString('en-US',{timeZone:el.dataset.tz,hour:'2-digit',minute:'2-digit'}));};
        upd(); 
        const wcInt = setInterval(upd,1000);
        // clean up interval when switching tabs
        const observer = new MutationObserver(() => { if(!document.body.contains(contentDiv)) clearInterval(wcInt); });
        observer.observe(document.body, {childList: true, subtree: true});
    }
}
function formatTime(s){ const m=Math.floor(s/60).toString().padStart(2,'0'), r=(s%60).toString().padStart(2,'0'); return `${m}:${r}`; }
function formatTimeMs(ms){ const m=Math.floor(ms/60000).toString().padStart(2,'0'), s=Math.floor((ms%60000)/1000).toString().padStart(2,'0'), r=Math.floor((ms%1000)/10).toString().padStart(2,'0'); return `${m}:${s}.${r}`; }

// --- PLANNER MODULE ---
function renderPlanner(container) {
    container.innerHTML = `
        <div class="flex space-between items-center mb-6">
            <h2 style="font-size: 2rem;">Day Logs</h2>
            <div id="planner-date" style="font-size: 1.2rem; font-weight: 500; color: var(--accent);"></div>
        </div>

        <div class="card" style="padding: 0; overflow: hidden; border-radius: 6px;">
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-family: -apple-system, system-ui, sans-serif; font-size: 14px;">
                    <thead style="background: var(--bg-panel); border-bottom: 1px solid var(--border-color);">
                        <tr>
                            <th style="padding: 12px 16px; font-weight: 500; color: var(--text-muted); width: 25%; min-width: 150px; border-right: 1px solid var(--border-color);">
                                <div class="flex items-center gap-2"><i data-lucide="type" style="width:14px;height:14px"></i> Subject</div>
                            </th>
                            <th style="padding: 12px 16px; font-weight: 500; color: var(--text-muted); width: 15%; min-width: 120px; border-right: 1px solid var(--border-color);">
                                <div class="flex items-center gap-2"><i data-lucide="check-circle-2" style="width:14px;height:14px"></i> Status</div>
                            </th>
                            <th style="padding: 12px 16px; font-weight: 500; color: var(--text-muted); width: 12%; min-width: 110px; border-right: 1px solid var(--border-color);">
                                <div class="flex items-center gap-2"><i data-lucide="play" style="width:14px;height:14px"></i> Start</div>
                            </th>
                            <th style="padding: 12px 16px; font-weight: 500; color: var(--text-muted); width: 12%; min-width: 110px; border-right: 1px solid var(--border-color);">
                                <div class="flex items-center gap-2"><i data-lucide="square" style="width:14px;height:14px"></i> End</div>
                            </th>
                            <th style="padding: 12px 16px; font-weight: 500; color: var(--text-muted); width: 10%; min-width: 90px; border-right: 1px solid var(--border-color);">
                                <div class="flex items-center gap-2"><i data-lucide="clock" style="width:14px;height:14px"></i> Duration</div>
                            </th>
                            <th style="padding: 12px 16px; font-weight: 500; color: var(--text-muted); width: 12%; min-width: 110px; border-right: 1px solid var(--border-color);">
                                <div class="flex items-center gap-2"><i data-lucide="bar-chart-2" style="width:14px;height:14px"></i> Confidence</div>
                            </th>
                            <th style="padding: 12px 16px; font-weight: 500; color: var(--text-muted); min-width: 150px; border-right: 1px solid var(--border-color);">
                                <div class="flex items-center gap-2"><i data-lucide="align-left" style="width:14px;height:14px"></i> Notes</div>
                            </th>
                            <th style="padding: 12px 16px; width: 40px;"></th>
                        </tr>
                    </thead>
                    <tbody id="planner-tbody">
                        <!-- Rows injected here -->
                    </tbody>
                </table>
            </div>
            
            <div style="padding: 8px 16px; border-top: 1px solid var(--border-color);">
                <button id="add-log-btn" style="display: flex; align-items: center; gap: 8px; color: var(--text-muted); padding: 8px; border-radius: 4px; cursor: pointer; border: none; background: transparent; transition: background 0.2s; width: 100%; text-align: left; font-family: inherit; font-size: 14px;">
                    <i data-lucide="plus" style="width: 16px; height: 16px;"></i> New
                </button>
            </div>
        </div>
    `;

    document.getElementById('planner-date').textContent = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

    document.getElementById('add-log-btn').addEventListener('click', () => {
        const logs = getLogsData();
        const newLog = {
            id: Date.now().toString(),
            subject: '',
            status: 'Not Started',
            start: '',
            end: '',
            durationMinutes: 0,
            confidence: 5,
            notes: '',
            date: new Date().toISOString().split('T')[0]
        };
        logs.push(newLog);
        saveLogsData(logs);
        renderLogsTable();
    });

    // Handle add log btn hover styling
    const addBtn = document.getElementById('add-log-btn');
    if(addBtn) {
        addBtn.addEventListener('mouseenter', () => addBtn.style.background = 'var(--sidebar-hover)');
        addBtn.addEventListener('mouseleave', () => addBtn.style.background = 'transparent');
    }

    renderLogsTable();
}

function getLogsData() {
    try {
        return JSON.parse(localStorage.getItem('lumina_logs') || '[]');
    } catch(e) { return []; }
}

function saveLogsData(data) {
    localStorage.setItem('lumina_logs', JSON.stringify(data));
}

function renderLogsTable() {
    const tbody = document.getElementById('planner-tbody');
    if (!tbody) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const allLogs = getLogsData();
    let logs = allLogs.filter(l => l.date === todayStr);

    tbody.innerHTML = '';

    if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 14px;">No logs today. Click "New" to start.</td></tr>`;
    } else {
        logs.forEach(log => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--border-color)';
            tr.style.transition = 'background 0.1s';
            tr.className = 'planner-row';
            
            // Format status color
            let statusBtnStyle = '';
            if (log.status === 'Not Started') statusBtnStyle = 'background: rgba(156, 163, 175, 0.1); color: var(--text-muted);';
            else if (log.status === 'In Progress') statusBtnStyle = 'background: rgba(59, 130, 246, 0.1); color: #3b82f6;';
            else if (log.status === 'Done') statusBtnStyle = 'background: rgba(16, 185, 129, 0.1); color: #10b981;';
            else statusBtnStyle = 'background: rgba(156, 163, 175, 0.1); color: var(--text-muted);'; // fallback
            
            // Ensure status defaults
            if (!log.status) log.status = 'Not Started';

            // Calculate duration if needed dynamically
            let durationStr = '--';
            if (log.start && log.end) {
                const startD = new Date(`1970-01-01T${log.start}:00`);
                const endD = new Date(`1970-01-01T${log.end}:00`);
                let diff = (endD - startD) / 60000;
                if (diff < 0) diff += 24 * 60;
                
                // update log data so it persists correctly
                log.durationMinutes = diff;
                
                const hours = Math.floor(diff / 60);
                const mins = diff % 60;
                durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
            }

            tr.innerHTML = `
                <td style="padding: 0; border-right: 1px solid var(--border-color);">
                    <input type="text" class="cell-input subject-input" value="${log.subject || ''}" placeholder="Empty" data-id="${log.id}" style="border: none; border-radius: 0; height: 100%; min-height: 44px; background: transparent; padding: 10px 16px; width: 100%; color: var(--text-main); font-weight: 500; font-family: inherit; font-size: 14px; outline: none;">
                </td>
                <td style="padding: 8px 16px; border-right: 1px solid var(--border-color);">
                    <select class="cell-input status-select" data-id="${log.id}" style="border: none; border-radius: 4px; padding: 4px 8px; ${statusBtnStyle} font-size: 13px; cursor: pointer; font-family: inherit; width: 100%; outline: none; appearance: none; font-weight: 500;">
                        <option value="Not Started" ${log.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                        <option value="In Progress" ${log.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Done" ${log.status === 'Done' ? 'selected' : ''}>Done</option>
                    </select>
                </td>
                <td style="padding: 0; border-right: 1px solid var(--border-color); text-align: center;">
                    ${log.start ? 
                        `<input type="time" class="cell-input start-input" value="${log.start}" data-id="${log.id}" style="border: none; border-radius: 0; height: 100%; min-height: 44px; background: transparent; padding: 10px 16px; width: 100%; color: var(--text-sidebar); font-family: inherit; cursor: pointer; font-size: 14px; outline: none;">` :
                        `<button class="start-btn" data-id="${log.id}" style="border: none; border-radius: 4px; background: rgba(59, 130, 246, 0.1); color: #3b82f6; cursor: pointer; padding: 4px 12px; font-family: inherit; font-size: 13px; font-weight: 500; display: inline-block; transition: background 0.2s;">Start</button>`
                    }
                </td>
                <td style="padding: 0; border-right: 1px solid var(--border-color); text-align: center;">
                    ${log.end ? 
                        `<input type="time" class="cell-input end-input" value="${log.end}" data-id="${log.id}" style="border: none; border-radius: 0; height: 100%; min-height: 44px; background: transparent; padding: 10px 16px; width: 100%; color: var(--text-sidebar); font-family: inherit; cursor: pointer; font-size: 14px; outline: none;">` :
                        `<button class="end-btn" data-id="${log.id}" ${!log.start ? 'disabled' : ''} style="border: none; border-radius: 4px; padding: 4px 12px; font-family: inherit; font-size: 13px; font-weight: 500; display: inline-block; transition: background 0.2s; ${!log.start ? 'background: rgba(156, 163, 175, 0.1); color: var(--text-muted); cursor: not-allowed;' : 'background: rgba(16, 185, 129, 0.1); color: #10b981; cursor: pointer;'}">End</button>`
                    }
                </td>
                <td style="padding: 10px 16px; border-right: 1px solid var(--border-color); color: var(--text-muted); font-size: 14px;">
                    ${durationStr}
                </td>
                <td style="padding: 0; border-right: 1px solid var(--border-color);">
                    <input type="number" class="cell-input confidence-input" value="${log.confidence || 5}" min="1" max="10" data-id="${log.id}" style="border: none; border-radius: 0; height: 100%; min-height: 44px; background: transparent; padding: 10px 16px; width: 100%; color: var(--text-sidebar); font-family: inherit; text-align: center; font-size: 14px; outline: none;">
                </td>
                <td style="padding: 0; border-right: 1px solid var(--border-color);">
                    <input type="text" class="cell-input notes-input" value="${log.notes || ''}" placeholder="Add a note..." data-id="${log.id}" style="border: none; border-radius: 0; height: 100%; min-height: 44px; background: transparent; padding: 10px 16px; width: 100%; color: var(--text-sidebar); font-family: inherit; font-size: 14px; outline: none;">
                </td>
                <td style="padding: 10px 8px; text-align: center;">
                    <button class="icon-btn del-log-btn" data-id="${log.id}" style="padding: 4px; margin: auto; transition: background 0.2s; border-radius: 4px;">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px; color: var(--danger);"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Save updated durations to localstorage if they changed during render
        const newAllLogs = allLogs.map(l => {
            const upd = logs.find(u => u.id === l.id);
            return upd ? upd : l;
        });
        saveLogsData(newAllLogs);
    }

    if (window.lucide) window.lucide.createIcons();

    // Attach event listeners for inline editing
    attachInlineEditing();
}

function attachInlineEditing() {
    const updateField = (id, field, value) => {
        let logs = getLogsData();
        let logIndex = logs.findIndex(l => l.id === id);
        if (logIndex !== -1) {
            logs[logIndex][field] = value;
            saveLogsData(logs);
            
            // Re-render if it affects duration or status visually
            if (['start', 'end', 'status'].includes(field)) {
                renderLogsTable();
            }
        }
    };

    const getCurrentTimeStr = () => {
        const now = new Date();
        const StringPadded = (num) => num.toString().padStart(2, '0');
        return `${StringPadded(now.getHours())}:${StringPadded(now.getMinutes())}`;
    };

    document.querySelectorAll('.start-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            updateField(id, 'status', 'In Progress');
            updateField(id, 'start', getCurrentTimeStr());
        });
        btn.addEventListener('mouseenter', (e) => e.target.style.background = 'rgba(59, 130, 246, 0.2)');
        btn.addEventListener('mouseleave', (e) => e.target.style.background = 'rgba(59, 130, 246, 0.1)');
    });

    document.querySelectorAll('.end-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            updateField(id, 'status', 'Done');
            updateField(id, 'end', getCurrentTimeStr());
        });
        if (!btn.disabled) {
            btn.addEventListener('mouseenter', (e) => e.target.style.background = 'rgba(16, 185, 129, 0.2)');
            btn.addEventListener('mouseleave', (e) => e.target.style.background = 'rgba(16, 185, 129, 0.1)');
        }
    });

    document.querySelectorAll('.subject-input').forEach(inp => {
        inp.addEventListener('blur', (e) => updateField(e.target.dataset.id, 'subject', e.target.value));
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });
    });

    document.querySelectorAll('.status-select').forEach(sel => {
        sel.addEventListener('change', (e) => updateField(e.target.dataset.id, 'status', e.target.value));
    });

    document.querySelectorAll('.start-input').forEach(inp => {
        inp.addEventListener('change', (e) => updateField(e.target.dataset.id, 'start', e.target.value));
    });

    document.querySelectorAll('.end-input').forEach(inp => {
        inp.addEventListener('change', (e) => updateField(e.target.dataset.id, 'end', e.target.value));
    });

    document.querySelectorAll('.confidence-input').forEach(inp => {
        inp.addEventListener('blur', (e) => {
            let val = parseInt(e.target.value);
            if(isNaN(val)) val = 5;
            if(val < 1) val = 1;
            if(val > 10) val = 10;
            e.target.value = val;
            updateField(e.target.dataset.id, 'confidence', val);
        });
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });
    });

    document.querySelectorAll('.notes-input').forEach(inp => {
        inp.addEventListener('blur', (e) => updateField(e.target.dataset.id, 'notes', e.target.value));
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });
    });

    document.querySelectorAll('.del-log-btn').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.currentTarget.dataset.id;
            let logs = getLogsData();
            logs = logs.filter(l => l.id !== id);
            saveLogsData(logs);
            renderLogsTable();
        };
    });

    // Hover effect for rows
    document.querySelectorAll('.planner-row').forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.background = 'var(--sidebar-hover)';
        });
        row.addEventListener('mouseleave', () => {
            row.style.background = 'transparent';
        });
    });
}

// --- NOTES MODULE ---
let activeNoteId=null;
function renderNotes(container) {
    container.innerHTML = `<div class="flex space-between items-center mb-6"><h2 style="font-size:2rem">Notes Workspace</h2><button class="btn-primary flex items-center gap-2" id="nt-new">+ New Note</button></div><div class="flex gap-6 h-full" style="height:calc(100vh - 200px)"><div class="card flex-col" style="width:300px;height:100%;overflow-y:auto"><input type="text" id="nt-search" placeholder="Search..." style="margin-bottom:16px"><div id="nt-list" class="flex-col gap-2"></div></div><div class="card flex-col" style="flex:1;height:100%;display:none;" id="nt-ed"><input type="text" id="nt-t" placeholder="Untitled" style="font-size:2rem;font-weight:bold;background:transparent;border:none;border-bottom: 2px solid var(--border-color);margin-bottom:16px;color:var(--text-main)"><textarea id="nt-b" placeholder="Content..." style="flex:1;resize:none;background:transparent;border:none;outline:none;padding:0;box-shadow:none;font-size:1.1rem;line-height:1.6;color:var(--text-main);height:100%"></textarea></div><div id="nt-emp" class="card flex items-center" style="flex:1;height:100%;justify-content:center"><p class="text-muted">Select or create a note.</p></div></div>`;
    setupNotes(container);
}
function setupNotes(container) {
    const list=container.querySelector('#nt-list'), t=container.querySelector('#nt-t'), b=container.querySelector('#nt-b'), ed=container.querySelector('#nt-ed'), emp=container.querySelector('#nt-emp'), s=container.querySelector('#nt-search');
    const tog=(sh)=>{ed.style.display=sh?'flex':'none'; emp.style.display=sh?'none':'flex';};
    const loadN=(fil='')=>{
        let ns=JSON.parse(localStorage.getItem('lumina_notes')||'[]'); if(fil)ns=ns.filter(x=>x.title.toLowerCase().includes(fil)||x.body.toLowerCase().includes(fil)); ns.sort((x,y)=>y.updated-x.updated); list.innerHTML='';
        if(ns.length===0){list.innerHTML=`<p class="text-muted" style="text-align:center;">No notes.</p>`;return;}
        ns.forEach(n=>{
            const el=document.createElement('div'); el.style=`padding:12px 16px;border:1px solid var(--border-color);cursor:pointer;background:${activeNoteId===n.id?'var(--bg-hover)':'transparent'};display:flex;justify-content:space-between;align-items:center`;
            el.innerHTML=`<div style="flex:1;overflow:hidden"><h4 style="font-weight:bold;font-size:1.05rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n.title||'Untitled'}</h4><p style="font-size:0.8rem;margin-top:4px" class="text-muted">${new Date(n.updated).toLocaleDateString([],{month:'short',day:'numeric'})}</p></div><button class="icon-btn deln" data-id="${n.id}" style="padding:4px;z-index:10">×</button>`;
            el.onclick=(e)=>{if(e.target.closest('.deln'))return; activeNoteId=n.id; t.value=n.title; b.value=n.body; tog(true); loadN(s.value);};
            el.querySelector('.deln').onclick=(e)=>{e.stopPropagation();if(confirm('Delete?')){const a=JSON.parse(localStorage.getItem('lumina_notes')).filter(x=>x.id!==n.id);localStorage.setItem('lumina_notes',JSON.stringify(a));if(activeNoteId===n.id){activeNoteId=null;tog(false);}loadN();}};
            list.appendChild(el);
        });
    };
    container.querySelector('#nt-new').onclick=()=>{
        const id=Date.now().toString(), ns=JSON.parse(localStorage.getItem('lumina_notes')||'[]'); ns.push({id,title:'',body:'',updated:Date.now()}); localStorage.setItem('lumina_notes',JSON.stringify(ns)); activeNoteId=id; t.value=''; b.value=''; tog(true); loadN(s.value); t.focus();
    };
    const sv=()=>{if(!activeNoteId)return; const ns=JSON.parse(localStorage.getItem('lumina_notes')||'[]'), i=ns.findIndex(x=>x.id===activeNoteId); if(i>-1){ns[i].title=t.value;ns[i].body=b.value;ns[i].updated=Date.now();localStorage.setItem('lumina_notes',JSON.stringify(ns));loadN();}};
    t.oninput=sv; b.oninput=sv; s.oninput=(e)=>loadN(e.target.value.toLowerCase()); loadN(); if(activeNoteId)tog(true);
}

// --- CODING MODULE ---
function renderCoding(container) {
    container.innerHTML = `<div class="flex space-between items-center mb-6"><h2 style="font-size:2rem">Coding Tracker</h2></div><div class="grid grid-cols-3 gap-6"><div class="card flex-col gap-4"><h3 style="font-size:1.25rem">Platform Links</h3><div class="flex-col gap-4"><div><label style="display:block;margin-bottom:8px;" class="text-muted">LeetCode URL</label><div class="flex gap-2"><input type="text" id="cl-lc"><button class="btn-primary" id="cs-lc">Save</button></div></div><div><label style="display:block;margin-bottom:8px;" class="text-muted">GFG URL</label><div class="flex gap-2"><input type="text" id="cl-gfg"><button class="btn-primary" id="cs-gfg">Save</button></div></div><div><label style="display:block;margin-bottom:8px;" class="text-muted">Codeforces URL</label><div class="flex gap-2"><input type="text" id="cl-cf"><button class="btn-primary" id="cs-cf">Save</button></div></div><div><label style="display:block;margin-bottom:8px;" class="text-muted">AtCoder URL</label><div class="flex gap-2"><input type="text" id="cl-atc"><button class="btn-primary" id="cs-atc">Save</button></div></div></div></div><div class="card flex-col" style="grid-column: span 2;"><div class="flex space-between items-center mb-4"><h3 style="font-size: 1.25rem;">Codolio Dashboard</h3></div><div class="flex gap-2 mb-4"><input type="text" id="cl-cod" placeholder="Widget URL"><button class="btn-primary" id="cs-cod">Embed</button></div><div id="cod-wr" style="flex:1;border:1px solid var(--border-color);display:flex;align-items:center;justify-content:center;overflow:hidden"><p class="text-muted">Enter URL above</p></div></div></div>`;
    const d=JSON.parse(localStorage.getItem('lumina_coding')||'{}');
    const m={'lc':container.querySelector('#cl-lc'),'gfg':container.querySelector('#cl-gfg'),'cf':container.querySelector('#cl-cf'),'atc':container.querySelector('#cl-atc'),'cod':container.querySelector('#cl-cod')};
    Object.keys(m).forEach(k=>{if(d[k]&&m[k])m[k].value=d[k];});
    const sv=(k,v)=>{const cd=JSON.parse(localStorage.getItem('lumina_coding')||'{}'); cd[k]=v; localStorage.setItem('lumina_coding',JSON.stringify(cd));};
    container.querySelector('#cs-lc').onclick=()=>sv('lc',m['lc'].value);
    container.querySelector('#cs-gfg').onclick=()=>sv('gfg',m['gfg'].value);
    container.querySelector('#cs-cf').onclick=()=>sv('cf',m['cf'].value);
    container.querySelector('#cs-atc').onclick=()=>sv('atc',m['atc'].value);
    const lem=()=>{const u=m['cod'].value, w=container.querySelector('#cod-wr'); if(u&&u.startsWith('http')){w.innerHTML=`<iframe src="${u}" width="100%" height="100%" style="border:none"></iframe>`;sv('cod',u);}else w.innerHTML=`<p class="text-muted">Invalid URL</p>`;};
    container.querySelector('#cs-cod').onclick=lem; if(d['cod'])lem();
}

// --- HEALTH MODULE ---
function renderHealth(container) {
    const td=new Date().toISOString().split('T')[0], hdt=JSON.parse(localStorage.getItem('lumina_health')||'{}');
    let tdd=hdt[td]||{water:0,fruits:0,food:'',workout:{type:'',duration:''}}, str=0, d=new Date();
    while(true){const ds=d.toISOString().split('T')[0], h=hdt[ds]; if(h&&(h.water>=8||h.workout.duration>0||h.fruits>0)){str++;d.setDate(d.getDate()-1);}else if(ds===td)d.setDate(d.getDate()-1);else break;}
    
    container.innerHTML = `
        <div class="flex space-between items-center mb-6"><h2 style="font-size:2rem">Healthcare Tracker</h2><div class="flex items-center gap-2" style="border: 1px solid var(--border-color); border-radius: 4px; padding:8px 16px; font-weight:bold; color: var(--accent);">Streak: 🔥 ${str}</div></div>
        <div class="grid grid-cols-2 gap-6">
            <div class="card flex-col gap-6">
                <div><h3 style="font-size:1.25rem;margin-bottom:16px">Water Intake</h3><div class="flex items-center gap-4"><button class="icon-btn" id="hw-m">-</button><span style="font-size:1.5rem;font-weight:bold;width:80px;text-align:center"><span id="hw-c">${tdd.water}</span>/8</span><button class="icon-btn" id="hw-p">+</button></div></div>
                <div><h3 style="font-size:1.25rem;margin-bottom:16px">Fruit Intake</h3><div class="flex items-center gap-4"><button class="icon-btn" id="hf-m">-</button><span style="font-size:1.5rem;font-weight:bold;width:80px;text-align:center" id="hf-c">${tdd.fruits}</span><button class="icon-btn" id="hf-p">+</button></div></div>
                <div><h3 style="font-size:1.25rem;margin-bottom:8px">Food Log</h3><textarea id="h-fd" rows="3">${tdd.food||''}</textarea></div>
            </div>
            <div class="card flex-col gap-4">
                <h3 style="font-size:1.25rem;">Workout</h3>
                <div><label style="display:block;margin-bottom:8px;" class="text-muted">Type</label><select id="hw-ty"><option value="">None</option><option value="Cardio">Cardio</option><option value="Weightlifting">Weights</option><option value="Yoga">Yoga</option><option value="Sports">Sports</option><option value="Other">Other</option></select></div>
                <div><label style="display:block;margin-bottom:8px;" class="text-muted">Duration (min)</label><input type="number" id="hw-dur" value="${tdd.workout.duration||''}"></div>
                <div class="mt-4" style="margin-top:auto"><button class="btn-primary w-full" id="hs-btn">Save Progress</button></div>
            </div>
        </div>
    `;
    container.querySelector('#hw-ty').value=tdd.workout.type||'';
    let t=Object.assign({},tdd);
    const u=()=>{container.querySelector('#hw-c').textContent=t.water; container.querySelector('#hf-c').textContent=t.fruits;};
    container.querySelector('#hw-m').onclick=()=>{if(t.water>0){t.water--;u();}}; container.querySelector('#hw-p').onclick=()=>{t.water++;u();};
    container.querySelector('#hf-m').onclick=()=>{if(t.fruits>0){t.fruits--;u();}}; container.querySelector('#hf-p').onclick=()=>{t.fruits++;u();};
    container.querySelector('#hs-btn').onclick=()=>{
        t.food=container.querySelector('#h-fd').value; t.workout={type:container.querySelector('#hw-ty').value,duration:parseInt(container.querySelector('#hw-dur').value)||0};
        const hd=JSON.parse(localStorage.getItem('lumina_health')||'{}'); hd[td]=t; localStorage.setItem('lumina_health',JSON.stringify(hd));
        const b=container.querySelector('#hs-btn'); b.textContent="Saved!"; setTimeout(()=>{renderHealth(container);},1000);
    };
}

// --- TODOS MODULE ---
function renderTodos(container) {
    container.innerHTML=`<div class="flex space-between items-center mb-6"><h2 style="font-size:2rem">To-Do List</h2><div style="font-size:1.1rem;" class="text-muted" id="td-st">0 / 0 Done</div></div><div class="card flex-col h-full"><div class="flex gap-2 mb-4"><input type="text" id="td-in" placeholder="New task..." style="flex:1"><button class="btn-primary" id="td-add">Add Task</button></div><div id="td-lst" style="flex:1;overflow-y:auto"></div></div>`;
    const rL=()=>{
        const ts=JSON.parse(localStorage.getItem('lumina_todos')||'[]'), dc=ts.filter(x=>x.completed).length, lst=container.querySelector('#td-lst');
        container.querySelector('#td-st').textContent=`${dc} / ${ts.length} Done`; lst.innerHTML='';
        if(ts.length===0){lst.innerHTML=`<p class="text-muted" style="text-align:center;padding:32px 0;">No tasks yet.</p>`;return;}
        ts.forEach(t=>{
            const l=document.createElement('div'); l.className='flex space-between items-center p-3 border-b'; l.style=`padding:12px 16px;border-bottom:1px dashed var(--border-color);opacity:${t.completed?'0.5':'1'}`;
            l.innerHTML=`<label class="flex items-center gap-3" style="cursor:pointer;flex:1"><input type="checkbox" class="tcb" data-id="${t.id}" ${t.completed?'checked':''} style="width:20px;height:20px;"><span style="font-size:1.1rem;text-decoration:${t.completed?'line-through':'none'};color:${t.completed?'var(--text-muted)':'var(--text-main)'}">${t.title}</span></label><button class="icon-btn tdel" data-id="${t.id}">×</button>`;
            lst.appendChild(l);
        });
        lst.querySelectorAll('.tcb').forEach(c=>c.onchange=(e)=>{const t=JSON.parse(localStorage.getItem('lumina_todos')||'[]'); const f=t.find(x=>x.id===e.target.dataset.id); if(f){f.completed=e.target.checked; localStorage.setItem('lumina_todos',JSON.stringify(t)); rL();}});
        lst.querySelectorAll('.tdel').forEach(b=>b.onclick=(e)=>{const t=JSON.parse(localStorage.getItem('lumina_todos')||'[]').filter(x=>x.id!==e.currentTarget.dataset.id); localStorage.setItem('lumina_todos',JSON.stringify(t)); rL();});
    };
    container.querySelector('#td-add').onclick=()=>{const v=container.querySelector('#td-in').value.trim(); if(!v)return; const ts=JSON.parse(localStorage.getItem('lumina_todos')||'[]'); ts.push({id:Date.now().toString(),title:v,completed:false}); localStorage.setItem('lumina_todos',JSON.stringify(ts)); container.querySelector('#td-in').value=''; rL();};
    container.querySelector('#td-in').onkeypress=(e)=>{if(e.key==='Enter')container.querySelector('#td-add').click();}; rL();
}

// --- AI MODULE ---
function renderAI(container) {
    container.innerHTML=`<div class="flex space-between items-center mb-6"><h2 style="font-size: 2rem; display:flex; align-items:center; gap: 12px;">AI Assistant</h2></div><div class="card flex-col" style="height: calc(100vh - 200px);"><div id="chat-hist" style="flex:1;overflow-y:auto;padding-right:16px;display:flex;flex-direction:column;gap:16px;margin-bottom:24px"><div class="flex items-start gap-4"><div style="border:1px solid var(--border-color);border-radius:4px;padding:8px;color:var(--accent);font-weight:bold;font-size:12px;">SYSTEM</div><div style="border:1px solid var(--border-color);border-radius:4px;padding:16px;max-width:80%;background:var(--sidebar-hover)"><p>Hello. I am the Lumina AI module. How can I assist?</p></div></div></div><div class="flex gap-2"><input type="text" id="ai-i" placeholder="Ask anything..." style="flex:1"><button class="btn-primary flex items-center gap-2" id="ai-btn">Send</button></div></div>`;
    const h=container.querySelector('#chat-hist'), i=container.querySelector('#ai-i'), b=container.querySelector('#ai-btn');
    const ap=(txt,u)=>{
        const el=document.createElement('div'); el.className='flex items-start gap-4';
        if(u){el.style.flexDirection='row-reverse';el.innerHTML=`<div style="border:1px dashed var(--border-color);border-radius:4px;padding:8px;color:var(--text-muted);font-weight:bold;font-size:12px">USER</div><div style="border:1px dashed var(--border-color);border-radius:4px;padding:16px;max-width:80%"><p>${txt}</p></div>`;}
        else{el.innerHTML=`<div style="border:1px solid var(--border-color);border-radius:4px;padding:8px;color:var(--accent);font-weight:bold;font-size:12px">SYSTEM</div><div style="border:1px solid var(--border-color);border-radius:4px;padding:16px;max-width:80%;background:var(--sidebar-hover)"><p>${txt}</p></div>`;}
        h.appendChild(el); h.scrollTop=h.scrollHeight;
    };
    const s=()=>{const txt=i.value.trim();if(!txt)return;ap(txt,true);i.value='';setTimeout(()=>{ap("ACKNOWLEDGED. Running prototype response block.. Success.",false);},800);};
    b.onclick=s; i.onkeypress=(e)=>{if(e.key==='Enter')s();};
}

// --- CORE APP TABS / NAVIGATION ---
const routes = [
    { id: 'dashboard', label: 'Dashboard', render: renderDashboard },
    { id: 'calendar', label: 'Calendar', render: renderCalendar },
    { id: 'timers', label: 'Timers', render: renderTimers },
    { id: 'planner', label: 'Day Logs', render: renderPlanner },
    { id: 'notes', label: 'Notes Workspace', render: renderNotes },
    { id: 'coding', label: 'Coding Tracker', render: renderCoding },
    { id: 'health', label: 'Health Tracker', render: renderHealth },
    { id: 'todos', label: 'To-Do List', render: renderTodos },
    { id: 'ai', label: 'Lumina AI', render: renderAI },
];

let activeTabId = 'dashboard';
let tabContainers = {}; 

function initApp() {
    setupThemeToggle();
    updateClock();
    setInterval(updateClock, 60000);
    
    // Create containers for everything immediately
    routes.forEach(route => {
        const container = document.createElement('div');
        container.style.display = 'none';
        container.id = `view-${route.id}`;
        document.getElementById('page-container').appendChild(container);
        tabContainers[route.id] = container;
        route.render(container); // render immediately so data is there
    });

    // Setup sidebar clicks
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(btn => {
        btn.onclick = () => {
            navItems.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            switchTab(btn.dataset.id);
        };
    });

    switchTab('dashboard');
    if (window.lucide) window.lucide.createIcons();
}

function switchTab(id) {
    activeTabId = id;
    Object.keys(tabContainers).forEach(key => {
        tabContainers[key].style.display = 'none';
    });
    if (tabContainers[id]) {
        tabContainers[id].style.display = 'block';
    }
}

// Global open app function for dashboard buttons
window.openApp = function(id) {
    const btn = document.querySelector(`.nav-item[data-id="${id}"]`);
    if (btn) btn.click();
};

function setupThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const root = document.documentElement;
    if (localStorage.getItem('theme') === 'dark') {
        root.setAttribute('data-theme', 'dark');
        btn.innerHTML = '<i data-lucide="sun" style="width: 16px; height: 16px;"></i>';
    }
    
    btn.addEventListener('click', () => {
        if (root.getAttribute('data-theme') === 'dark') {
            root.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            btn.innerHTML = '<i data-lucide="moon" style="width: 16px; height: 16px;"></i>';
        } else {
            root.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            btn.innerHTML = '<i data-lucide="sun" style="width: 16px; height: 16px;"></i>';
        }
        if (window.lucide) window.lucide.createIcons();
    });
}

function updateClock() {
    const display = document.getElementById('current-time-display');
    const now = new Date();
    display.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

document.addEventListener('DOMContentLoaded', initApp);
