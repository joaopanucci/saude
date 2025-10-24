// Dashboard JavaScript com mapa SVG de MS
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

let municipalData = [];
let currentTheme = 'light';

function initializeDashboard() {
    loadHeader();
    loadMunicipalData();
    initializeCards();
    setupThemeToggle();
    loadSVGMap();
    addInteractiveEffects();
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

// Carregar e processar dados do CSV (apenas informações básicas)
async function loadMunicipalData() {
    try {
        showLoadingState('Carregando dados dos municípios...');
        
        const response = await fetch('/msmapa.csv');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        
        municipalData = [];
        
        // Processar cada linha do CSV (apenas dados básicos)
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',');
                const municipality = {
                    code: values[0], // CD_MUN
                    name: values[1], // NM_MUN
                    regionCode: values[2], // CD_RGI
                    regionName: values[3], // NM_RGI
                    state: values[7], // NM_UF
                    area: parseFloat(values[14]) || 0, // AREA_KM2
                    // Dados de saúde serão adicionados futuramente
                    totalEvaluations: 0,
                    completedEvaluations: 0,
                    pendingEvaluations: 0,
                    avgScore: 0,
                    lastUpdate: null
                };
                
                municipalData.push(municipality);
            }
        }
        
        console.log(`Carregados dados básicos de ${municipalData.length} municípios`);
        updateDashboardStats();
        hideLoadingState();
        
    } catch (error) {
        console.error('Erro ao carregar dados municipais:', error);
        showErrorState('Erro ao carregar dados dos municípios');
    }
}

// Carregar e configurar o mapa SVG
async function loadSVGMap() {
    try {
        const response = await fetch('/msmapa.svg');
        if (!response.ok) {
            throw new Error(`Erro ao carregar SVG: ${response.status}`);
        }
        
        const svgText = await response.text();
        const mapContainer = document.getElementById('svgMapContainer');
        
        if (mapContainer) {
            mapContainer.innerHTML = svgText;
            setupSVGInteractivity();
        }
        
    } catch (error) {
        console.error('Erro ao carregar mapa SVG:', error);
    }
}

// Configurar interatividade do mapa SVG
function setupSVGInteractivity() {
    const svg = document.querySelector('#svgMapContainer svg');
    if (!svg) return;
    
    // Adicionar classes CSS ao SVG
    svg.classList.add('ms-map');
    
    // Encontrar todos os elementos que representam municípios
    const municipalElements = svg.querySelectorAll('path, polygon, circle');
    
    municipalElements.forEach(element => {
        // Estilo padrão (sem dados de avaliações)
        element.style.fill = '#e2e8f0';
        element.style.opacity = '0.8';
        element.style.stroke = '#fff';
        element.style.strokeWidth = '1px';
        element.style.cursor = 'pointer';
        element.style.transition = 'all 0.3s ease';
        
        // Adicionar eventos de hover
        element.addEventListener('mouseenter', function(e) {
            this.style.opacity = '1';
            this.style.fill = '#cbd5e1';
            showMunicipalTooltip(e, this);
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.opacity = '0.8';
            this.style.fill = '#e2e8f0';
            hideMunicipalTooltip();
        });
        
        element.addEventListener('click', function() {
            showMunicipalDetails(this);
        });
    });
}

// Obter informações municipais baseado no elemento SVG
function getMunicipalInfoByElement(element) {
    // Tentar obter o nome do município do elemento
    const title = element.querySelector('title');
    const elementId = element.id;
    
    if (title) {
        const municipalName = title.textContent.trim();
        return municipalData.find(m => 
            m.name.toLowerCase().includes(municipalName.toLowerCase()) ||
            municipalName.toLowerCase().includes(m.name.toLowerCase())
        );
    }
    
    return null;
}

// Função para colorir elementos quando houver dados de avaliações (futuramente)
function colorMunicipalElement(element, municipalInfo) {
    // Por enquanto, usar cor padrão
    // Quando houver dados de avaliações, implementar lógica de cores
    if (municipalInfo && municipalInfo.totalEvaluations > 0) {
        const evaluationRatio = municipalInfo.completedEvaluations / municipalInfo.totalEvaluations;
        
        let color;
        if (evaluationRatio >= 0.8) {
            color = '#10b981'; // Verde - alto desempenho
        } else if (evaluationRatio >= 0.6) {
            color = '#f59e0b'; // Amarelo - médio desempenho
        } else {
            color = '#ef4444'; // Vermelho - baixo desempenho
        }
        
        element.style.fill = color;
        element.style.opacity = '0.7';
    } else {
        // Cor padrão para municípios sem dados
        element.style.fill = '#e2e8f0';
        element.style.opacity = '0.8';
    }
    
    element.style.stroke = '#fff';
    element.style.strokeWidth = '1px';
    element.style.cursor = 'pointer';
}

