
(function () {
  if (window.__dcbot_initialized__) return;
  window.__dcbot_initialized__ = true;

  
  // "Domain" (regras & estado)
 

  var Script = {
    GREET_LINES: [
      "Olá! Eu sou o DcBot, seu assistente aqui no <b>Descarte Certo</b>.",
      "Estou aqui para ajudar com <b>dicas</b>, responder dúvidas e mostrar onde e como reciclar corretamente.",
      "Como posso te ajudar hoje?"
    ],
    OPTIONS: [
      { label: "Onde achar um ponto de coleta?", answer: "Explore nosso site: com seu CEP nós te direcionamos ao ponto de coleta mais próximo da sua casa!" },
      { label: "Quem criou o DcBot?", answer: "Fui desenvolvido como parte de um projeto universitário para apoiar práticas sustentáveis." },
      { label: "Qual é o objetivo do Descarte Certo?", answer: "O Descarte Certo nasceu para transformar nossa relação com o meio ambiente, incentivando hábitos sustentáveis e facilitando o descarte correto." },
      { label: "Como funciona o site?", answer: "É simples: você escolhe o tipo de resíduo e informa seu CEP. O sistema mostra dicas e pontos de coleta próximos para o descarte correto." }
    ],

    THANKS_HTML: "Obrigado por conversar com o DcBot!  Sempre que quiser, é só abrir o chat de novo."
  };

  function initialState() {
    return {
      visibility: 'closed',
      hasStarted: false,
      isOpening: false,
      isClosing: false,
      isStarting: false,
      isAnimating: false,
      version: 0,
      lastToggleAt: 0
    };
  }

  function canToggle(now, lastToggleAt) {
    return (now - lastToggleAt) >= 200;
  }


  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }


  // "Infrastructure" (DOM adapter)


  function ensureUI() {
    var container = document.querySelector('.chatbot-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'chatbot-container';
      document.body.appendChild(container);
    }

    var bubbleBtn = container.querySelector('.chatbot-button');
    if (!bubbleBtn) {
      bubbleBtn = document.createElement('button');
      bubbleBtn.className = 'chatbot-button';
      bubbleBtn.setAttribute('aria-label', 'Abrir chat');
      bubbleBtn.innerHTML = '' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"' +
        ' viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
        ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        ' <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
        '</svg>';
      container.appendChild(bubbleBtn);
    }

    var win = container.querySelector('.chatbot-window');
    if (!win) {
      win = document.createElement('div');
      win.className = 'chatbot-window';
      win.setAttribute('role', 'dialog');
      win.setAttribute('aria-label', 'Chat do DCBot');
      win.innerHTML = '' +
        '<div class="chatbot-header">' +
        '  <h3>DCbot</h3>' +
        '  <button class="chatbot-close-button" aria-label="Fechar chat">' +
        '    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"' +
        '      viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
        '      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '      <line x1="18" y1="6" x2="6" y2="18"></line>' +
        '      <line x1="6" y1="6" x2="18" y2="18"></line>' +
        '    </svg>' +
        '  </button>' +
        '</div>' +
        '<div class="chatbot-messages" aria-live="polite"></div>' +
        '<div class="chatbot-resizer" aria-hidden="true"></div>';
      container.appendChild(win);
    }


    if (!win.querySelector('.chatbot-header')) {
      var head = document.createElement('div');
      head.className = 'chatbot-header';
      head.innerHTML = '<h3>DCbot</h3><button class="chatbot-close-button" aria-label="Fechar">✕</button>';
      win.insertBefore(head, win.firstChild);
    }
    if (!win.querySelector('.chatbot-messages')) {
      var msgs = document.createElement('div');
      msgs.className = 'chatbot-messages';
      msgs.setAttribute('aria-live', 'polite');
      win.appendChild(msgs);
    }

    return {
      container: container,
      bubbleBtn: bubbleBtn,
      win: win,
      closeBtn: win.querySelector('.chatbot-close-button'),
      messages: win.querySelector('.chatbot-messages')
    };
  }


  var UI = (function () {
    var ui = ensureUI();

    function scrollToBottom() {
      ui.messages.scrollTop = ui.messages.scrollHeight;
    }

    function addBotMessage(html) {
      var wrap = document.createElement('div');
      wrap.className = 'chatbot-message bot-message';
      wrap.innerHTML = '<div class="message-bubble">' + html + '</div>';
      ui.messages.appendChild(wrap);
      scrollToBottom();
    }

    function addUserMessage(html) {
      var wrap = document.createElement('div');
      wrap.className = 'chatbot-message user-message';
      wrap.innerHTML = '<div class="message-bubble">' + html + '</div>';
      ui.messages.appendChild(wrap);
      scrollToBottom();
    }

    function clearMessages() {
      ui.messages.innerHTML = '';
    }

    function addTyping() {
      var typingDiv = document.createElement('div');
      typingDiv.className = 'chatbot-message bot-message typing';
      typingDiv.innerHTML = '' +
        '<div class="message-bubble">' +
        '  <span class="dot"></span><span class="dot"></span><span class="dot"></span>' +
        '</div>';
      ui.messages.appendChild(typingDiv);
      scrollToBottom();
      return typingDiv;
    }

    function renderOptionsAnimated(options, versionAtCall, getVersion) {
      var p = new Promise(function (resolve) {
        var typing = addTyping();
        wait(800).then(function () {
          if (versionAtCall !== getVersion()) { typing.remove(); resolve(false); return; }
          typing.remove();

          var wrap = document.createElement('div');
          wrap.className = 'chatbot-message bot-message';

          var bubble = document.createElement('div');
          bubble.className = 'message-bubble';
          bubble.innerHTML =
            '<div>Escolha uma opção:</div>' +
            '<div class="suggestions" style="margin-top:.5rem; display:flex; gap:.5rem; flex-wrap:wrap;">' +
            options.map(function (o, i) {
              return '<button class="suggestion-btn" data-index="' + i + '" type="button">' + o.label + '</button>';
            }).join('') +
            '</div>';

          bubble.style.opacity = '0';
          bubble.style.transform = 'translateY(6px) scale(0.98)';
          bubble.style.transition = 'transform 160ms ease, opacity 160ms ease';
          bubble.style.willChange = 'transform, opacity';

          wrap.appendChild(bubble);
          ui.messages.appendChild(wrap);
          scrollToBottom();

          requestAnimationFrame(function () {
            if (versionAtCall !== getVersion()) { resolve(false); return; }
            // força layout
            void bubble.offsetHeight;
            bubble.style.opacity = '1';
            bubble.style.transform = 'translateY(0) scale(1)';
            resolve(true);
          });
        });
      });
      return p;
    }

    //  sim / nao
    function renderYesNoPrompt(versionAtCall, getVersion) {
      var p = new Promise(function (resolve) {
        var typing = addTyping();
        wait(600).then(function () {
          if (versionAtCall !== getVersion()) { typing.remove(); resolve(false); return; }
          typing.remove();

          var wrap = document.createElement('div');
          wrap.className = 'chatbot-message bot-message';

          var bubble = document.createElement('div');
          bubble.className = 'message-bubble';
          bubble.innerHTML =
            '<div>Tem mais alguma dúvida?</div>' +
            '<div class="yn" style="margin-top:.5rem; display:flex; gap:.5rem; flex-wrap:wrap;">' +
            '  <button class="yn-btn" data-yn="yes" type="button">Sim</button>' +
            '  <button class="yn-btn" data-yn="no"  type="button">Não</button>' +
            '</div>';

          bubble.style.opacity = '0';
          bubble.style.transform = 'translateY(6px) scale(0.98)';
          bubble.style.transition = 'transform 160ms ease, opacity 160ms ease';
          bubble.style.willChange = 'transform, opacity';

          wrap.appendChild(bubble);
          ui.messages.appendChild(wrap);
          scrollToBottom();

          requestAnimationFrame(function () {
            if (versionAtCall !== getVersion()) { resolve(false); return; }
            void bubble.offsetHeight;
            bubble.style.opacity = '1';
            bubble.style.transform = 'translateY(0) scale(1)';
            resolve(true);
          });
        });
      });
      return p;
    }

    function disableOptionButtons() {
      ui.messages.querySelectorAll('.suggestion-btn').forEach(function (b) {
        b.disabled = true;
        b.style.opacity = '0.6';
        b.style.cursor = 'default';
      });
    }


    function disableYesNoButtons() {
      ui.messages.querySelectorAll('.yn-btn').forEach(function (b) {
        b.disabled = true;
        b.style.opacity = '0.6';
        b.style.cursor = 'default';
      });
    }

    function isOpen() {
      return ui.win.classList.contains('open');
    }

    function openWin() { ui.win.classList.add('open'); }
    function closeWin() { ui.win.classList.remove('open'); }

    function onOptionsClick(handler) {
      ui.messages.addEventListener('click', function (e) {
        var btn = e.target.closest('.suggestion-btn');
        if (!btn) return;
        var idx = parseInt(btn.getAttribute('data-index'), 10);
        handler(idx);
      });
    }

    
    function onYesNoClick(handler) {
      ui.messages.addEventListener('click', function (e) {
        var btn = e.target.closest('.yn-btn');
        if (!btn) return;
        var value = btn.getAttribute('data-yn'); // "yes" ou "no"
        handler(value);
      });
    }

    function onToggleButtons(openHandler, closeHandler, canToggleFn) {
      var externalBtn = document.querySelector('.descartar-chatbot-button');
      var hook = function () {
        if (!canToggleFn()) return;
        if (isOpen()) closeHandler(); else openHandler();
      };
      if (externalBtn) {
        externalBtn.addEventListener('click', hook);
      }
      if (ui.bubbleBtn) {
        ui.bubbleBtn.addEventListener('click', hook);
      }
      if (ui.closeBtn) ui.closeBtn.addEventListener('click', closeHandler);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeHandler(); });
    }

    return {
      addBotMessage: addBotMessage,
      addUserMessage: addUserMessage,
      clearMessages: clearMessages,
      addTyping: addTyping,
      renderOptionsAnimated: renderOptionsAnimated,
      renderYesNoPrompt: renderYesNoPrompt,     
      disableOptionButtons: disableOptionButtons,
      disableYesNoButtons: disableYesNoButtons, 
      openWin: openWin,
      closeWin: closeWin,
      isOpen: isOpen,
      onOptionsClick: onOptionsClick,
      onYesNoClick: onYesNoClick,              
      onToggleButtons: onToggleButtons
    };
  })();


  var state = initialState();

  function getVersion() { return state.version; }
  function bumpVersion() { state.version += 1; }

  function resetConversation() {
    state.hasStarted = false;
    bumpVersion(); // invalida awaits em progresso
    UI.clearMessages();
  }

  function replyWithTyping(html, typingMs, afterMs, versionAtCall) {
    return (function () {
      if (versionAtCall !== getVersion()) return Promise.resolve(false);
      var typing = UI.addTyping();
      return wait(typingMs).then(function () {
        if (versionAtCall !== getVersion()) { typing.remove(); return false; }
        typing.remove();
        UI.addBotMessage(html);
        return wait(afterMs).then(function () {
          if (versionAtCall !== getVersion()) return false;
          return true;
        });
      });
    })();
  }

  function startConversation() {
    var myVersion = getVersion();
    if (state.isStarting) return Promise.resolve(false);
    state.isStarting = true;

    var seq = Promise.resolve().then(function () {
      UI.clearMessages();
      // Saudações (com “digitando...”)
      var p = Promise.resolve(true);
      Script.GREET_LINES.forEach(function (line) {
        p = p.then(function (ok) {
          if (!ok || myVersion !== getVersion()) return false;
          var typing = UI.addTyping();
          return wait(800).then(function () {
            if (myVersion !== getVersion()) { typing.remove(); return false; }
            typing.remove();
            UI.addBotMessage(line);
            return wait(600).then(function () {
              if (myVersion !== getVersion()) return false;
              return true;
            });
          });
        });
      });
      return p.then(function (ok) {
        if (!ok || myVersion !== getVersion()) return false;
        return UI.renderOptionsAnimated(Script.OPTIONS, myVersion, getVersion);
      }).then(function (ok) {
        if (!ok || myVersion !== getVersion()) return false;
        state.hasStarted = true;
        return true;
      });
    });

    return seq.finally(function () { state.isStarting = false; });
  }

  function openChat() {
    if (state.isOpening || state.isClosing) return;
    state.isOpening = true;
    state.visibility = 'open';
    state.lastToggleAt = Date.now();
    UI.openWin();
    startConversation().finally(function () { state.isOpening = false; });
  }

  function closeChat() {
    if (state.isOpening || state.isClosing) return;
    state.isClosing = true;
    state.visibility = 'closed';
    state.lastToggleAt = Date.now();
    UI.closeWin();
    resetConversation();
    setTimeout(function () { state.isClosing = false; }, 10);
  }

  function canToggleNow() {
    return canToggle(Date.now(), state.lastToggleAt);
  }



  // Clique nas opções
  UI.onOptionsClick(function (idx) {
    var opt = Script.OPTIONS[idx];
    if (!opt) return;

    UI.disableOptionButtons();
    UI.addUserMessage(opt.label);

    var v = getVersion();
   
    replyWithTyping(opt.answer, 800, 250, v).then(function (ok) {
      if (!ok) return;
   
      return UI.renderYesNoPrompt(v, getVersion);
    });
  });

  // Clique no Sim/Não
  UI.onYesNoClick(function (value) {
    // Evita cliques múltiplos
    UI.disableYesNoButtons();

    if (value === 'yes') {
      UI.addUserMessage('Sim');
      var v = getVersion();
      // Reapresenta as opções
      UI.renderOptionsAnimated(Script.OPTIONS, v, getVersion);
    } else {
      UI.addUserMessage('Não');
      var v2 = getVersion();
      replyWithTyping(Script.THANKS_HTML, 700, 0, v2);
    }
  });
  UI.onToggleButtons(openChat, closeChat, canToggleNow);
})();
