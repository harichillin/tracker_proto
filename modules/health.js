export function renderHealth(container) {
    const todayStr = new Date().toISOString().split('T')[0];
    let healthData = getHealthData();
    let todayData = healthData[todayStr] || { water: 0, fruits: 0, food: '', workout: { type: '', duration: '' } };

    // Calculate streak
    let streak = 0;
    let d = new Date();
    while (true) {
        const dStr = d.toISOString().split('T')[0];
        const h = healthData[dStr];
        if (h && (h.water >= 8 || h.workout.duration > 0 || h.fruits > 0)) {
            streak++;
            d.setDate(d.getDate() - 1);
        } else if (dStr === todayStr) {
            d.setDate(d.getDate() - 1); // skip today if not active yet, keep checking past
        } else {
            break;
        }
    }

    container.innerHTML = `
        <div class="flex space-between items-center mb-6">
            <h2 style="font-size: 2rem;">Healthcare Tracker</h2>
            <div class="flex items-center gap-2" style="background: linear-gradient(135deg, #10b981, #047857); padding: 8px 16px; border-radius: 20px; color: #fff; font-weight: 600;">
                <i data-lucide="flame"></i> ${streak} Day Streak
            </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
            <!-- Hydration & Diet -->
            <div class="card flex-col gap-6">
                <div>
                    <h3 style="font-size: 1.25rem; display:flex; align-items:center; gap:8px; margin-bottom: 16px;">
                        <i data-lucide="droplet" style="color: #3b82f6;"></i> Water Intake
                    </h3>
                    <div class="flex items-center gap-4">
                        <button class="icon-btn" id="water-minus" style="background: rgba(0,0,0,0.1)"><i data-lucide="minus"></i></button>
                        <span style="font-size: 1.5rem; font-weight: 600; width: 60px; text-align: center;"><span id="water-count">${todayData.water}</span>/8</span>
                        <button class="icon-btn" id="water-plus" style="background: rgba(0,0,0,0.1)"><i data-lucide="plus"></i></button>
                    </div>
                </div>

                <div>
                    <h3 style="font-size: 1.25rem; display:flex; align-items:center; gap:8px; margin-bottom: 16px;">
                        <i data-lucide="apple" style="color: #ef4444;"></i> Fruit Intake
                    </h3>
                    <div class="flex items-center gap-4">
                        <button class="icon-btn" id="fruit-minus" style="background: rgba(0,0,0,0.1)"><i data-lucide="minus"></i></button>
                        <span style="font-size: 1.5rem; font-weight: 600; width: 60px; text-align: center;" id="fruit-count">${todayData.fruits}</span>
                        <button class="icon-btn" id="fruit-plus" style="background: rgba(0,0,0,0.1)"><i data-lucide="plus"></i></button>
                    </div>
                </div>

                <div>
                    <h3 style="font-size: 1.25rem; margin-bottom: 8px;">Food Intake Log</h3>
                    <textarea id="food-log" rows="3" placeholder="Breakfast, lunch, dinner, snacks...">${todayData.food || ''}</textarea>
                </div>
            </div>

            <!-- Workout -->
            <div class="card flex-col gap-4">
                <h3 style="font-size: 1.25rem; display:flex; align-items:center; gap:8px;">
                    <i data-lucide="activity" style="color: #f59e0b;"></i> Workout Tracker
                </h3>
                
                <div>
                    <label style="display:block; margin-bottom:8px; color:var(--text-secondary)">Workout Type</label>
                    <select id="workout-type" style="width: 100%;">
                        <option value="">None</option>
                        <option value="Cardio">Cardio / Running</option>
                        <option value="Weightlifting">Weight Training</option>
                        <option value="Yoga">Yoga</option>
                        <option value="Sports">Sports</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                
                <div>
                    <label style="display:block; margin-bottom:8px; color:var(--text-secondary)">Duration (minutes)</label>
                    <input type="number" id="workout-duration" placeholder="e.g. 45" value="${todayData.workout.duration || ''}">
                </div>

                <div class="mt-4" style="margin-top: auto;">
                    <button class="btn-primary w-full" id="save-health-btn">Save Today's Progress</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('workout-type').value = todayData.workout.type || '';

    // Setup events
    let tData = { ...todayData };

    document.getElementById('water-minus').onclick = () => { if(tData.water > 0) tData.water--; updateUI(); };
    document.getElementById('water-plus').onclick = () => { tData.water++; updateUI(); };
    document.getElementById('fruit-minus').onclick = () => { if(tData.fruits > 0) tData.fruits--; updateUI(); };
    document.getElementById('fruit-plus').onclick = () => { tData.fruits++; updateUI(); };

    function updateUI() {
        document.getElementById('water-count').textContent = tData.water;
        document.getElementById('fruit-count').textContent = tData.fruits;
    }

    document.getElementById('save-health-btn').onclick = () => {
        tData.food = document.getElementById('food-log').value;
        tData.workout = {
            type: document.getElementById('workout-type').value,
            duration: parseInt(document.getElementById('workout-duration').value) || 0
        };
        
        healthData[todayStr] = tData;
        localStorage.setItem('lumina_health', JSON.stringify(healthData));
        
        // Brief visual feedback
        const btn = document.getElementById('save-health-btn');
        const oldText = btn.textContent;
        btn.textContent = "Saved!";
        btn.style.background = "var(--success)";
        setTimeout(() => {
            btn.textContent = oldText;
            btn.style.background = "var(--accent-gradient)";
            // Refresh streak UI by re-rendering
            renderHealth(container);
            if(window.lucide) window.lucide.createIcons();
        }, 1000);
    };

    if (window.lucide) window.lucide.createIcons();
}

function getHealthData() {
    try {
        return JSON.parse(localStorage.getItem('lumina_health') || '{}');
    } catch(e) { return {}; }
}
