document.addEventListener('DOMContentLoaded', function() {
    // Adicionar detalhes à lixeira
    const recyclingBin = document.querySelector('.recycling-bin');
    const binDetails = document.createElement('div');
    binDetails.classList.add('bin-details');
    recyclingBin.appendChild(binDetails);
    
    // Criar estrelas
    createStars();
    
    // Configurar modo noturno
    toggleNightMode();
    
    // Atualizar modo noite/dia a cada minuto
    setInterval(toggleNightMode, 60000);
    
    // Validação do formulário
    const loginForm = document.querySelector('.login-form');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        

        
        const loginBtn = document.querySelector('.login-btn');
        loginBtn.textContent = 'Entrando...';
        loginBtn.disabled = true;
        
        setTimeout(() => {
            alert('Login realizado com sucesso!');
            loginBtn.textContent = 'Entrar';
            loginBtn.disabled = false;
            loginForm.reset();
        }, 1500);
    });
    
    // Adicionar efeito de foco nos campos de entrada
    const inputs = document.querySelectorAll('.form-group input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            const icon = this.parentElement.querySelector('i');
            if (icon) {
                icon.style.color = 'var(--primary-green)';
            }
        });
        
        input.addEventListener('blur', function() {
            const icon = this.parentElement.querySelector('i');
            if (icon) {
                icon.style.color = '#999';
            }
        });
    });
});

// Função para criar estrelas
function createStars() {
    const illustration = document.querySelector('.illustration');
    const starCount = 30; // Aumentado para mais estrelas
    
    // Limpar estrelas existentes antes de criar novas
    const existingStars = illustration.querySelectorAll('.star');
    existingStars.forEach(star => star.remove());
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const size = Math.random() * 3 + 1;
        const delay = Math.random() * 3;
        const duration = Math.random() * 2 + 2;
        
        star.style.cssText = `
            position: absolute;
            top: ${top}%;
            left: ${left}%;
            width: ${size}px;
            height: ${size}px;
            background-color: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            animation: twinkle ${duration}s ease-in-out infinite ${delay}s;
            transform-origin: center center;
        `;
        
        illustration.appendChild(star);
    }
}

// Função para alternar o modo noturno
function toggleNightMode() {
    const body = document.body;
    const hour = new Date().getHours();
    
    if (hour < 6 || hour >= 18) {
        body.style.transition = 'all 1s ease-in-out';
        body.classList.add('night-mode');
    } else {
        body.style.transition = 'all 1s ease-in-out';
        body.classList.remove('night-mode');
    }
}

const form = document.querySelector(".form-forgot");
    const msg = document.getElementById("mensagem-status");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      if (!email) {
        msg.hidden = false;
        msg.textContent = "Por favor, insira um email válido.";
        msg.style.color = "red";
        return;
      }
      msg.hidden = false;
      msg.textContent = "Enviando instruções...";
      msg.style.color = "#000";
      try {
        // Exemplo de chamada para sua API C#
        const response = await fetch("/api/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (response.ok) {
          msg.textContent =
            "Se o email estiver cadastrado, enviaremos as instruções!";
          msg.style.color = "green";
          form.reset();
        } else {
          const error = await response.json();
          msg.textContent = error.message || "Erro ao enviar o email.";
          msg.style.color = "red";
        }
      } catch (error) {
        msg.textContent = "Erro na conexão. Tente novamente mais tarde.";
        msg.style.color = "red";
      }
    });