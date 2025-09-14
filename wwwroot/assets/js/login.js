
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.login-form');
    const err = document.getElementById('loginError');
    const btn = document.querySelector('.login-btn');

    // já logado? vai pra home
    if (typeof isAuthenticated === 'function' && isAuthenticated()) {
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
            if (err) { err.textContent = 'Por favor, preencha todos os campos.'; err.style.display = 'block'; }
            return;
        }

        try {
            if (btn) { btn.textContent = 'Entrando...'; btn.disabled = true; }

            // usa o auth.js (LOGIN_URL = http(s)://localhost:54034/api/Auth/login)
            await loginWithCredentials({ email, password });

            window.location.replace('/index.html');
        } catch (error) {
            if (err) { err.textContent = error?.message || 'Erro inesperado ao logar.'; err.style.display = 'block'; }
        } finally {
            if (btn) { btn.textContent = 'Entrar'; btn.disabled = false; }
        }
    });
});
