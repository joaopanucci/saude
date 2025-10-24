document.addEventListener('DOMContentLoaded', function() {
    // Elementos
    const resetForm = document.getElementById('resetForm');
    const loginForm = document.getElementById('loginForm');
    const forgotFormSection = document.getElementById('forgot-form');
    const loginFormSection = document.getElementById('login-form');
    const successMessage = document.getElementById('success-message');
    
    // Inputs CPF
    const cpfInput = document.getElementById('cpf');
    const loginCpfInput = document.getElementById('login-cpf');
    
    // Links e botões
    const showForgotLink = document.getElementById('showForgotLink');
    const resetFormBtn = document.getElementById('resetFormBtn');

    // Formatação de CPF
    if (cpfInput) {
        cpfInput.addEventListener('input', function() {
            formatCPF(this);
        });
    }
    
    if (loginCpfInput) {
        loginCpfInput.addEventListener('input', function() {
            formatCPF(this);
        });
    }

    // Event Listeners
    if (resetForm) {
        resetForm.addEventListener('submit', handleResetSubmit);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    if (showForgotLink) {
        showForgotLink.addEventListener('click', showForgotPassword);
    }
    
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', resetFormHandler);
    }
});

function formatCPF(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = value;
}

function validateCPF(cpf) {
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

function handleResetSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const button = form.querySelector('button[type="submit"]');
    const cpf = form.querySelector('#cpf').value;
    
    // Validar CPF
    if (!validateCPF(cpf)) {
        showError('CPF inválido. Por favor, verifique os dados inseridos.');
        return;
    }
    
    // Verificar se CPF existe no sistema (simulação)
    if (!checkCPFExists(cpf)) {
        showError('CPF não encontrado no sistema.');
        return;
    }
    
    // Simular envio
    button.textContent = 'Enviando...';
    button.disabled = true;
    
    setTimeout(() => {
        document.getElementById('forgot-form').classList.add('hidden');
        document.getElementById('success-message').classList.remove('hidden');
        
        // Log para debug
        console.log('E-mail de recuperação enviado para CPF:', cpf);
    }, 2000);
}

function handleLoginSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const button = form.querySelector('button[type="submit"]');
    const cpf = form.querySelector('#login-cpf').value;
    const password = form.querySelector('#password').value;
    
    // Validações básicas
    if (!validateCPF(cpf)) {
        showError('CPF inválido. Por favor, verifique os dados inseridos.');
        return;
    }
    
    if (password.length < 6) {
        showError('A senha deve ter pelo menos 6 caracteres.');
        return;
    }
    
    // Simular login
    button.textContent = 'Entrando...';
    button.disabled = true;
    
    setTimeout(() => {
        // Simular login bem-sucedido
        button.textContent = 'Login realizado!';
        button.classList.add('success');
        
        // Redirecionar após 1 segundo
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
        // Log para debug
        console.log('Login realizado para CPF:', cpf);
    }, 1500);
}

function showForgotPassword(event) {
    event.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('forgot-form').classList.remove('hidden');
    document.getElementById('success-message').classList.add('hidden');
}

function resetFormHandler() {
    document.getElementById('success-message').classList.add('hidden');
    document.getElementById('forgot-form').classList.remove('hidden');
    
    // Reset form
    const form = document.getElementById('resetForm');
    form.reset();
    
    // Reset button
    const button = form.querySelector('button[type="submit"]');
    button.textContent = 'Enviar instruções';
    button.disabled = false;
}

function checkCPFExists(cpf) {
    // Simular alguns CPFs cadastrados (removendo formatação)
    const registeredCPFs = [
        '12345678901',
        '98765432100',
        '11122233344'
    ];
    
    const cleanCPF = cpf.replace(/\D/g, '');
    return registeredCPFs.includes(cleanCPF);
}

function showError(message) {
    // Remove erro anterior se existir
    const existingError = document.getElementById('error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Criar elemento de erro
    const errorDiv = document.createElement('div');
    errorDiv.id = 'error-message';
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #f8d7da;
        color: #721c24;
        padding: 0.75rem;
        border-radius: 6px;
        margin: 1rem 0;
        text-align: center;
        font-size: 0.9rem;
        border: 1px solid #f5c6cb;
    `;
    errorDiv.textContent = message;
    
    // Inserir após o primeiro form visível
    const visibleForm = document.querySelector('.form-section:not(.hidden)');
    if (visibleForm) {
        const formContent = visibleForm.querySelector('.form-content');
        if (formContent) {
            formContent.insertBefore(errorDiv, formContent.firstChild);
        }
    }
    
    // Remover erro após 5 segundos
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}