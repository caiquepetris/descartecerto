
// ==============================
// 🔒 Proteção da página de perfil
// ==============================

// Função para obter o token salvo
function getToken() {
  return localStorage.getItem('authToken'); // ou mude para cookie se for o caso
}

// Função que decodifica e valida um JWT
function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

function isTokenValid(token) {
  if (!token) return false;
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now; // true se ainda não expirou
}

// Checagem imediata assim que a página carrega
(function protectPage() {
  const token = getToken();
  
  if (!isTokenValid(token)) {
    localStorage.removeItem('authToken');
    window.location.replace('login/login.html');
  }
})();

