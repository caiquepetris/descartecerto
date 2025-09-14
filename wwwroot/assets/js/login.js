// ================== CONFIG ==================
const AUTH_KEY = 'dc_auth_v1';
const API_BASE = 'https://localhost:54034'; // Troque para https:// se seu site também estiver em HTTPS
const LOGIN_URL = `${API_BASE}/api/Auth/login`;

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
    onLoggedOutRedirect = '/login/login.html'
} = {}) {
    const auth = getAuth();
    const userEl = document.querySelector(userSelector);
    const logoutEl = document.querySelector(logoutSelector);
    const loginLinkEl = document.querySelector(loginLinkSelector);

    if (auth?.user) {
        const name = auth.user.username || auth.user.name || auth.user.email || 'Usuário';
        const email = auth.user.email && !name.includes('@') ? ` (${auth.user.email})` : '';
        if (userEl) {
            userEl.textContent = `${name}${email}`;
            userEl.style.display = 'inline-flex';
        }
        if (logoutEl) logoutEl.style.display = 'inline-flex';
        if (loginLinkEl) loginLinkEl.style.display = 'none';
    } else {
        if (userEl) userEl.style.display = 'none';
        if (logoutEl) logoutEl.style.display = 'none';
        if (loginLinkEl) loginLinkEl.style.display = 'inline-flex';
    }

    if (logoutEl) {
        logoutEl.addEventListener('click', () => {
            clearAuth();
            window.location.replace(onLoggedOutRedirect);
        });
    }
}

// ================== LOGIN ==================
async function loginWithCredentials({ username, password }) {
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
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `Falha no login (${res.status})`);
    }

    const data = await res.json();
    const token = data.token || data.accessToken || data.jwt || '';
    if (!token) {
        throw new Error('Token ausente na resposta.');
    }

    const user = data.user || { username, email: data.email };
    saveAuth(token, user);
    return { token, user };
}

// ================== LOGIN FORM HANDLER ==================
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.login-form');
    const err = document.getElementById('loginError');
    const btn = document.querySelector('.login-btn');

    if (isAuthenticated()) {
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

            // ✅ Sucesso: redirecionar
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

// ================== fetch com token ==================
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
