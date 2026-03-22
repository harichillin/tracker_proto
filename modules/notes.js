export function renderNotes(container) {
    container.innerHTML = `
        <div class="flex space-between items-center mb-6">
            <h2 style="font-size: 2rem;">Notes Workspace</h2>
            <button class="btn-primary flex items-center gap-2" id="new-note-btn">
                <i data-lucide="plus"></i> New Note
            </button>
        </div>

        <div class="flex gap-6 h-full" style="height: calc(100vh - 200px);">
            <!-- Sidebar list -->
            <div class="card flex-col" style="width: 300px; height: 100%; overflow-y: auto;">
                <div class="mb-4">
                    <input type="text" id="note-search" placeholder="Search notes..." style="background: rgba(0,0,0,0.1)">
                </div>
                <div id="notes-list" class="flex-col gap-2">
                    <!-- Notes populated here -->
                </div>
            </div>

            <!-- Editor -->
            <div class="card flex-col" style="flex: 1; height: 100%; display: none;" id="note-editor">
                <input type="text" id="note-title" placeholder="Untitled Note" 
                       style="font-size: 2rem; font-weight: 700; background: transparent; border: none; outline: none; padding: 0; box-shadow: none; margin-bottom: 16px; width: 100%; color: var(--text-primary);">
                
                <textarea id="note-body" placeholder="Write your thoughts here..." 
                          style="flex: 1; resize: none; background: transparent; border: none; outline: none; padding: 0; box-shadow: none; font-size: 1.1rem; line-height: 1.6; color: var(--text-secondary); height: 100%;"></textarea>
            </div>
            
            <div id="empty-editor" class="card flex items-center" style="flex:1; height: 100%; justify-content: center;">
                <p class="text-muted" style="color: var(--text-muted);">Select or create a note to start writing.</p>
            </div>
        </div>
    `;

    setupNotes(container);
}

let activeNoteId = null;

function getNotes() {
    try {
        return JSON.parse(localStorage.getItem('lumina_notes') || '[]');
    } catch(e) { return []; }
}

function saveNotes(notes) {
    localStorage.setItem('lumina_notes', JSON.stringify(notes));
}

function setupNotes(container) {
    const newBtn = container.querySelector('#new-note-btn');
    const search = container.querySelector('#note-search');
    const titleIn = container.querySelector('#note-title');
    const bodyIn = container.querySelector('#note-body');
    const editor = container.querySelector('#note-editor');
    const emptyUI = container.querySelector('#empty-editor');

    const toggleEditor = (show) => {
        editor.style.display = show ? 'flex' : 'none';
        emptyUI.style.display = show ? 'none' : 'flex';
    };

    const loadNotesList = (filter = '') => {
        const listEl = container.querySelector('#notes-list');
        let notes = getNotes();
        if (filter) {
            notes = notes.filter(n => n.title.toLowerCase().includes(filter) || n.body.toLowerCase().includes(filter));
        }

        // Sort by updated descending
        notes.sort((a,b) => b.updated - a.updated);

        listEl.innerHTML = '';
        if (notes.length === 0) {
            listEl.innerHTML = `<p class="text-muted" style="text-align: center; padding: 16px; color: var(--text-muted); font-size: 0.9rem;">No notes found.</p>`;
            return;
        }

        notes.forEach(note => {
            const el = document.createElement('div');
            el.className = 'p-3 flex space-between items-center';
            el.style = `
                padding: 12px 16px;
                border: var(--glass-border);
                border-radius: var(--radius-sm);
                cursor: pointer;
                transition: var(--transition);
                background: ${activeNoteId === note.id ? 'var(--bg-panel-hover)' : 'rgba(0,0,0,0.1)'};
            `;
            const dateStr = new Date(note.updated).toLocaleDateString([], { month: 'short', day: 'numeric' });
            
            el.innerHTML = `
                <div style="flex:1; overflow:hidden;">
                    <h4 style="font-weight: 500; font-size: 1.05rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${note.title || 'Untitled'}</h4>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">${dateStr}</p>
                </div>
                <button class="icon-btn del-note-btn" data-id="${note.id}" style="padding: 4px; z-index: 10;">
                    <i data-lucide="trash-2" style="width:16px; height:16px;"></i>
                </button>
            `;

            el.onclick = (e) => {
                if(e.target.closest('.del-note-btn')) return;
                activeNoteId = note.id;
                titleIn.value = note.title;
                bodyIn.value = note.body;
                toggleEditor(true);
                loadNotesList(search.value);
            };
            
            const delBtn = el.querySelector('.del-note-btn');
            delBtn.onclick = (e) => {
                e.stopPropagation();
                if(confirm('Delete this note?')) {
                    const all = getNotes().filter(n => n.id !== note.id);
                    saveNotes(all);
                    if(activeNoteId === note.id) {
                        activeNoteId = null;
                        toggleEditor(false);
                    }
                    loadNotesList();
                }
            };
            
            listEl.appendChild(el);
        });
        
        if (window.lucide) window.lucide.createIcons();
    };

    newBtn.onclick = () => {
        const id = Date.now().toString();
        const newNote = { id, title: '', body: '', updated: Date.now() };
        const notes = getNotes();
        notes.push(newNote);
        saveNotes(notes);
        
        activeNoteId = id;
        titleIn.value = '';
        bodyIn.value = '';
        toggleEditor(true);
        loadNotesList(search.value);
        titleIn.focus();
    };

    const saveCurrent = () => {
        if (!activeNoteId) return;
        const notes = getNotes();
        const idx = notes.findIndex(n => n.id === activeNoteId);
        if (idx !== -1) {
            notes[idx].title = titleIn.value;
            notes[idx].body = bodyIn.value;
            notes[idx].updated = Date.now();
            saveNotes(notes);
            loadNotesList();
        }
    };

    titleIn.addEventListener('input', saveCurrent);
    bodyIn.addEventListener('input', saveCurrent);
    search.addEventListener('input', (e) => loadNotesList(e.target.value.toLowerCase()));

    loadNotesList();
    if(activeNoteId) {
        toggleEditor(true);
    }
}
