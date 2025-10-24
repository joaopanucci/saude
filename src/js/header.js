document.addEventListener('DOMContentLoaded', function() {
    const headerElement = document.getElementById('header');
    
    if (headerElement) {
        fetch('/src/html/header.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar header');
                }
                return response.text();
            })
            .then(html => {
                headerElement.innerHTML = html;
            })
            .catch(error => {
                console.error('Erro ao carregar o header:', error);
                // Fallback caso o arquivo não carregue
                headerElement.innerHTML = `
                    <header class="header-site">
                        <nav class="navbar">
                            <div class="logo">
                                <a href="inicio.html">SaúdeMS+</a>
                            </div>
                            <ul class="nav-link">
                                <li><a href="inicio.html">Início</a></li>
                                <li><a href="avaliacao.html">Avaliações</a></li>
                                <li><a href="usuario.html">Usuário</a></li>
                                <li><a href="dashboard.html">Painel</a></li>
                            </ul>
                        </nav>
                    </header>
                `;
            });
    }
});