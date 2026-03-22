export function renderPlanner(container) {
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
    addBtn.addEventListener('mouseenter', () => addBtn.style.background = 'var(--sidebar-hover)');
    addBtn.addEventListener('mouseleave', () => addBtn.style.background = 'transparent');

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

            tr.innerHTML = \`
                <td style="padding: 0; border-right: 1px solid var(--border-color);">
                    <input type="text" class="cell-input subject-input" value="\${log.subject || ''}" placeholder="Empty" data-id="\${log.id}" style="border: none; border-radius: 0; height: 100%; min-height: 44px; background: transparent; padding: 10px 16px; width: 100%; color: var(--text-main); font-weight: 500; font-family: inherit; font-size: 14px; outline: none;">
                </td>
                <td style="padding: 8px 16px; border-right: 1px solid var(--border-color);">
                    <select class="cell-input status-select" data-id="\${log.id}" style="border: none; border-radius: 4px; padding: 4px 8px; \${statusBtnStyle} font-size: 13px; cursor: pointer; font-family: inherit; width: 100%; outline: none; appearance: none; font-weight: 500;">
                        <option value="Not Started" \${log.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                        <option value="In Progress" \${log.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Done" \${log.status === 'Done' ? 'selected' : ''}>Done</option>
                    </select>
                </td>
                <td style="padding: 0; border-right: 1px solid var(--border-color); text-align: center;">
                    \${log.start ? 
                        \`<input type="time" class="cell-input start-input" value="\${log.start}" data-id="\${log.id}" style="border: none; border-radius: 0; height: 100%; min-height: 44px; background: transparent; padding: 10px 16px; width: 100%; color: var(--text-sidebar); font-family: inherit; cursor: pointer; font-size: 14px; outline: none;">\` :
                        \`<button class="start-btn" data-id="\${log.id}" style="border: none; border-radius: 4px; background: rgba(59, 130, 246, 0.1); color: #3b82f6; cursor: pointer; padding: 4px 12px; font-family: inherit; font-size: 13px; font-weight: 500; display: inline-block; transition: background 0.2s;">Start</button>\`
                    }
                </td>
                <td style="padding: 0; border-right: 1px solid var(--border-color); text-align: center;">
                    \${log.end ? 
                        \`<input type="time" class="cell-input end-input" value="\${log.end}" data-id="\${log.id}" style="border: none; border-radius: 0; height: 100%; min-height: 44px; background: transparent; padding: 10px 16px; width: 100%; color: var(--text-sidebar); font-family: inherit; cursor: pointer; font-size: 14px; outline: none;">\` :
                        \`<button class="end-btn" data-id="\${log.id}" \${!log.start ? 'disabled' : ''} style="border: none; border-radius: 4px; padding: 4px 12px; font-family: inherit; font-size: 13px; font-weight: 500; display: inline-block; transition: background 0.2s; \${!log.start ? 'background: rgba(156, 163, 175, 0.1); color: var(--text-muted); cursor: not-allowed;' : 'background: rgba(16, 185, 129, 0.1); color: #10b981; cursor: pointer;'}">End</button>\`
                    }
                </td>
                <td style="padding: 10px 16px; border-right: 1px solid var(--border-color); color: var(--text-muted); font-size: 14px;">
                    \${durationStr}
                </td>
                <td style="padding: 0; border-right: 1px solid var(--border-color);">
                    <input type="number" class="cell-input confidence-input" value="\${log.confidence || 5}" min="1" max="10" data-id="\${log.id}" style="border: none; border-radius: 0; height: 100%; min-height: 44px; background: transparent; padding: 10px 16px; width: 100%; color: var(--text-sidebar); font-family: inherit; text-align: center; font-size: 14px; outline: none;">
                </td>
                <td style="padding: 0; border-right: 1px solid var(--border-color);">
                    <input type="text" class="cell-input notes-input" value="\${log.notes || ''}" placeholder="Add a note..." data-id="\${log.id}" style="border: none; border-radius: 0; height: 100%; min-height: 44px; background: transparent; padding: 10px 16px; width: 100%; color: var(--text-sidebar); font-family: inherit; font-size: 14px; outline: none;">
                </td>
                <td style="padding: 10px 8px; text-align: center;">
                    <button class="icon-btn del-log-btn" data-id="\${log.id}" style="padding: 4px; margin: auto; transition: background 0.2s; border-radius: 4px;">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px; color: var(--danger);"></i>
                    </button>
                </td>
            \`;
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
        return \`\${StringPadded(now.getHours())}:\${StringPadded(now.getMinutes())}\`;
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
