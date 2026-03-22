// ai.js - Simulated Free AI Chat

export function renderAI(container) {
    container.innerHTML = `
        <div class="flex space-between items-center mb-6">
            <h2 style="font-size: 2rem; display:flex; align-items:center; gap: 12px;">
                <i data-lucide="bot" style="color: var(--accent-primary); width: 32px; height: 32px;"></i> AI Assistant
            </h2>
        </div>

        <div class="card flex-col" style="height: calc(100vh - 200px);">
            <!-- Chat History -->
            <div id="chat-history" style="flex: 1; overflow-y: auto; padding-right: 16px; display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
                <!-- Initial message -->
                <div class="flex items-start gap-4">
                    <div style="min-width: 40px; height: 40px; border-radius: 50%; background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; color: white;">
                        <i data-lucide="bot"></i>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); border: var(--glass-border); padding: 16px; border-radius: 0 16px 16px 16px; color: var(--text-primary); max-width: 80%;">
                        <p>Hello! I am your Lumina Planner simulated AI. I can act as a placeholder for a real integration. How can I help you organize your day?</p>
                    </div>
                </div>
            </div>

            <!-- Chat Input -->
            <div class="flex gap-2">
                <input type="text" id="ai-input" placeholder="Type a message to your simulated AI..." style="flex:1;">
                <button class="btn-primary flex items-center gap-2" id="ai-send-btn">
                    <i data-lucide="send"></i> Send
                </button>
            </div>
        </div>
    `;

    setupAI(container);
    if (window.lucide) window.lucide.createIcons();
}

function setupAI(container) {
    const input = container.querySelector('#ai-input');
    const sendBtn = container.querySelector('#ai-send-btn');
    const hist = container.querySelector('#chat-history');

    const appendMsg = (text, isUser) => {
        const el = document.createElement('div');
        el.className = 'flex items-start gap-4';
        
        if (isUser) {
            el.style.flexDirection = 'row-reverse';
            el.innerHTML = `
                <div style="min-width: 40px; height: 40px; border-radius: 50%; background: var(--bg-panel-hover); border: var(--glass-border); display: flex; align-items: center; justify-content: center; color: var(--text-primary);">
                    <i data-lucide="user"></i>
                </div>
                <div style="background: rgba(255,255,255,0.1); border: var(--glass-border); padding: 16px; border-radius: 16px 0 16px 16px; color: var(--text-primary); max-width: 80%;">
                    <p>${text}</p>
                </div>
            `;
        } else {
            el.innerHTML = `
                <div style="min-width: 40px; height: 40px; border-radius: 50%; background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; color: white;">
                    <i data-lucide="bot"></i>
                </div>
                <div style="background: rgba(0,0,0,0.2); border: var(--glass-border); padding: 16px; border-radius: 0 16px 16px 16px; color: var(--text-primary); max-width: 80%;">
                    <p>${text}</p>
                </div>
            `;
        }

        hist.appendChild(el);
        hist.scrollTop = hist.scrollHeight;
        if (window.lucide) window.lucide.createIcons();
    };

    const handleSend = () => {
        const txt = input.value.trim();
        if (!txt) return;

        appendMsg(txt, true);
        input.value = '';

        // Simulate AI thinking and replying
        setTimeout(() => {
            const replies = [
                "I am a simulated AI. In a production environment, this would hook up to an open source LLM API.",
                "That sounds like a great plan for your day! Don't forget to track your pomodoro sessions.",
                "I noted that! Check out your planner or to-do list to make sure everything is in order.",
                "Simulated Response: You're doing great, keep up your coding streak!"
            ];
            const rep = replies[Math.floor(Math.random() * replies.length)];
            appendMsg(rep, false);
        }, 1000);
    };

    sendBtn.onclick = handleSend;
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
}
