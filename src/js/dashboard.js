// Dashboard JavaScript com efeitos 3D e animações
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    loadHeader();
    initializeTiltEffect();
    animateNumbers();
    addInteractiveEffects();
    updateRealTimeData();
}

// Carregar header dinâmico
function loadHeader() {
    fetch('/src/html/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
        })
        .catch(error => {
            console.error('Erro ao carregar header:', error);
        });
}

// Efeito 3D Tilt nos cards
function initializeTiltEffect() {
    const cards = document.querySelectorAll('[data-tilt]');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transformStyle = 'preserve-3d';
        });
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = (e.clientX - centerX) / (rect.width / 2);
            const deltaY = (e.clientY - centerY) / (rect.height / 2);
            
            const rotateX = deltaY * -10; // Máximo 10 graus
            const rotateY = deltaX * 10;
            
            card.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateZ(20px)
                scale3d(1.02, 1.02, 1.02)
            `;
            
            // Efeito de brilho seguindo o mouse
            const glowX = ((e.clientX - rect.left) / rect.width) * 100;
            const glowY = ((e.clientY - rect.top) / rect.height) * 100;
            
            card.style.background = `
                radial-gradient(
                    circle at ${glowX}% ${glowY}%,
                    rgba(255, 255, 255, 0.8) 0%,
                    rgba(255, 255, 255, 0.6) 20%,
                    rgba(255, 255, 255, 0.3) 40%,
                    transparent 70%
                ),
                linear-gradient(
                    45deg,
                    #ffffff 0%,
                    #ffffff 40%,
                    rgba(255, 255, 255, 0.9) 50%,
                    #ffffff 60%,
                    #ffffff 100%
                )
            `;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)';
            card.style.background = `
                linear-gradient(
                    45deg,
                    #ffffff 0%,
                    #ffffff 40%,
                    rgba(255, 255, 255, 0.8) 50%,
                    #ffffff 60%,
                    #ffffff 100%
                )
            `;
        });
        
        // Efeito de clique
        card.addEventListener('click', (e) => {
            createRippleEffect(e, card);
            showCardDetails(card);
        });
    });
}

// Animação dos números (contador)
function animateNumbers() {
    const numbers = document.querySelectorAll('.number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const number = entry.target;
                const targetValue = parseInt(number.getAttribute('data-value'));
                animateCounter(number, targetValue);
                observer.unobserve(number);
            }
        });
    });
    
    numbers.forEach(number => observer.observe(number));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 60; // 60 frames para 1 segundo
    const duration = 2000; // 2 segundos
    const stepTime = duration / 60;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
        
        // Efeito de pulsação durante a animação
        if (current < target) {
            element.style.transform = `scale(${1 + Math.sin(current / target * Math.PI) * 0.1})`;
        } else {
            element.style.transform = 'scale(1)';
        }
    }, stepTime);
}

// Efeitos interativos adicionais
function addInteractiveEffects() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        // Animação de entrada escalonada
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('card-enter');
        
        // Efeito hover nos ícones
        const icon = card.querySelector('.card-header i');
        if (icon) {
            icon.addEventListener('mouseenter', () => {
                icon.style.animation = 'iconBounce 0.6s ease-in-out';
            });
            
            icon.addEventListener('animationend', () => {
                icon.style.animation = '';
            });
        }
        
        // Efeito de shimmer mais intenso no hover
        card.addEventListener('mouseenter', () => {
            card.style.animationDuration = '1s';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.animationDuration = '3s';
        });
    });
}

// Efeito ripple no clique
function createRippleEffect(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%);
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 10;
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Mostrar detalhes do card (futuro modal ou expansão)
function showCardDetails(card) {
    const cardTitle = card.querySelector('.card-header h3').textContent;
    const cardValue = card.querySelector('.number').textContent;
    
    // Efeito de feedback visual
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
        card.style.transform = '';
    }, 150);
    
    console.log(`Card clicado: ${cardTitle} - Valor: ${cardValue}`);
    
    // Aqui você pode adicionar um modal ou navegação
    // showModal(cardTitle, cardValue);
}

// Atualização de dados em tempo real (simulado)
function updateRealTimeData() {
    setInterval(() => {
        const numbers = document.querySelectorAll('.number');
        numbers.forEach(number => {
            const currentValue = parseInt(number.textContent);
            const variation = Math.floor(Math.random() * 10) - 5; // -5 a +5
            const newValue = Math.max(0, currentValue + variation);
            
            if (variation !== 0) {
                number.style.color = variation > 0 ? '#27ae60' : '#e74c3c';
                setTimeout(() => {
                    number.style.color = '';
                }, 1000);
            }
            
            // Atualização suave
            animateValueChange(number, currentValue, newValue);
        });
        
        updateTrendIndicators();
    }, 30000); // Atualiza a cada 30 segundos
}

function animateValueChange(element, from, to) {
    if (from === to) return;
    
    const diff = to - from;
    const steps = 20;
    const stepValue = diff / steps;
    const stepTime = 50;
    
    let current = from;
    let step = 0;
    
    const timer = setInterval(() => {
        step++;
        current += stepValue;
        
        if (step >= steps) {
            current = to;
            clearInterval(timer);
        }
        
        element.textContent = Math.round(current);
    }, stepTime);
}

function updateTrendIndicators() {
    const trends = document.querySelectorAll('.trend');
    trends.forEach(trend => {
        const randomChange = (Math.random() * 10 - 5).toFixed(1);
        const isPositive = randomChange > 0;
        const isNegative = randomChange < 0;
        
        trend.className = 'trend ' + (isPositive ? 'positive' : isNegative ? 'negative' : 'neutral');
        trend.textContent = `${randomChange > 0 ? '+' : ''}${randomChange}%`;
    });
}

// Adicionar estilos CSS dinâmicos para animações
const style = document.createElement('style');
style.textContent = `
    .card-enter {
        animation: cardEnter 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        opacity: 0;
        transform: translateY(50px) scale(0.9);
    }
    
    @keyframes cardEnter {
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    @keyframes iconBounce {
        0%, 20%, 60%, 100% { transform: scale(1) rotate(0deg); }
        40% { transform: scale(1.2) rotate(10deg); }
        80% { transform: scale(1.1) rotate(-5deg); }
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .card {
        transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    
    .number {
        transition: all 0.3s ease;
    }
`;

document.head.appendChild(style);

// Adicionar suporte para touch em dispositivos móveis
if ('ontouchstart' in window) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('touchstart', (e) => {
            card.classList.add('touch-active');
        });
        
        card.addEventListener('touchend', (e) => {
            setTimeout(() => {
                card.classList.remove('touch-active');
            }, 150);
        });
    });
    
    // Adicionar estilo para touch
    style.textContent += `
        .card.touch-active {
            transform: scale(0.98);
            box-shadow: 
                8px 8px 16px rgba(209, 213, 219, 0.6),
                -8px -8px 16px rgba(255, 255, 255, 0.8);
        }
    `;
}