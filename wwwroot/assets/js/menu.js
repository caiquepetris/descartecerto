// Menu Hamburguer do Header
function initMenu() {
    const menuHamburguer = document.querySelector('.menu-hamburguer');
    const menu = document.querySelector('.menu');
    const overlay = document.querySelector('.overlay');
    const closeSidebar = document.querySelector('.close-sidebar');

    if (!menuHamburguer || !menu || !overlay || !closeSidebar) {
        console.warn("[menu.js] Elementos do menu não encontrados.");
        console.log("menuHamburguer:", menuHamburguer);
        console.log("menu:", menu);
        console.log("overlay:", overlay);
        console.log("closeSidebar:", closeSidebar);
        return;
    }

    function openSidebar() {
        menu.classList.add('active');
        overlay.classList.add('active');
        menuHamburguer.style.zIndex = '97';
    }

    function closeSidebarFunc() {
        menu.classList.remove('active');
        overlay.classList.remove('active');
        menuHamburguer.style.zIndex = '101';
    }

    menuHamburguer.addEventListener('click', function (event) {
        event.stopPropagation();
        openSidebar();
    });

    closeSidebar.addEventListener('click', closeSidebarFunc);
    overlay.addEventListener('click', closeSidebarFunc);

    const menuLinks = document.querySelectorAll('.menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', closeSidebarFunc);
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && menu.classList.contains('active')) {
            closeSidebarFunc();
        }
    });

    console.info("[menu.js] Menu inicializado.");
}

// 🔑 expõe globalmente para o loader chamar
window.initMenu = initMenu;

// Se o DOM já estiver pronto, inicializa logo
if (document.readyState !== 'loading') {
    initMenu();
} else {
    document.addEventListener('DOMContentLoaded', initMenu);
}
