// /assets/js/login.js
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.login-form');
    const err = document.getElementById('loginError');
    const btn = document.querySelector('.login-btn');

    // Se já estiver logado, redireciona para a home
    if (isAuthenticated && isAuthenticated()) {
        window.location.replace('/index.html');
        return;
    }

    if (!loginForm) return;

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        err.style.display = 'none';
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            err.textContent = 'Por favor, preencha todos os campos.';
            err.style.display = 'block';
            return;
        }

        const payload = { username: email, password };

        try {
            btn.textContent = 'Entrando...';
            btn.disabled = true;

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || 'Falha no login.');
            }

            const data = await res.json();
           
            const user = data.user || { username: email, email };
            const token = data.token || data.accessToken || data.jwt || '';
            if (!token) {
                throw new Error('Token ausente na resposta.');
            }
            saveAuth(token, user);
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
