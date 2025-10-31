class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.container = document.querySelector('main') || document.body;
        this.init();
    }

    init() {
        this.registerRoute('/', () => this.loadPage('index.html'));
        this.registerRoute('/index.html', () => this.loadPage('index.html'));
        this.registerRoute('/projetos', () => this.loadPage('projetos.html'));
        this.registerRoute('/projetos.html', () => this.loadPage('projetos.html'));
        this.registerRoute('/cadastro', () => this.loadPage('cadastro.html'));
        this.registerRoute('/cadastro.html', () => this.loadPage('cadastro.html'));

        this.interceptLinks();

        this.handleRoute();
    }

    registerRoute(path, handler) {
        this.routes[path] = handler;
    }

    interceptLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            
            if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                const route = this.extractRoute(href);
                
                if (this.routes[route] || route.startsWith('/') || route.includes('.html')) {
                    e.preventDefault();
                    this.navigate(route);
                }
            }
        });

        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
    }

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

    navigate(route) {
        if (route.includes('#')) {
            const [path, hash] = route.split('#');
            if (path && path !== window.location.pathname) {
                this.handleRouteChange(path);
            }
            
            setTimeout(() => {
                const element = document.querySelector(`#${hash}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
            return;
        }

        this.handleRouteChange(route);
        
        const newUrl = route.startsWith('/') ? route : '/' + route;
        window.history.pushState({ route: newUrl }, '', newUrl);
    }

    handleRouteChange(route) {
        const normalizedRoute = route === '/' || route === '/index.html' ? '/' : route;
        
        if (this.routes[normalizedRoute]) {
            this.currentRoute = normalizedRoute;
            this.routes[normalizedRoute]();
        } else {
            this.loadPage(route.replace(/^\//, ''));
        }
    }

    handleRoute() {
        const path = window.location.pathname;
        const normalizedPath = path === '/' || path === '/index.html' ? '/' : path;
        
        if (this.routes[normalizedPath]) {
            this.currentRoute = normalizedPath;
            this.routes[normalizedPath]();
        } else {
            this.loadPage(path.replace(/^\//, '') || 'index.html');
        }
    }

    async loadPage(page) {
        const currentPath = window.location.pathname;
        const pagePath = page === 'index.html' ? '/' : '/' + page;
        
        if (currentPath === pagePath || (page === 'index.html' && currentPath === '/')) {
            this.executePageScripts(page);
            return;
        }

        try {
            this.showLoading();

            const response = await fetch(page);
            if (!response.ok) {
                throw new Error(`Erro ao carregar página: ${response.status}`);
            }

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const newMain = doc.querySelector('main');
            const currentMain = document.querySelector('main');

            if (newMain && currentMain) {
                currentMain.style.opacity = '0';
                currentMain.style.transition = 'opacity 0.3s ease';

                setTimeout(() => {
                    currentMain.innerHTML = newMain.innerHTML;
                    
                    currentMain.style.opacity = '1';

                    const newTitle = doc.querySelector('title');
                    if (newTitle) {
                        document.title = newTitle.textContent;
                    }

                    this.executePageScripts(page);

                    this.updateNavigation(page);

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

    executePageScripts(page) {
        if (page.includes('cadastro')) {
            document.dispatchEvent(new CustomEvent('pageLoaded', { detail: { page } }));
        }

        const form = document.getElementById('registrationForm');
        if (form) {
            form.removeAttribute('data-validator-initialized');
            
            if (typeof FormValidator !== 'undefined') {
                setTimeout(() => {
                    formValidator = new FormValidator('registrationForm');
                }, 100);
            }
            
            document.dispatchEvent(new CustomEvent('formReady', { detail: { form } }));
        }
        
        if (typeof initMasks === 'function') {
            setTimeout(initMasks, 100);
        }
    }

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

    hideLoading() {
        const loader = document.querySelector('.page-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Router;
}