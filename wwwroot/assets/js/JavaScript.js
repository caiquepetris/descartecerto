document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            clearAuth(); 
            alert("Logout realizado com sucesso!"); 
            window.location.href = "/login/login.html"; 
        });
    }
});
