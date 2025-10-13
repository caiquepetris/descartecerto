// ================== CONFIG ==================
var AUTH_KEY = 'dc_auth_v1';
const API_BASE = 'https://localhost:54034';
const LOGIN_URL = `${API_BASE}/api/Auth/login`;
const Ranking = `${API_BASE}/api/Recycling/ranking`;

// ================== STORAGE ==================
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
    return !!getToken();
}

// ================== HEADER UI ==================
function applyHeaderAuth({
    userSelector = '#userDisplay',
    logoutSelector = '#logoutBtn',
    loginLinkSelector = '.header-section__login-button',
    onLoggedOutRedirect = '/perfil.html'
} = {}) {
    const auth = getAuth();
    const userEl = document.querySelector(userSelector);
    const logoutEl = document.querySelector(logoutSelector);
    const loginLinkEl = document.querySelector(loginLinkSelector);
    const userLinkEl = document.querySelector('#userLink'); // novo link para o perfil

    if (auth?.user) {
        const name = auth.user.username || auth.user.name || auth.user.email || 'Usuário';
        const email = auth.user.email && !name.includes('@') ? ` (${auth.user.email})` : '';

        if (userEl) userEl.textContent = `${name}${email}`;
        if (userLinkEl) userLinkEl.style.display = 'inline-flex';
        if (logoutEl) logoutEl.style.display = 'inline-flex';
        if (loginLinkEl) loginLinkEl.style.display = 'none';
    } else {
        if (userEl) userEl.textContent = '';
        if (userLinkEl) userLinkEl.style.display = 'none';
        if (logoutEl) logoutEl.style.display = 'none';
        if (loginLinkEl) loginLinkEl.style.display = 'inline-flex';
    }


}

async function rakingdecrescente({ quantities }) {

    const res = await fetch(Ranking, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ top: quantities }),
        credentials: 'include'
    });
}

Ranking

// ================== LOGIN ==================
async function loginWithCredentials({ username, password, email }) {
    const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ Email: username, Password: password }),
        credentials: 'include'
    });


    if (!res.ok) {
        const text = await res.text().catch(() => '');
        let msg = `Falha no login (${res.status})`;
        try {
            const j = JSON.parse(text);
            msg = j.title || j.message || msg;
        } catch { }
        throw new Error(msg);
    }

    const data = await res.json();

    // token com fallback para diferentes casings/campos
    const token = data.token || data.Token || data.accessToken || data.jwt;
    if (!token) throw new Error('Token ausente na resposta da API.');

    const user = {
        id: data.userId,
        username: data.username,
        email: data.email,
        points: data.points
    };


    saveAuth(token, user);
    return { token, user };
}


// ================== LOGIN FORM HANDLER ==================
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.login-form');
    const err = document.getElementById('loginError');
    const btn = document.querySelector('.login-btn');

    // ✅ Redirecionar somente se estiver na página de login
    const isLoginPage = window.location.pathname.includes('/login');

    if (isLoginPage && isAuthenticated()) {
        window.location.replace('/index.html');
        return;
    }

    if (!loginForm) return;

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (err) { err.style.display = 'none'; err.textContent = ''; }

        const email = document.getElementById('email')?.value.trim();
        const password = document.getElementById('password')?.value;
        if (!email || !password) {
            err.textContent = 'Por favor, preencha todos os campos.';
            err.style.display = 'block';
            return;
        }

        try {
            btn.textContent = 'Entrando...';
            btn.disabled = true;

            await loginWithCredentials({ username: email, password });


            window.location.replace('/index.html');
        } catch (error) {
            err.textContent = error.message || 'Erro inesperado ao logar.';
            err.style.display = 'block';
        } finally {
            btn.textContent = 'Entrar';
            btn.disabled = false;
        }
    });
});

async function authFetch(url, options = {}) {
    const token = getToken();
    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');
    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const res = await fetch(url, { ...options, headers, credentials: 'include' });
    if (res.status === 401) {
        clearAuth();
    }
    return res;
}
