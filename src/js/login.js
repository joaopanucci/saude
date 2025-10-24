document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const cpf = document.getElementById('cpf').value;
    const password = document.getElementById('password').value;
    
    // Validar CPF (apenas números)
    if (!/^\d{11}$/.test(cpf)) {
        alert('CPF deve conter exatamente 11 números');
        return;
    }
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cpf, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Login realizado com sucesso!');
            // Salvar dados do usuário no localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            // Redirecionar para página inicial
            window.location.href = '/src/html/inicio.html';
        } else {
            alert(data.message || 'Erro no login');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao fazer login. Tente novamente.');
    }
});

// Função para formatar CPF enquanto digita
document.getElementById('cpf').addEventListener('input', function(e) {
    // Remove tudo que não é número
    let value = e.target.value.replace(/\D/g, '');
    // Limita a 11 dígitos
    value = value.substring(0, 11);
    e.target.value = value;
});