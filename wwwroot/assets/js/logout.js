const AUTH_KEY = 'dc_auth_v1';

function getAuth() {
    try {
        const raw = localStorage.getItem(AUTH_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}
function clearAuth() {
    localStorage.removeItem(AUTH_KEY);
}
function isAuthenticated() {
    const a = getAuth();
    return !!(a && a.token && String(a.token).length > 0);
}

function injectLogoutBtnCSS() {
    if (document.getElementById('logoutBtnStyle')) return;
    const style = document.createElement('style');
    style.id = 'logoutBtnStyle';
    style.innerHTML = `
        #logoutBtn {
            display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem;
            padding: 0.5rem 1rem; border-radius: 9999px; background-color: #f3f4f6;
            border: none; color: #1f2937; font-size: 0.92rem; font-weight: 600;
            cursor: pointer; transition: background 0.3s; background-image: none; outline: none;
        }
        #logoutBtn:hover { background: #e5fbe7; color: #16a34a; }
        .dc-logout-modal-bg {
            position: fixed; inset: 0; z-index: 9999;
            background: rgba(16,163,74,0.12); display: flex;
            align-items: center; justify-content: center;
            animation: dcFadeIn .25s;
        }
        @keyframes dcFadeIn { from { opacity:0 } to { opacity:1 } }
        .dc-logout-modal {
            background: #fff; border-radius: 22px;
            box-shadow: 0 8px 32px rgba(16,163,74,0.10), 0 2px 8px rgba(0,0,0,.09);
            max-width: 350px; min-width: 230px; width: 96vw;
            padding: 28px 18px 18px 18px;
            text-align: center;
            font-family: 'Segoe UI', Arial, sans-serif;
            border: 2.5px solid #e6faef;
        }
        .dc-logout-modal-title {
            font-size: 1.2rem; font-weight: bold; color: #16a34a;
            margin-bottom: 10px; letter-spacing: 0.3px;
        }
        .dc-logout-modal-msg {
            font-size: 1.05rem; color: #222; margin-bottom: 20px;
        }
        .dc-logout-modal-actions {
            display: flex; justify-content: center; gap: 18px; margin-top: 8px;
        }
        .dc-logout-btn-yes, .dc-logout-btn-no {
            min-width: 70px; padding: 0.55em 1.5em; border-radius: 14px;
            border: none; font-size: 1.02rem; font-weight: 600;
            cursor: pointer; outline: none; transition: background 0.22s;
            box-shadow: 0 2px 6px rgba(16,163,74,0.06);
        }
        .dc-logout-btn-yes {
            background: #16a34a; color: #fff;
        }
        .dc-logout-btn-yes:hover {
            background: #12843a;
        }
        .dc-logout-btn-no {
            background: #e5e7eb; color: #222;
        }
        .dc-logout-btn-no:hover {
            background: #b7ead1; color: #065f46;
        }
        @media (max-width: 480px) {
            .dc-logout-modal { padding: 18px 2vw 16px 2vw; }
        }
    `;
    document.head.appendChild(style);
}

function ensureLogoutBtn() {
    let btn = document.getElementById('logoutBtn');
    if (btn) return btn;

    const actions = document.querySelector('.header-actions');
    if (!actions) {
        return null;
    }

    injectLogoutBtnCSS();

    btn = document.createElement('button');
    btn.id = 'logoutBtn';
    btn.type = 'button';
    btn.className = 'header-logout';
    btn.textContent = 'Sair';

    const loginBtn = actions.querySelector('.header-section__login-button');
    actions.insertBefore(btn, loginBtn);

    btn.addEventListener("click", openLogoutModal);
    return btn;
}

function removeLogoutBtn() {
    const btn = document.getElementById('logoutBtn');
    if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
}

function openLogoutModal(ev) {
    if (ev) ev.preventDefault();

    if (document.querySelector('.dc-logout-modal-bg')) return;

    injectLogoutBtnCSS();

    const modalBg = document.createElement("div");
    modalBg.className = "dc-logout-modal-bg";

    const modal = document.createElement("div");
    modal.className = "dc-logout-modal";

    const title = document.createElement("div");
    title.className = "dc-logout-modal-title";
    title.textContent = "Deslogar da sua conta?";

    const msg = document.createElement("div");
    msg.className = "dc-logout-modal-msg";
    msg.textContent = "Tem certeza que deseja sair da sua conta do Descarte Certo?";

    const actions = document.createElement("div");
    actions.className = "dc-logout-modal-actions";

    const yesBtn = document.createElement("button");
    yesBtn.className = "dc-logout-btn-yes";
    yesBtn.textContent = "Sim, sair";

    const noBtn = document.createElement("button");
    noBtn.className = "dc-logout-btn-no";
    noBtn.textContent = "Cancelar";

    actions.appendChild(yesBtn);
    actions.appendChild(noBtn);
    modal.appendChild(title);
    modal.appendChild(msg);
    modal.appendChild(actions);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);

    yesBtn.focus();

    let logoutClicked = false;

    yesBtn.addEventListener("click", () => {
        if (logoutClicked) return;
        logoutClicked = true;

        clearAuth();
        document.body.removeChild(modalBg);

        // ATUALIZA O NOME DO PERFIL NA HORA!
        atualizarNomePerfil();

        updateHeaderAuthUI();
    });

    noBtn.addEventListener("click", () => {
        document.body.removeChild(modalBg);
    });

    modalBg.addEventListener("click", e => {
        if (e.target === modalBg) document.body.removeChild(modalBg);
    });

    document.addEventListener("keydown", function escClose(evt) {
        if (evt.key === "Escape" && document.body.contains(modalBg)) {
            document.body.removeChild(modalBg);
            document.removeEventListener("keydown", escClose);
        }
    });
}

function updateHeaderAuthUI() {
    const loginBtn = document.querySelector(".header-section__login-button");
    const logged = isAuthenticated();
    const auth = getAuth();

    if (loginBtn) {
        if (logged && auth?.user) {
            let name = auth.user.username || auth.user.name || auth.user.email || 'Perfil';
            loginBtn.querySelector(".header-section__login-text").textContent = name;
            loginBtn.setAttribute("href", "perfil.html");
            loginBtn.setAttribute("title", "Ver perfil");
        } else {
            const username = auth?.user?.username || auth?.user?.email || 'não logado';
            loginBtn.querySelector(".header-section__login-text").textContent = "Login / Sign Up";
            loginBtn.setAttribute("href", "login/login.html");
            loginBtn.setAttribute("title", "Login ou cadastro");
        }
    }
    if (logged) {
        ensureLogoutBtn();
    } else {
        removeLogoutBtn();
    }
}

document.addEventListener("DOMContentLoaded", updateHeaderAuthUI);

function atualizarNomePerfil() {
    const nomeEl = document.getElementById('nomePerfil');
    try {
        const authRaw = localStorage.getItem('dc_auth_v1');
        const auth = authRaw ? JSON.parse(authRaw) : null;
        const username = auth?.user?.username || auth?.user?.email || 'não logado';
        if (nomeEl) nomeEl.textContent = username;
    } catch (err) {
        if (nomeEl) nomeEl.textContent = 'não logado';
    }
}

document.addEventListener('DOMContentLoaded', atualizarNomePerfil);

document.addEventListener('click', function (e) {
    const btn = e.target.closest('#logoutBtn');
    if (btn) {
        atualizarNomePerfil();
    }
});
