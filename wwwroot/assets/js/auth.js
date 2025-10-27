// Ajuste a URL da sua API (HTTPS, porta 54034):
const API_BASE = 'https://descartecerto.azurewebsites.net';
const LOGIN_URL = `${API_BASE}/api/Auth/login`;
const REGISTER_URL = `${API_BASE}/api/Auth/register`; // se você tiver esse endpoint
const AUTH_KEY = 'dc.auth';

// ---- Storage helpers ----
function saveAuth(token, user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ token, user }));
}

function getAuth() {
    try {
        const raw = localStorage.getItem(AUTH_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function clearAuth() {
    localStorage.removeItem(AUTH_KEY);
}

function getToken() {
    return getAuth()?.token || null;
}

function isAuthenticated() {
    const a = getAuth();
    return Boolean(a?.token);
}

// ---- Proteção de página ----
function requireAuth({ redirectTo = '/login/login.html' } = {}) {
    if (!isAuthenticated()) {
        window.location.replace(redirectTo);
    }
}

// ---- UI Header (opcional) ----
// userSelector: onde mostrar o nome do usuário logado
// logoutSelector: botão/link para sair
// loginLinkSelector: link "Entrar" para esconder quando logado
function applyHeaderAuth({
    userSelector = '#userDisplay',
    logoutSelector = '#logoutBtn',
    loginLinkSelector = '.header-section__login-link'
} = {}) {
    const auth = getAuth();
    const userEl = document.querySelector(userSelector);
    const logoutEl = document.querySelector(logoutSelector);
    const loginLinkEl = document.querySelector(loginLinkSelector);

    if (auth?.user) {
        if (userEl) userEl.textContent = auth.user.username || auth.user.name || 'Usuário';
        if (loginLinkEl) loginLinkEl.style.display = 'none';
        if (logoutEl) {
            logoutEl.style.display = '';
            logoutEl.onclick = (e) => {
                e?.preventDefault?.();
                logout();
            };
        }
    } else {
        if (userEl) userEl.textContent = '';
        if (loginLinkEl) loginLinkEl.style.display = '';
        if (logoutEl) logoutEl.style.display = 'none';
    }
}

// ---- Chamada autenticada ----
// Use este wrapper para qualquer fetch que exija Bearer JWT
async function authFetch(url, options = {}) {
    const token = getToken();
    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');
    if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
    }
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const res = await fetch(url, { ...options, headers, credentials: 'include' });
    if (res.status === 401) {
        // token inválido/expirado
        clearAuth();
        // opcional: redirecionar para login
        // window.location.replace('/login/login.html');
    }
    return res;
}

// ---- Fluxo de login/logout/registro ----
async function login({ username, password }) {
    const payload = { username, password };

    const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        // IMPORTANTE: não stringify errado / não mandar form-data aqui
        body: JSON.stringify(payload),
        credentials: 'include' // ok se backend usar cookies, senão não faz mal
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Falha no login (${res.status})`);
    }

    // Esperado: { token: "...", user: { ... } }
    const data = await res.json();
    if (!data?.token) {
        throw new Error('Resposta sem token. Verifique o backend (retornar { token, user }).');
    }

    saveAuth(data.token, data.user || { username });
    return data;
}

function logout() {
    clearAuth();
    // Atualiza UI:
    applyHeaderAuth();
    // Opcional: redireciona pro login
    // window.location.replace('/login/login.html');
}

async function register({ username, password, email }) {
    const res = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ username, password, email })
    });
    if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `Falha no registro (${res.status})`);
    }
    return res.json().catch(() => ({}));
}

// ---- Exemplo de uso com formulário de login ----
// No HTML, garanta um form com id="loginForm" e inputs name="username" e "password".
function wireLoginForm(formSelector = '#loginForm') {
    const form = document.querySelector(formSelector);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // impede o reload da página
        const fd = new FormData(form);
        const username = (fd.get('username') || '').toString().trim();
        const password = (fd.get('password') || '').toString();

        const submitBtn = form.querySelector('[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : null;

        try {
            if (submitBtn) submitBtn.textContent = 'Entrando...';
            await login({ username, password });
            applyHeaderAuth();
            // redireciona para dashboard/home após logar
            window.location.replace('/index.html');
        } catch (err) {
            alert(err.message || 'Não foi possível entrar.');
        } finally {
            if (submitBtn && originalText) submitBtn.textContent = originalText;
        }
    });
}

// Exporte globais (se estiver usando <script> simples)
window.DCAuth = {
    saveAuth,
    getAuth,
    clearAuth,
    getToken,
    isAuthenticated,
    requireAuth,
    applyHeaderAuth,
    authFetch,
    login,
    logout,
    register,
    wireLoginForm
};
