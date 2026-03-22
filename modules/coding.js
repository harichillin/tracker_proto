export function renderCoding(container) {
    container.innerHTML = `
        <div class="flex space-between items-center mb-6">
            <h2 style="font-size: 2rem;">Coding Tracker</h2>
        </div>

        <div class="grid grid-cols-3 gap-6">
            <div class="card flex-col gap-4">
                <h3 style="font-size: 1.25rem;">Platform Links</h3>
                <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 8px;">Save your profile links here for quick access.</p>
                
                <div class="flex-col gap-4">
                    <div>
                        <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px; color:var(--text-secondary)">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" style="width:20px; filter: brightness(0) invert(1);"> LeetCode URL
                        </label>
                        <div class="flex gap-2">
                            <input type="text" id="link-leetcode" placeholder="https://leetcode.com/username">
                            <button class="btn-primary" id="save-leetcode">Save</button>
                        </div>
                    </div>

                    <div>
                        <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px; color:var(--text-secondary)">
                            <i data-lucide="code" style="width:16px;"></i> GFG URL
                        </label>
                        <div class="flex gap-2">
                            <input type="text" id="link-gfg" placeholder="https://auth.geeksforgeeks.org/user/username">
                            <button class="btn-primary" id="save-gfg">Save</button>
                        </div>
                    </div>
                    
                    <div>
                        <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px; color:var(--text-secondary)">
                            <i data-lucide="terminal-square" style="width:16px;"></i> Codeforces URL
                        </label>
                        <div class="flex gap-2">
                            <input type="text" id="link-cf" placeholder="https://codeforces.com/profile/username">
                            <button class="btn-primary" id="save-cf">Save</button>
                        </div>
                    </div>
                    
                    <div>
                        <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px; color:var(--text-secondary)">
                            <i data-lucide="terminal" style="width:16px;"></i> AtCoder URL
                        </label>
                        <div class="flex gap-2">
                            <input type="text" id="link-atcoder" placeholder="https://atcoder.jp/users/username">
                            <button class="btn-primary" id="save-atcoder">Save</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Codolio Embed Area -->
            <div class="card" style="grid-column: span 2; display: flex; flex-direction: column;">
                <div class="flex space-between items-center mb-4">
                    <h3 style="font-size: 1.25rem; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="bar-chart-2"></i> Codolio Integration
                    </h3>
                </div>
                
                <div class="flex gap-2 mb-4">
                    <input type="text" id="link-codolio" placeholder="Enter Codolio Widget / Profile URL to embed">
                    <button class="btn-primary" id="embed-codolio-btn">Embed</button>
                </div>
                
                <div id="codolio-frame-wrapper" style="flex:1; border: var(--glass-border); border-radius: var(--radius-sm); bg: rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    <p class="text-muted" style="color: var(--text-muted);">Enter your Codolio URL above</p>
                </div>
            </div>
        </div>
    `;

    setupCoding(container);
}

function getCodingLinks() {
    try {
        return JSON.parse(localStorage.getItem('lumina_coding') || '{}');
    } catch(e) { return {}; }
}

function saveCodingLink(platform, url) {
    const data = getCodingLinks();
    data[platform] = url;
    localStorage.setItem('lumina_coding', JSON.stringify(data));
}

function setupCoding(container) {
    const data = getCodingLinks();
    
    // Set values
    const map = {
        'leetcode': document.getElementById('link-leetcode'),
        'gfg': document.getElementById('link-gfg'),
        'cf': document.getElementById('link-cf'),
        'atcoder': document.getElementById('link-atcoder'),
        'codolio': document.getElementById('link-codolio')
    };

    Object.keys(map).forEach(key => {
        if(data[key] && map[key]) map[key].value = data[key];
    });

    // Save buttons
    container.querySelector('#save-leetcode').onclick = () => saveCodingLink('leetcode', map['leetcode'].value);
    container.querySelector('#save-gfg').onclick = () => saveCodingLink('gfg', map['gfg'].value);
    container.querySelector('#save-cf').onclick = () => saveCodingLink('cf', map['cf'].value);
    container.querySelector('#save-atcoder').onclick = () => saveCodingLink('atcoder', map['atcoder'].value);
    
    // Codolio embed
    const loadEmbed = () => {
        const url = map['codolio'].value;
        const wrapper = container.querySelector('#codolio-frame-wrapper');
        
        if (url && url.startsWith('http')) {
            wrapper.innerHTML = `<iframe src="${url}" width="100%" height="100%" style="border:none;" title="Codolio Dashboard"></iframe>`;
            saveCodingLink('codolio', url);
        } else {
            wrapper.innerHTML = `<p class="text-muted" style="color: var(--text-muted);">Please enter a valid HTTP/HTTPS URL.</p>`;
        }
    };
    
    container.querySelector('#embed-codolio-btn').onclick = loadEmbed;
    
    // auto load if exists
    if(data['codolio']) {
        loadEmbed();
    }
}
