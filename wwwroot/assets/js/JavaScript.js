document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            clearAuth(); // apaga o token
            alert("Logout realizado com sucesso!"); // só pra teste
            window.location.href = "/login/login.html"; // redireciona
        });
    }
});
