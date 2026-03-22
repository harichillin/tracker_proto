export function renderDashboard(container) {
    container.innerHTML = `
        <div class="grid gap-6">
            <!-- Stats Row -->
            <div class="grid grid-cols-4">
                <div class="card stat-card">
                    <div class="stat-icon" style="background: var(--accent-gradient)">
                        <i data-lucide="target"></i>
                    </div>
                    <div class="stat-content">
                        <h3>Study/Work Time</h3>
                        <p id="dash-study-time">0h 0m</p>
                    </div>
                </div>
                <div class="card stat-card">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #10b981, #047857)">
                        <i data-lucide="flame"></i>
                    </div>
                    <div class="stat-content">
                        <h3>Coding Streak</h3>
                        <p id="dash-streak">0 days</p>
                    </div>
                </div>
                <div class="card stat-card">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb)">
                        <i data-lucide="droplet"></i>
                    </div>
                    <div class="stat-content">
                        <h3>Water Intake</h3>
                        <p id="dash-water">0 / 8</p>
                    </div>
                </div>
                <div class="card stat-card">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706)">
                        <i data-lucide="check-circle"></i>
                    </div>
                    <div class="stat-content">
                        <h3>To-Dos Done</h3>
                        <p id="dash-tasks">0 / 0</p>
                    </div>
                </div>
            </div>

            <!-- Main Dashboard Content Row -->
            <div class="grid grid-cols-3">
                <!-- Upcoming Calendar -->
                <div class="card" style="grid-column: span 2;">
                    <div class="flex space-between items-center mb-4">
                        <h2 style="font-size: 1.25rem;">Upcoming Events (Next 7 Days)</h2>
                        <button class="icon-btn" onclick="document.querySelector('[data-id=\\'calendar\\']').click()"><i data-lucide="arrow-right"></i></button>
                    </div>
                    <div id="dash-events-list">
                        <!-- Loaded via JS -->
                    </div>
                </div>

                <!-- Next To-Do -->
                <div class="card">
                    <div class="flex space-between items-center mb-4">
                        <h2 style="font-size: 1.25rem;">Next Action</h2>
                        <button class="icon-btn" onclick="document.querySelector('[data-id=\\'todos\\']').click()"><i data-lucide="plus"></i></button>
                    </div>
                    <div id="dash-next-action">
                        <!-- Loaded via JS -->
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="card">
                <h2 style="font-size: 1.25rem; margin-bottom: 16px;">Quick Actions</h2>
                <div class="flex gap-4">
                    <button class="btn-primary flex items-center gap-2" onclick="document.querySelector('[data-id=\\'timers\\']').click()">
                        <i data-lucide="play"></i> Start Pomodoro
                    </button>
                    <button class="btn-secondary flex items-center gap-2" onclick="document.querySelector('[data-id=\\'planner\\']').click()">
                        <i data-lucide="edit-3"></i> Add Log Entry
                    </button>
                    <button class="btn-secondary flex items-center gap-2" onclick="document.querySelector('[data-id=\\'ai\\']').click()">
                        <i data-lucide="bot"></i> Ask AI
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Attempt to load stats from local storage here
    loadDashboardStats();
}

function loadDashboardStats() {
    // Health data
    const healthDataStr = localStorage.getItem('lumina_health');
    if (healthDataStr) {
        const data = JSON.parse(healthDataStr);
        const todayStr = new Date().toISOString().split('T')[0];
        const todayData = data[todayStr] || {};
        const waterElem = document.getElementById('dash-water');
        if (todayData.water !== undefined && waterElem) {
             waterElem.textContent = `${todayData.water} / 8`;
        }
    }

    // Todos
    const todosStr = localStorage.getItem('lumina_todos');
    const todosList = document.getElementById('dash-next-action');
    const tasksCountElem = document.getElementById('dash-tasks');
    if (todosStr) {
        const todos = JSON.parse(todosStr);
        const pending = todos.filter(t => !t.completed);
        const completed = todos.filter(t => t.completed);
        
        if (tasksCountElem) {
            tasksCountElem.textContent = `${completed.length} / ${todos.length}`;
        }
        
        if (todosList) {
            if (pending.length > 0) {
                todosList.innerHTML = `<div class="card mb-2" style="padding:12px; background:rgba(0,0,0,0.1)">
                    <div class="flex items-center gap-2"><i data-lucide="circle"></i> ${pending[0].title}</div>
                </div>`;
            } else {
                todosList.innerHTML = `<p class="text-muted" style="color: var(--text-muted)">All caught up!</p>`;
            }
        }
    } else if (todosList) {
         todosList.innerHTML = `<p class="text-muted" style="color: var(--text-muted)">All caught up!</p>`;
    }

    // Events
    const eventsList = document.getElementById('dash-events-list');
    const eventsDataStr = localStorage.getItem('lumina_events');
    if (eventsList) {
        if (!eventsDataStr) {
            eventsList.innerHTML = `<p class="text-muted" style="color: var(--text-muted)">No upcoming events.</p>`;
        } else {
            const data = JSON.parse(eventsDataStr);
            const list = [];
            const today = new Date();
            
            // Check next 7 days
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
                    <div class="flex space-between items-center mb-2 p-2 border-b" style="border-bottom: var(--glass-border); padding-bottom: 8px;">
                        <div>
                            <span style="font-weight: 500;">${ev.title}</span>
                            ${ev.isRec ? '<span style="font-size: 0.7rem; background: var(--accent-primary); padding: 2px 6px; border-radius: 4px; margin-left:8px;">Yearly</span>' : ''}
                        </div>
                        <span style="color: var(--accent-primary); font-size: 0.85rem;">${ev.displayDate}</span>
                    </div>
                `).join('');
            } else {
                eventsList.innerHTML = `<p class="text-muted" style="color: var(--text-muted)">No upcoming events.</p>`;
            }
        }
    }
}
