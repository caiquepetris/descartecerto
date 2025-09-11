document.addEventListener('DOMContentLoaded', () => {
  if (window.__dcbot_initialized__) return;
  window.__dcbot_initialized__ = true;
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  const state = {
    hasStarted: false,
    isOpening: false,
    isClosing: false,
    isStarting: false,
    convoVersion: 0,
    lastToggleAt: 0
  };

  function ensureUI() {
    let container = document.querySelector('.chatbot-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'chatbot-container';
      document.body.appendChild(container);
    }

    // botão
    let bubbleBtn = container.querySelector('.chatbot-button');
    if (!bubbleBtn) {
      bubbleBtn = document.createElement('button');
      bubbleBtn.className = 'chatbot-button';
      bubbleBtn.setAttribute('aria-label', 'Abrir chat');
      bubbleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>`;
      container.appendChild(bubbleBtn);
    }

    // janela
    let win = container.querySelector('.chatbot-window');
    if (!win) {
      win = document.createElement('div');
      win.className = 'chatbot-window';
      win.setAttribute('role', 'dialog');
      win.setAttribute('aria-label', 'Chat do DCBot');
      win.innerHTML = `
        <div class="chatbot-header">
          <h3>DCbot</h3>
          <button class="chatbot-close-button" aria-label="Fechar chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
            <div class="chatbot-messages" aria-live="polite"></div>
           <div class="chatbot-resizer" aria-hidden="true"></div>
      `;
      container.appendChild(win);
    }

    if (!win.querySelector('.chatbot-header')) {
      const head = document.createElement('div');
      head.className = 'chatbot-header';
      head.innerHTML = `<h3>DCbot</h3><button class="chatbot-close-button" aria-label="Fechar">✕</button>`;
      win.insertBefore(head, win.firstChild);
    }
    if (!win.querySelector('.chatbot-messages')) {
      const msgs = document.createElement('div');
      msgs.className = 'chatbot-messages';
      msgs.setAttribute('aria-live', 'polite');
      win.appendChild(msgs);
    }

    return {
      container,
      bubbleBtn,
      win,
      closeBtn: win.querySelector('.chatbot-close-button'),
      messages: win.querySelector('.chatbot-messages'),
    };
  }

  const ui = ensureUI();
  const GREET_LINES = [
    "Olá! Eu sou o DcBot, seu assistente aqui no <b>Descarte Certo</b>.",
    "Estou aqui para ajudar com <b>dicas</b>, responder dúvidas e mostrar onde e como reciclar corretamente.",
    "Como posso te ajudar hoje?"
  ];

  const OPTIONS = [
    {
      label: "Onde achar um ponto de coleta?",
      answer: "Explore nosso site: com seu CEP nós te direcionamos ao ponto de coleta mais próximo da sua casa!"
    },
    { label: "Quem criou o DcBot?", answer: "Fui desenvolvido como parte de um projeto universitário para apoiar práticas sustentáveis." },
    { label: "Qual é o objetivo do Descarte Certo?", answer: "O Descarte Certo nasceu para transformar nossa relação com o meio ambiente, incentivando hábitos sustentáveis e facilitando o descarte correto." },
    { label: "Como funciona o site?", answer: "É simples: você escolhe o tipo de resíduo e informa seu CEP. O sistema mostra dicas e pontos de coleta próximos para o descarte correto." }
  ];

  function addBotMessage(text) {
    const wrap = document.createElement('div');
    wrap.className = 'chatbot-message bot-message';
    wrap.innerHTML = `<div class="message-bubble">${text}</div>`;
    ui.messages.appendChild(wrap);
    ui.messages.scrollTop = ui.messages.scrollHeight;
  }


  async function renderOptionsAnimated(versionAtCall) {
    // 1) "digitando..."
    const typing = addTyping();
    await wait(800);
    if (versionAtCall !== undefined && versionAtCall !== state.convoVersion) { typing.remove(); return; }
    typing.remove();

    const wrap = document.createElement('div');
    wrap.className = 'chatbot-message bot-message';
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = `
      <div>Escolha uma opção:</div>
      <div class="suggestions" style="margin-top:.5rem; display:flex; gap:.5rem; flex-wrap:wrap;">
        ${OPTIONS.map((o, i) =>
      `<button class="suggestion-btn" data-index="${i}" type="button">${o.label}</button>`
    ).join('')}
      </div>
    `;
    bubble.style.opacity = '0';
    bubble.style.transform = 'translateY(6px) scale(0.98)';
    bubble.style.transition = 'transform 160ms ease, opacity 160ms ease';
    bubble.style.willChange = 'transform, opacity';

    wrap.appendChild(bubble);
    ui.messages.appendChild(wrap);
    ui.messages.scrollTop = ui.messages.scrollHeight;
    requestAnimationFrame(() => {
      if (versionAtCall !== undefined && versionAtCall !== state.convoVersion) return;

      bubble.offsetHeight;
      bubble.style.opacity = '1';
      bubble.style.transform = 'translateY(0) scale(1)';
    });
  }

  function disableOptionButtons() {
    ui.messages.querySelectorAll('.suggestion-btn').forEach(b => {
      b.disabled = true;
      b.style.opacity = '0.6';
      b.style.cursor = 'default';
    });
  }

  function addTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-message bot-message typing';
    typingDiv.innerHTML = `
      <div class="message-bubble">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>`;
    ui.messages.appendChild(typingDiv);
    ui.messages.scrollTop = ui.messages.scrollHeight;
    return typingDiv;
  }

  async function replyWithTyping(text, typingMs = 1000, afterMs = 300, versionAtCall) {
    if (versionAtCall !== state.convoVersion) return; // abortado
    const typing = addTyping();
    await wait(typingMs);
    if (versionAtCall !== state.convoVersion) { typing.remove(); return; }
    typing.remove();
    addBotMessage(text);
    await wait(afterMs);
    if (versionAtCall !== state.convoVersion) return;
    ui.messages.scrollTop = ui.messages.scrollHeight;
  }

  async function startConversation() {
    const myVersion = state.convoVersion;
    if (state.isStarting) return; // já iniciando
    state.isStarting = true;

    try {
      ui.messages.innerHTML = '';

      for (const line of GREET_LINES) {
        if (myVersion !== state.convoVersion) return; // abort
        const typing = addTyping();
        await wait(800);
        if (myVersion !== state.convoVersion) { typing.remove(); return; }
        typing.remove();

        addBotMessage(line);
        await wait(600);
        if (myVersion !== state.convoVersion) return; // abort
      }

      if (myVersion !== state.convoVersion) return; // abort
      // >>> ALTERAÇÃO AQUI: opções com animação
      await renderOptionsAnimated(myVersion);

      state.hasStarted = true;
    } finally {
      state.isStarting = false;
    }
  }

  function resetConversation() {
    state.hasStarted = false;
    state.convoVersion += 1;   // invalida qualquer await pendente
    ui.messages.innerHTML = '';
  }

  function openChat() {
    if (state.isOpening || state.isClosing) return;
    state.isOpening = true;
    ui.win.classList.add('open');
    // inicia do zero sempre que abrir
    startConversation().finally(() => { state.isOpening = false; });
  }

  function closeChat() {
    if (state.isOpening || state.isClosing) return;
    state.isClosing = true;
    ui.win.classList.remove('open');
    resetConversation();

    setTimeout(() => { state.isClosing = false; }, 10);
  }


  function canToggle() {
    const now = Date.now();
    if (now - state.lastToggleAt < 200) return false;
    return true;
  }

  const externalBtn = document.querySelector('.descartar-chatbot-button');
  if (externalBtn) {
    externalBtn.addEventListener('click', () => {
      if (!canToggle()) return;
      if (ui.win.classList.contains('open')) closeChat();
      else openChat();
    });
  }

  if (ui.bubbleBtn) {
    ui.bubbleBtn.addEventListener('click', () => {
      if (!canToggle()) return;
      if (ui.win.classList.contains('open')) closeChat();
      else openChat();
    });
  }

  if (ui.closeBtn) ui.closeBtn.addEventListener('click', closeChat);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeChat(); });

  ui.messages.addEventListener('click', async (e) => {
    const btn = e.target.closest('.suggestion-btn');
    if (!btn) return;
    const idx = parseInt(btn.dataset.index, 10);
    const opt = OPTIONS[idx];
    if (!opt) return;

    disableOptionButtons();

    const userWrap = document.createElement('div');
    userWrap.className = 'chatbot-message user-message';
    userWrap.innerHTML = `<div class="message-bubble">${opt.label}</div>`;
    ui.messages.appendChild(userWrap);
    ui.messages.scrollTop = ui.messages.scrollHeight;
    const v = state.convoVersion;
    await replyWithTyping(opt.answer, 800, 250, v);
  });
});
