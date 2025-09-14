
const API_BASE = 'https://localhost:54034';
const LOGIN_URL = `${API_BASE}/api/Auth/login`;

function saveAuth(token, user) {
    localStorage.setItem(AUTH\_KEY, JSON.stringify({ token, user }));
}

function getAuth() {
    try {
        const raw = localStorage.getItem(AUTH\_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function clearAuth() {
    localStorage.removeItem(AUTH\_KEY);
}

function isAuthenticated() {
    const a = getAuth();
    if (!a?.token) return false;
    
    return true;
}

function requireAuth({ redirectTo = '/login/login.html' } = {}) {
    if (!isAuthenticated()) {
        window\.location.replace(redirectTo);
    }
}

function applyHeaderAuth({
    userSelector = '#userDisplay',
    logoutSelector = '#logoutBtn',
    loginLinkSelector = '.header-section\_\_login-button',
    onLoggedOutRedirect = '/login/login.html'
} = {}) {
    const auth = getAuth();
    const userEl = document.querySelector(userSelector);
    const logoutEl = document.querySelector(logoutSelector);
    const loginLinkEl = document.querySelector(loginLinkSelector);

   
if (auth?.user) {
    // Mostrar usuário e botão sair; esconder login
    if (userEl) {
        const name = auth.user.username || auth.user.name || auth.user.email || 'Usuário';
        const email = auth.user.email && !String(name).includes('@') ? ` (${ auth.user.email })` : '';
        userEl.textContent = `${ name }${ email } `;
        userEl.style.display = 'inline-flex';
    }
    if (logoutEl) logoutEl.style.display = 'inline-flex';
    if (loginLinkEl) loginLinkEl.style.display = 'none';
} else {
    // Sem sessão: esconder usuário/sair; mostrar login
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

async function authFetch(input, init = {}) {
    const auth = getAuth();
    const headers = new Headers(init.headers || {});
    if (auth?.token) headers.set('Authorization', `Bearer ${auth.token}`);
    return fetch(input, { ...init, headers });
}

window\.saveAuth = saveAuth;
window\.getAuth = getAuth;
window\.clearAuth = clearAuth;
window\.isAuthenticated = isAuthenticated;
window\.requireAuth = requireAuth;
window\.applyHeaderAuth = applyHeaderAuth;
window\.authFetch = authFetch;
