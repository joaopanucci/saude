document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    const cpfInput = document.getElementById('cpf');
    const ibgeInput = document.getElementById('ibge');
    const cnesInput = document.getElementById('cnes');

    // Event listeners para formatação
    cpfInput.addEventListener('input', function() {
        formatCPF(this);
    });

    if (ibgeInput) {
        ibgeInput.addEventListener('input', function() {
            formatIBGE(this);
        });
    }

    if (cnesInput) {
        cnesInput.addEventListener('input', function() {
            formatCNES(this);
        });
    }

    // Event listener para submit do form
    form.addEventListener('submit', async function(event) {
        await handleSubmit(event);
    });
});

function formatCPF(input) {
    // Remove tudo que não é número
    let value = input.value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    // Aplica a formatação: 000.000.000-00
    if (value.length >= 4) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
    }
    if (value.length >= 7) {
        value = value.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
    }
    if (value.length >= 10) {
        value = value.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    }
    
    input.value = value;
}

function formatIBGE(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 7) {
        value = value.substring(0, 7);
    }
    input.value = value;
}

function formatCNES(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 7) {
        value = value.substring(0, 7);
    }
    input.value = value;
}

async function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Pegar os valores do formulário
    const name = formData.get('name');
    const cpf = formData.get('cpf');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // Validações
    if (!name || name.trim() === '') {
        alert('Por favor, preencha o nome');
        return;
    }
    
    // Validar CPF
    if (!validateCPF(cpf)) {
        alert('CPF inválido. Por favor, verifique os dados inseridos.');
        return;
    }
    
    // Validar senhas
    if (password !== confirmPassword) {
        alert('As senhas não coincidem');
        return;
    }
    
    if (password.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres');
        return;
    }
    
    // Mostrar loading
    const button = form.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    button.textContent = 'Cadastrando...';
    button.disabled = true;
    
    try {
        // Remover formatação do CPF para enviar apenas números
        const cpfNumbers = cpf.replace(/\D/g, '');
        
        const response = await fetch('/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                name: name.trim(), 
                cpf: cpfNumbers, 
                password 
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Usuário criado com sucesso!');
            // Redirecionar para login
            window.location.href = '/src/html/login.html';
        } else {
            alert(data.message || 'Erro ao criar usuário');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao criar usuário. Tente novamente.');
    } finally {
        // Restaurar botão
        button.textContent = originalText;
        button.disabled = false;
    }
}

function validateCPF(cpf) {
    // Remove formatação
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validar primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 > 9) digit1 = 0;
    
    if (parseInt(cpf.charAt(9)) !== digit1) return false;
    
    // Validar segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 > 9) digit2 = 0;
    
    return parseInt(cpf.charAt(10)) === digit2;
}

// Formatar CPF enquanto digita
document.getElementById('cpf').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 11);
    e.target.value = value;
});