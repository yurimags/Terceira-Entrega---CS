/**
 * Router.js - Sistema de SPA (Single Page Application) básico
 * Gerencia a navegação sem recarregar a página
 */

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.container = document.querySelector('main') || document.body;
        this.init();
    }

    /**
     * Inicializa o router
     */
    init() {
        // Registrar rotas
        this.registerRoute('/', () => this.loadPage('index.html'));
        this.registerRoute('/index.html', () => this.loadPage('index.html'));
        this.registerRoute('/projetos', () => this.loadPage('projetos.html'));
        this.registerRoute('/projetos.html', () => this.loadPage('projetos.html'));
        this.registerRoute('/cadastro', () => this.loadPage('cadastro.html'));
        this.registerRoute('/cadastro.html', () => this.loadPage('cadastro.html'));

        // Interceptar cliques em links
        this.interceptLinks();

        // Carregar rota inicial
        this.handleRoute();
    }

    /**
     * Registra uma rota
     * @param {string} path - Caminho da rota
     * @param {Function} handler - Função que trata a rota
     */
    registerRoute(path, handler) {
        this.routes[path] = handler;
    }

    /**
     * Intercepta cliques em links para usar SPA
     */
    interceptLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            
            // Apenas interceptar links internos
            if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                const route = this.extractRoute(href);
                
                // Verificar se a rota existe
                if (this.routes[route] || route.startsWith('/') || route.includes('.html')) {
                    e.preventDefault();
                    this.navigate(route);
                }
            }
        });

        // Tratar navegação do browser (botões voltar/avançar)
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
    }

    /**
     * Extrai a rota de um href
     * @param {string} href - Href do link
     * @returns {string} Rota extraída
     */
    extractRoute(href) {
        if (href.startsWith('#')) {
            return window.location.pathname;
        }
        
        try {
            const url = new URL(href, window.location.origin);
            return url.pathname;
        } catch {
            return href;
        }
    }

    /**
     * Navega para uma rota
     * @param {string} route - Rota para navegar
     */
    navigate(route) {
        if (route.includes('#')) {
            // Tratar âncoras (hash)
            const [path, hash] = route.split('#');
            if (path && path !== window.location.pathname) {
                this.handleRouteChange(path);
            }
            
            // Scroll para o elemento
            setTimeout(() => {
                const element = document.querySelector(`#${hash}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
            return;
        }

        this.handleRouteChange(route);
        
        // Atualizar URL sem recarregar
        const newUrl = route.startsWith('/') ? route : '/' + route;
        window.history.pushState({ route: newUrl }, '', newUrl);
    }

    /**
     * Trata mudança de rota
     * @param {string} route - Nova rota
     */
    handleRouteChange(route) {
        const normalizedRoute = route === '/' || route === '/index.html' ? '/' : route;
        
        if (this.routes[normalizedRoute]) {
            this.currentRoute = normalizedRoute;
            this.routes[normalizedRoute]();
        } else {
            // Tentar carregar página diretamente
            this.loadPage(route.replace(/^\//, ''));
        }
    }

    /**
     * Trata a rota atual
     */
    handleRoute() {
        const path = window.location.pathname;
        const normalizedPath = path === '/' || path === '/index.html' ? '/' : path;
        
        if (this.routes[normalizedPath]) {
            this.currentRoute = normalizedPath;
            this.routes[normalizedPath]();
        } else {
            // Fallback: carregar página atual normalmente
            this.loadPage(path.replace(/^\//, '') || 'index.html');
        }
    }

    /**
     * Carrega uma página via fetch
     * @param {string} page - Nome do arquivo HTML
     */
    async loadPage(page) {
        // Verificar se a página já está carregada
        const currentPath = window.location.pathname;
        const pagePath = page === 'index.html' ? '/' : '/' + page;
        
        if (currentPath === pagePath || (page === 'index.html' && currentPath === '/')) {
            // Página já está carregada, apenas executar scripts se necessário
            this.executePageScripts(page);
            return;
        }

        try {
            // Mostrar loading
            this.showLoading();

            // Fetch do conteúdo da página
            const response = await fetch(page);
            if (!response.ok) {
                throw new Error(`Erro ao carregar página: ${response.status}`);
            }

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Extrair apenas o conteúdo do main
            const newMain = doc.querySelector('main');
            const currentMain = document.querySelector('main');

            if (newMain && currentMain) {
                // Fade out
                currentMain.style.opacity = '0';
                currentMain.style.transition = 'opacity 0.3s ease';

                setTimeout(() => {
                    // Substituir conteúdo
                    currentMain.innerHTML = newMain.innerHTML;
                    
                    // Fade in
                    currentMain.style.opacity = '1';

                    // Atualizar título da página
                    const newTitle = doc.querySelector('title');
                    if (newTitle) {
                        document.title = newTitle.textContent;
                    }

                    // Executar scripts necessários
                    this.executePageScripts(page);

                    // Atualizar estado do menu de navegação
                    this.updateNavigation(page);

                    // Scroll para o topo
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 300);
            }

        } catch (error) {
            console.error('Erro ao carregar página:', error);
            this.showError('Erro ao carregar a página. Por favor, tente novamente.');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Executa scripts específicos para cada página
     * @param {string} page - Nome da página
     */
    executePageScripts(page) {
        // Recarregar máscaras se necessário
        if (page.includes('cadastro')) {
            // Disparar evento para reinicializar máscaras
            document.dispatchEvent(new CustomEvent('pageLoaded', { detail: { page } }));
        }

        // Recarregar validações de formulário
        const form = document.getElementById('registrationForm');
        if (form) {
            // Remover inicialização anterior do FormValidator
            form.removeAttribute('data-validator-initialized');
            
            // Reinicializar FormValidator
            if (typeof FormValidator !== 'undefined') {
                setTimeout(() => {
                    formValidator = new FormValidator('registrationForm');
                }, 100);
            }
            
            // Disparar evento para outros sistemas
            document.dispatchEvent(new CustomEvent('formReady', { detail: { form } }));
        }
        
        // Reinicializar máscaras
        if (typeof initMasks === 'function') {
            setTimeout(initMasks, 100);
        }
    }

    /**
     * Atualiza estado da navegação (ativa link atual)
     * @param {string} page - Página atual
     */
    updateNavigation(page) {
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.removeAttribute('aria-current');
            
            const href = link.getAttribute('href');
            if (href && (href.includes(page) || (page === 'index.html' && href.includes('index.html')))) {
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    /**
     * Mostra indicador de loading
     */
    showLoading() {
        let loader = document.querySelector('.page-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.className = 'page-loader';
            loader.innerHTML = '<div class="loader-spinner"></div>';
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
    }

    /**
     * Esconde indicador de loading
     */
    hideLoading() {
        const loader = document.querySelector('.page-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    /**
     * Mostra mensagem de erro
     * @param {string} message - Mensagem de erro
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.container.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Exportar Router
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Router;
}
