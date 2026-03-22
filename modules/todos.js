export function renderTodos(container) {
    container.innerHTML = `
        <div class="flex space-between items-center mb-6">
            <h2 style="font-size: 2rem;">To-Do List</h2>
            <div style="font-size: 1.1rem; color: var(--text-secondary);" id="todo-stats">0 / 0 Done</div>
        </div>

        <div class="card flex-col h-full" style="max-height: 600px;">
            <div class="flex gap-2 mb-4">
                <input type="text" id="new-todo-input" placeholder="What needs to be done?" style="flex:1;">
                <button class="btn-primary" id="add-todo-btn">Add Task</button>
            </div>
            
            <div id="todos-list" style="flex:1; overflow-y: auto;">
                <!-- Todos here -->
            </div>
        </div>
    `;

    setupTodos(container);
}

function getTodos() {
    try {
        return JSON.parse(localStorage.getItem('lumina_todos') || '[]');
    } catch(e) { return []; }
}

function saveTodos(todos) {
    localStorage.setItem('lumina_todos', JSON.stringify(todos));
}

function setupTodos(container) {
    const input = container.querySelector('#new-todo-input');
    const addBtn = container.querySelector('#add-todo-btn');
    const list = container.querySelector('#todos-list');
    const stats = container.querySelector('#todo-stats');

    const renderList = () => {
        const todos = getTodos();
        const doneCount = todos.filter(t => t.completed).length;
        stats.textContent = `${doneCount} / ${todos.length} Done`;

        list.innerHTML = '';
        if (todos.length === 0) {
            list.innerHTML = `<p class="text-muted" style="text-align: center; padding: 32px 0;">No tasks yet.</p>`;
            return;
        }

        todos.forEach((todo, idx) => {
            const el = document.createElement('div');
            el.className = 'flex space-between items-center p-3 border-b';
            el.style = `
                padding: 12px 16px; 
                border-bottom: var(--glass-border); 
                transition: var(--transition);
                background: ${todo.completed ? 'rgba(16, 185, 129, 0.1)' : 'transparent'};
                opacity: ${todo.completed ? '0.7' : '1'};
            `;
            
            el.innerHTML = `
                <label class="flex items-center gap-3" style="cursor: pointer; flex: 1;">
                    <input type="checkbox" class="todo-cb" data-id="${todo.id}" ${todo.completed ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--accent-primary);">
                    <span style="font-size: 1.1rem; text-decoration: ${todo.completed ? 'line-through' : 'none'}; color: ${todo.completed ? 'var(--text-muted)' : 'var(--text-primary)'}">${todo.title}</span>
                </label>
                <button class="icon-btn del-todo" data-id="${todo.id}"><i data-lucide="x" style="width: 18px; height: 18px;"></i></button>
            `;
            list.appendChild(el);
        });

        // Events
        list.querySelectorAll('.todo-cb').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                const tr = getTodos();
                const t = tr.find(x => x.id === id);
                if (t) {
                    t.completed = e.target.checked;
                    saveTodos(tr);
                    renderList(); // Re-render to update styles
                }
            });
        });

        list.querySelectorAll('.del-todo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const tr = getTodos().filter(x => x.id !== id);
                saveTodos(tr);
                renderList();
            });
        });

        if (window.lucide) window.lucide.createIcons();
    };

    addBtn.onclick = () => {
        const val = input.value.trim();
        if (!val) return;
        const pt = getTodos();
        pt.push({ id: Date.now().toString(), title: val, completed: false });
        saveTodos(pt);
        input.value = '';
        renderList();
    };
    
    input.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') addBtn.click();
    });

    renderList();
}
