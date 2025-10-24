document.addEventListener('DOMContentLoaded', function() {
    // Elementos
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    const logoutBtn = document.getElementById('logoutBtn');
    const pageTitle = document.getElementById('page-title');
    const userCount = document.getElementById('userCount');

    // Títulos das seções
    const sectionTitles = {
        'overview': 'Visão Geral',
        'users': 'Usuários',
        'reports': 'Relatórios',
        'analytics': 'Análises',
        'settings': 'Configurações',
        'profile': 'Perfil'
    };

    // Event listeners para itens do menu
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionName = this.getAttribute('data-section');
            showSection(sectionName);
            setActiveMenuItem(this);
        });
    });

    // Event listener para logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Função para mostrar seção específica
    function showSection(sectionName) {
        // Esconder todas as seções
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.add('hidden');
        });

        // Mostrar seção selecionada
        const selectedSection = document.getElementById(sectionName + '-section');
        if (selectedSection) {
            selectedSection.classList.remove('hidden');
        }

        // Atualizar título da página
        if (pageTitle && sectionTitles[sectionName]) {
            pageTitle.textContent = sectionTitles[sectionName];
        }

        // Log para debug
        console.log('Seção ativa:', sectionName);
    }

    // Função para definir item ativo do menu
    function setActiveMenuItem(activeItem) {
        menuItems.forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }

    // Função de logout
    function logout() {
        if (confirm('Tem certeza que deseja sair?')) {
            // Simular logout - limpar dados locais se necessário
            localStorage.removeItem('userData');
            sessionStorage.clear();
            
            // Redirecionar para página de login
            window.location.href = '/src/html/login.html';
        }
    }

    // Simulação de atualizações em tempo real
    function simulateRealTimeUpdates() {
        if (userCount) {
            const currentValue = parseInt(userCount.textContent.replace(',', ''));
            const newValue = currentValue + Math.floor(Math.random() * 3);
            userCount.textContent = newValue.toLocaleString();
        }

        // Atualizar timestamp das atividades
        updateActivityTimestamps();
    }

    // Função para atualizar timestamps das atividades
    function updateActivityTimestamps() {
        const timeElements = document.querySelectorAll('.activity-time');
        const timeOptions = [
            'Há 1 minuto',
            'Há 3 minutos', 
            'Há 5 minutos',
            'Há 10 minutos',
            'Há 15 minutos',
            'Há 30 minutos',
            'Há 1 hora',
            'Há 2 horas'
        ];

        timeElements.forEach((element, index) => {
            if (Math.random() > 0.7) { // 30% chance de atualizar
                const randomTime = timeOptions[Math.floor(Math.random() * timeOptions.length)];
                element.textContent = randomTime;
            }
        });
    }

    // Inicializar simulação de atualizações (a cada 30 segundos)
    setInterval(simulateRealTimeUpdates, 30000);

    // Função para carregar dados do usuário
    function loadUserData() {
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                // Atualizar informações do usuário na interface
                const userAvatar = document.querySelector('.user-avatar');
                const userName = document.querySelector('.user-info span');
                
                if (userAvatar && user.nome) {
                    userAvatar.textContent = user.nome.charAt(0).toUpperCase();
                }
                
                if (userName && user.nome) {
                    userName.textContent = user.nome.split(' ')[0]; // Primeiro nome
                }
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
            }
        }
    }

    // Carregar dados do usuário ao inicializar
    loadUserData();

    // Animações de entrada
    function initializeAnimations() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // Inicializar animações
    setTimeout(initializeAnimations, 100);

    // Função para detectar mudanças de tema do sistema
    function detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-theme');
        }
        
        // Escutar mudanças no tema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (e.matches) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
        });
    }

    // Inicializar detecção de tema
    detectSystemTheme();

    // Função para adicionar tooltips aos botões
    function initializeTooltips() {
        const buttons = document.querySelectorAll('.action-button');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                // Adicionar tooltip se necessário
                this.style.position = 'relative';
            });
        });
    }

    // Inicializar tooltips
    initializeTooltips();

    // Log de inicialização
    console.log('Dashboard inicializado com sucesso!');
});

// Função global para compatibilidade (se necessário)
window.showSection = function(sectionName) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.add('hidden');
    });

    const selectedSection = document.getElementById(sectionName + '-section');
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
    }
};