// Mostrar tooltip do município
function showMunicipalTooltip(event, element) {
    const municipalInfo = getMunicipalInfoByElement(element);
    if (!municipalInfo) return;
    
    const tooltip = document.getElementById('municipalTooltip') || createTooltip();
    
    tooltip.innerHTML = `
        <div class="tooltip-header">
            <strong>${municipalInfo.name}</strong>
        </div>
        <div class="tooltip-content">
            <div class="tooltip-row">
                <span>Código:</span>
                <strong>${municipalInfo.code}</strong>
            </div>
            <div class="tooltip-row">
                <span>Região:</span>
                <strong>${municipalInfo.regionName}</strong>
            </div>
            <div class="tooltip-row">
                <span>Área:</span>
                <strong>${municipalInfo.area.toLocaleString()} km²</strong>
            </div>
            <div class="tooltip-row">
                <span>Avaliações:</span>
                <strong>${municipalInfo.totalEvaluations || 'Nenhuma ainda'}</strong>
            </div>
        </div>
    `;
    
    tooltip.style.display = 'block';
    tooltip.style.left = event.pageX + 10 + 'px';
    tooltip.style.top = event.pageY - 10 + 'px';
}

// Esconder tooltip
function hideMunicipalTooltip() {
    const tooltip = document.getElementById('municipalTooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// Criar tooltip
function createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.id = 'municipalTooltip';
    tooltip.className = 'municipal-tooltip';
    document.body.appendChild(tooltip);
    return tooltip;
}

// Mostrar detalhes do município em modal
function showMunicipalDetails(element) {
    const municipalInfo = getMunicipalInfoByElement(element);
    if (!municipalInfo) return;
    
    const modal = document.getElementById('municipalModal') || createModal();
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2><i class='bx bx-map-pin'></i> ${municipalInfo.name}</h2>
            <button class="close-modal" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="municipal-details">
                <h3>Informações do Município</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Código Municipal:</label>
                        <span>${municipalInfo.code}</span>
                    </div>
                    <div class="detail-item">
                        <label>Região:</label>
                        <span>${municipalInfo.regionName}</span>
                    </div>
                    <div class="detail-item">
                        <label>Estado:</label>
                        <span>${municipalInfo.state}</span>
                    </div>
                    <div class="detail-item">
                        <label>Área:</label>
                        <span>${municipalInfo.area.toLocaleString()} km²</span>
                    </div>
                </div>
                
                <div class="evaluation-status">
                    <h4>Status das Avaliações</h4>
                    <div class="status-message">
                        <i class='bx bx-info-circle'></i>
                        <p>Este município ainda não possui avaliações registradas. Os dados de saúde serão exibidos aqui conforme as avaliações forem sendo realizadas.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Criar modal
function createModal() {
    const modal = document.createElement('div');
    modal.id = 'municipalModal';
    modal.className = 'modal';
    modal.innerHTML = '<div class="modal-content"></div>';
    document.body.appendChild(modal);
    
    // Fechar modal ao clicar fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    return modal;
}

// Fechar modal
function closeModal() {
    const modal = document.getElementById('municipalModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Atualizar estatísticas do dashboard (apenas dados básicos)
function updateDashboardStats() {
    const totalMunicipalities = municipalData.length;
    const totalEvaluations = 0; // Será atualizado quando houver dados reais
    const totalCompleted = 0;
    const totalPending = 0;
    const avgScore = 0;
    const totalArea = municipalData.reduce((sum, m) => sum + m.area, 0);
    const highPerformance = 0; // Será calculado quando houver avaliações
    const mediumPerformance = 0;
    
    // Atualizar cards com animação
    setTimeout(() => {
        animateCounter('.card-1 .number', totalEvaluations);
        animateCounter('.card-2 .number', totalCompleted);
        animateCounter('.card-3 .number', totalPending);
        animateCounter('.card-4 .number', totalMunicipalities);
        animateCounter('.card-5 .number', Math.round(totalArea));
        animateCounter('.card-6 .number', highPerformance);
        animateCounter('.card-7 .number', mediumPerformance);
        
        // Atualizar nota média
        const avgElement = document.querySelector('.card-8 .number');
        if (avgElement) {
            avgElement.textContent = avgScore || '0';
        }
        
        // Atualizar resumo no mapa
        updateMapSummary(totalMunicipalities, totalArea, totalEvaluations);
    }, 500);
}

// Atualizar resumo do mapa
function updateMapSummary(totalMunicipalities, totalArea, totalEvaluations) {
    const totalMunicipalitiesEl = document.getElementById('totalMunicipalities');
    const totalAreaEl = document.getElementById('totalArea');
    const totalEvaluationsMapEl = document.getElementById('totalEvaluationsMap');
    
    if (totalMunicipalitiesEl) {
        animateCounter('#totalMunicipalities', totalMunicipalities);
    }
    if (totalAreaEl) {
        animateCounter('#totalArea', Math.round(totalArea));
    }
    if (totalEvaluationsMapEl) {
        animateCounter('#totalEvaluationsMap', totalEvaluations);
    }
}

// Inicializar cards do dashboard
function initializeCards() {
    const cards = document.querySelectorAll('.parent > div');
    
    cards.forEach((card, index) => {
        card.className = `card card-${index + 1}`;
        card.innerHTML = getCardContent(index + 1);
        
        // Adicionar efeito hover
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Obter conteúdo do card baseado no índice
function getCardContent(cardNumber) {
    const cardConfigs = {
        1: { icon: 'bx-health', title: 'Total de Avaliações', number: '0', trend: '+12%' },
        2: { icon: 'bx-check-circle', title: 'Concluídas', number: '0', trend: '+8%' },
        3: { icon: 'bx-time', title: 'Pendentes', number: '0', trend: '-5%' },
        4: { icon: 'bx-buildings', title: 'Municípios', number: '0', trend: '100%' },
        5: { icon: 'bx-area', title: 'Área Total (km²)', number: '0', trend: '0%' },
        6: { icon: 'bx-trending-up', title: 'Alto Desempenho', number: '0', trend: '+15%' },
        7: { icon: 'bx-bar-chart', title: 'Médio Desempenho', number: '0', trend: '+3%' },
        8: { icon: 'bx-star', title: 'Nota Média', number: '0', trend: '+0.2' }
    };
    
    const config = cardConfigs[cardNumber];
    
    return `
        <div class="card-header">
            <div class="card-icon">
                <i class='bx ${config.icon}'></i>
            </div>
            <div class="card-title">${config.title}</div>
        </div>
        <div class="card-content">
            <div class="number">${config.number}</div>
            <div class="trend ${config.trend.startsWith('+') ? 'positive' : config.trend.startsWith('-') ? 'negative' : 'neutral'}">
                ${config.trend}
            </div>
        </div>
    `;
}

// Animar contador
function animateCounter(selector, finalValue) {
    const element = document.querySelector(selector);
    if (!element) return;
    
    const startValue = 0;
    const duration = 2000;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (finalValue - startValue) * easeOutCubic);
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Estados de carregamento
function showLoadingState(message) {
    const existingLoader = document.getElementById('dashboardLoader');
    if (existingLoader) return;
    
    const loader = document.createElement('div');
    loader.id = 'dashboardLoader';
    loader.className = 'dashboard-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <div class="loader-text">${message}</div>
        </div>
    `;
    document.body.appendChild(loader);
}

function hideLoadingState() {
    const loader = document.getElementById('dashboardLoader');
    if (loader) {
        loader.remove();
    }
}

function showErrorState(message) {
    hideLoadingState();
    console.error(message);
    // Aqui você poderia mostrar um toast ou notificação de erro
}

// Configurar alternância de tema
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('dashboard-theme', currentTheme);
}

// Efeitos interativos adicionais
function addInteractiveEffects() {
    // Efeito de ondulação nos botões
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('card')) {
            createRippleEffect(e);
        }
    });
}

function createRippleEffect(e) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = e.target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    e.target.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Busca de municípios
function searchMunicipality(query) {
    if (!query.trim()) return [];
    
    return municipalData.filter(m => 
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.regionName.toLowerCase().includes(query.toLowerCase())
    );
}

// Exportar dados para CSV
function exportData() {
    const csvContent = [
        ['Município', 'Código', 'Região', 'Total Avaliações', 'Concluídas', 'Pendentes', 'Nota Média', 'Área (km²)'],
        ...municipalData.map(m => [
            m.name,
            m.code,
            m.regionName,
            m.totalEvaluations,
            m.completedEvaluations,
            m.pendingEvaluations,
            m.avgScore,
            m.area
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'municipios_ms_saude.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Inicializar tema salvo
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('dashboard-theme') || 'light';
    currentTheme = savedTheme;
    document.body.setAttribute('data-theme', currentTheme);
    
    // Configurar busca de municípios
    setupMunicipalSearch();
});

// Configurar funcionalidade de busca
function setupMunicipalSearch() {
    const searchInput = document.getElementById('municipalSearch');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = this.value.trim();
            if (query.length >= 2) {
                performMunicipalSearch(query);
            } else {
                clearSearchHighlight();
            }
        }, 300);
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = this.value.trim();
            if (query.length >= 2) {
                performMunicipalSearch(query);
            }
        }
    });
}

// Realizar busca de municípios
function performMunicipalSearch(query) {
    const results = searchMunicipality(query);
    
    if (results.length > 0) {
        highlightSearchResults(results);
        showSearchSummary(results, query);
    } else {
        showNoResultsMessage(query);
    }
}

// Destacar resultados da busca no mapa
function highlightSearchResults(results) {
    clearSearchHighlight();
    
    const svg = document.querySelector('#svgMapContainer svg');
    if (!svg) return;
    
    results.forEach(municipality => {
        const elements = svg.querySelectorAll('path, polygon, circle');
        elements.forEach(element => {
            const municipalInfo = getMunicipalInfoByElement(element);
            if (municipalInfo && municipalInfo.name === municipality.name) {
                element.style.stroke = '#FF6B35';
                element.style.strokeWidth = '3px';
                element.style.filter = 'brightness(1.2)';
                element.classList.add('search-highlight');
            }
        });
    });
}

// Limpar destaque da busca
function clearSearchHighlight() {
    const svg = document.querySelector('#svgMapContainer svg');
    if (!svg) return;
    
    const highlightedElements = svg.querySelectorAll('.search-highlight');
    highlightedElements.forEach(element => {
        element.style.stroke = '#fff';
        element.style.strokeWidth = '1px';
        element.style.filter = 'none';
        element.classList.remove('search-highlight');
    });
    
    hideSearchSummary();
}

// Mostrar resumo da busca
function showSearchSummary(results, query) {
    let summaryDiv = document.getElementById('searchSummary');
    if (!summaryDiv) {
        summaryDiv = document.createElement('div');
        summaryDiv.id = 'searchSummary';
        summaryDiv.className = 'search-summary';
        document.querySelector('.map-controls').appendChild(summaryDiv);
    }
    
    const totalEvaluations = results.reduce((sum, m) => sum + (m.totalEvaluations || 0), 0);
    
    summaryDiv.innerHTML = `
        <div class="search-results">
            <h4>🔍 Resultados para "${query}"</h4>
            <p>${results.length} município(s) encontrado(s)</p>
            <p>Total de avaliações: ${totalEvaluations.toLocaleString()}</p>
            <button onclick="clearSearchHighlight()" class="clear-search">Limpar busca</button>
        </div>
    `;
    
    summaryDiv.style.display = 'block';
}

// Esconder resumo da busca
function hideSearchSummary() {
    const summaryDiv = document.getElementById('searchSummary');
    if (summaryDiv) {
        summaryDiv.style.display = 'none';
    }
}

// Mostrar mensagem de nenhum resultado
function showNoResultsMessage(query) {
    let summaryDiv = document.getElementById('searchSummary');
    if (!summaryDiv) {
        summaryDiv = document.createElement('div');
        summaryDiv.id = 'searchSummary';
        summaryDiv.className = 'search-summary';
        document.querySelector('.map-controls').appendChild(summaryDiv);
    }
    
    summaryDiv.innerHTML = `
        <div class="search-results no-results">
            <h4>🔍 Nenhum resultado para "${query}"</h4>
            <p>Tente buscar por:</p>
            <ul>
                <li>Nome completo do município</li>
                <li>Parte do nome (ex: "Campo" para Campo Grande)</li>
                <li>Nome da região</li>
            </ul>
        </div>
    `;
    
    summaryDiv.style.display = 'block';
}
