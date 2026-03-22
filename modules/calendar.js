let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDateStr = new Date().toISOString().split('T')[0];

export function renderCalendar(container) {
    container.innerHTML = `
        <div class="card mb-6 flex space-between items-center">
            <h2 style="font-size: 1.5rem;" id="cal-header-title">Calendar</h2>
            <div class="flex gap-2">
                <button class="icon-btn" id="cal-prev"><i data-lucide="chevron-left"></i></button>
                <button class="btn-secondary" id="cal-today">Today</button>
                <button class="icon-btn" id="cal-next"><i data-lucide="chevron-right"></i></button>
            </div>
        </div>
        
        <div class="grid grid-cols-2">
            <!-- Calendar Grid -->
            <div class="card">
                <div class="cal-days-header flex space-between mb-4" style="text-align: center; color: var(--text-secondary); font-weight: 500; font-size: 0.85rem;">
                    <div style="width: 14%;">Sun</div><div style="width: 14%;">Mon</div>
                    <div style="width: 14%;">Tue</div><div style="width: 14%;">Wed</div>
                    <div style="width: 14%;">Thu</div><div style="width: 14%;">Fri</div>
                    <div style="width: 14%;">Sat</div>
                </div>
                <div id="cal-grid" style="display: flex; flex-wrap: wrap; gap: 4px;">
                    <!-- Days generated via JS -->
                </div>
            </div>
            
            <!-- Events section -->
            <div class="card flex-col" style="max-height: 500px">
                <div class="flex space-between items-center mb-4">
                    <h3 id="selected-date-display" style="font-size: 1.25rem;">Selected Date</h3>
                    <button class="btn-primary flex items-center gap-2" id="add-event-btn">
                        <i data-lucide="plus" style="width: 16px; height: 16px;"></i> Event
                    </button>
                </div>
                
                <div id="day-events-list" style="flex: 1; overflow-y: auto;">
                    <p class="text-muted" style="color: var(--text-muted);">Select a date or add an event.</p>
                </div>
                
                <!-- Add Event Form (Hidden by default) -->
                <div id="add-event-form" class="mt-4" style="display: none; border-top: var(--glass-border); padding-top: 16px;">
                    <input type="text" id="event-title" placeholder="Event Title (e.g., John's Birthday)" class="mb-4">
                    <label class="flex items-center gap-2 mb-4" style="cursor: pointer;">
                        <input type="checkbox" id="event-recurring" style="width: auto;">
                        <span style="color: var(--text-secondary)">Occurs every year (like Birthdays)</span>
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
    generateCalendar();
}

function setupCalendar(container) {
    container.querySelector('#cal-prev').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        generateCalendar();
    });
    
    container.querySelector('#cal-next').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        generateCalendar();
    });
    
    container.querySelector('#cal-today').addEventListener('click', () => {
        const d = new Date();
        currentMonth = d.getMonth();
        currentYear = d.getFullYear();
        selectedDateStr = d.toISOString().split('T')[0];
        generateCalendar();
    });
    
    container.querySelector('#add-event-btn').addEventListener('click', () => {
        document.getElementById('add-event-form').style.display = 'block';
        document.getElementById('event-title').focus();
    });
    
    container.querySelector('#cancel-event-btn').addEventListener('click', () => {
        document.getElementById('add-event-form').style.display = 'none';
        document.getElementById('event-title').value = '';
        document.getElementById('event-recurring').checked = false;
    });
    
    container.querySelector('#save-event-btn').addEventListener('click', () => {
        const title = document.getElementById('event-title').value.trim();
        const recurring = document.getElementById('event-recurring').checked;
        if (!title) return;
        
        let eventsData = getEventsData();
        
        // Use MM-DD format as key if recurring, else YYYY-MM-DD
        let key = recurring ? selectedDateStr.substring(5) : selectedDateStr;
        
        if (!eventsData[key]) eventsData[key] = [];
        eventsData[key].push({ id: Date.now().toString(), title, recurring });
        
        localStorage.setItem('lumina_events', JSON.stringify(eventsData));
        
        document.getElementById('add-event-form').style.display = 'none';
        document.getElementById('event-title').value = '';
        generateCalendar(); 
    });
}

function getEventsData() {
    try {
        return JSON.parse(localStorage.getItem('lumina_events') || '{}');
    } catch(e) { return {}; }
}

function generateCalendar() {
    const headerTitle = document.getElementById('cal-header-title');
    const calGrid = document.getElementById('cal-grid');
    if (!calGrid) return;
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    headerTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    calGrid.innerHTML = '';
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const eventsData = getEventsData();
    
    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('div');
        cell.style.width = 'calc(14.28% - 4px)';
        calGrid.appendChild(cell);
    }
    
    const todayStrFull = new Date().toISOString().split('T')[0];
    
    for (let i = 1; i <= daysInMonth; i++) {
        // Handle timezone offsetting carefully by formatting manually
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const mdStr = dateStr.substring(5); // MM-DD
        
        const isToday = dateStr === todayStrFull;
        const isSelected = dateStr === selectedDateStr;
        
        const cell = document.createElement('div');
        cell.className = 'cal-day';
        cell.style = \`
            width: calc(14.28% - 4px); 
            aspect-ratio: 1; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
            background: \${isSelected ? 'var(--accent-gradient)' : 'transparent'};
            color: \${isSelected ? '#fff' : 'inherit'};
            font-weight: \${isToday ? '700' : '500'};
            border: \${isToday && !isSelected ? '2px solid var(--accent-primary)' : 'none'};
        \`;
        
        if (!isSelected) {
            cell.onmouseover = () => cell.style.background = 'rgba(255,255,255,0.1)';
            cell.onmouseout = () => cell.style.background = 'transparent';
        }
        
        cell.textContent = i;
        
        // Check for events
        const dayEvents = (eventsData[dateStr] || []).concat(eventsData[mdStr] || []);
        if (dayEvents.length > 0) {
            const dot = document.createElement('div');
            dot.style = \`
                position: absolute;
                bottom: 4px;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: \${isSelected ? '#fff' : 'var(--accent-primary)'};
            \`;
            cell.appendChild(dot);
        }
        
        cell.addEventListener('click', () => {
            selectedDateStr = dateStr;
            generateCalendar();
        });
        
        calGrid.appendChild(cell);
    }
    
    displayEventsForDate(selectedDateStr);
}

function displayEventsForDate(dateStr) {
    const list = document.getElementById('day-events-list');
    const displayTitle = document.getElementById('selected-date-display');
    if(!list || !displayTitle) return;
    
    const [y, m, d] = dateStr.split('-');
    const dt = new Date(y, m-1, d);
    displayTitle.textContent = dt.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    
    const eventsData = getEventsData();
    const mdStr = dateStr.substring(5);
    
    const dayEvents = (eventsData[dateStr] || []).concat(eventsData[mdStr] || []);
    
    if (dayEvents.length === 0) {
        list.innerHTML = \`<p class="text-muted" style="color: var(--text-muted); text-align: center; padding: 24px 0;">No events planned.</p>\`;
        return;
    }
    
    list.innerHTML = '';
    dayEvents.forEach(ev => {
        const el = document.createElement('div');
        el.className = 'card mb-4 inner-event-card';
        el.style.padding = '12px 16px';
        el.style.background = 'rgba(0,0,0,0.1)';
        el.style.display = 'flex';
        el.style.justifyContent = 'space-between';
        el.style.alignItems = 'center';
        
        let badge = ev.recurring ? \`<span style="font-size: 0.75rem; background: var(--accent-primary); padding: 2px 6px; border-radius: 4px; margin-left:8px;">Every Year</span>\` : '';
        
        el.innerHTML = \`
            <div class="flex items-center gap-2">
                <div style="width:12px; height:12px; border-radius:50%; background:var(--accent-gradient)"></div>
                <span style="font-weight: 500;">\${ev.title}</span> \${badge}
            </div>
            <button class="icon-btn del-btn" data-id="\${ev.id}" data-rec="\${ev.recurring}"><i data-lucide="trash-2" style="width:16px; height:16px;"></i></button>
        \`;
        list.appendChild(el);
    });
    
    // Add delete listeners
    list.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const isRec = e.currentTarget.dataset.rec === 'true';
            
            let data = getEventsData();
            let key = isRec ? mdStr : dateStr;
            
            if(data[key]) {
                data[key] = data[key].filter(evItem => evItem.id !== id);
                if(data[key].length === 0) delete data[key];
                localStorage.setItem('lumina_events', JSON.stringify(data));
                generateCalendar();
            }
        });
    });
    
    if (window.lucide) window.lucide.createIcons();
}
