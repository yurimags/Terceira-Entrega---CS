/**
 * Script principal da plataforma
 * Funcionalidades gerais e melhorias de UX
 * Integra módulos: Router, Templates, Storage, FormValidator
 */

// Inicialização principal da aplicação
let router;
let formValidator;

function initApp() {
    // Smooth scroll para links internos
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Adicionar classe para animações suaves
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observar elementos para animação
    const elementsToAnimate = document.querySelectorAll('.project-card, .stat-card, .team-member, .method-card');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });

    // Menu Hamburguer Mobile
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navOverlay = document.querySelector('.nav-overlay');
    
    if (navToggle && navMenu) {
        function toggleMenu() {
            const isActive = navMenu.classList.contains('active');
            
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            navOverlay?.classList.toggle('active');
            
            // Atualizar aria-expanded
            navToggle.setAttribute('aria-expanded', !isActive);
            
            // Prevenir scroll do body quando menu está aberto
            if (!isActive) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
        
        navToggle.addEventListener('click', toggleMenu);
        
        // Fechar menu ao clicar no overlay
        if (navOverlay) {
            navOverlay.addEventListener('click', toggleMenu);
        }
        
        // Fechar menu ao clicar em um link (mobile)
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 991) {
                    toggleMenu();
                }
            });
        });
        
        // Fechar menu ao pressionar ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    }

    // Validação em tempo real para melhor UX
    const formInputs = document.querySelectorAll('input[required], select[required]');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.validity.valid) {
                this.classList.remove('invalid');
                this.classList.add('valid');
            } else {
                this.classList.remove('valid');
                this.classList.add('invalid');
            }
        });
    });

    // Inicializar Router (SPA)
    if (typeof Router !== 'undefined') {
        router = new Router();
    }

    // Inicializar FormValidator se formulário existir
    // O FormValidator substitui a validação padrão, mas mantemos compatibilidade
    const form = document.getElementById('registrationForm');
    if (form && typeof FormValidator !== 'undefined') {
        // Evitar múltiplas inicializações
        if (!form.hasAttribute('data-validator-initialized')) {
            formValidator = new FormValidator('registrationForm');
            form.setAttribute('data-validator-initialized', 'true');
        }
    }

    console.log('Plataforma ONG - Sistema carregado com sucesso!');
}

// Aguardar DOM e módulos estarem prontos
function checkModulesAndInit() {
    // Verificar se todos os módulos necessários estão carregados
    const requiredModules = ['Router', 'templateEngine', 'storage'];
    const allLoaded = requiredModules.every(module => {
        if (module === 'templateEngine') {
            return typeof templateEngine !== 'undefined';
        }
        if (module === 'storage') {
            return typeof storage !== 'undefined';
        }
        return typeof window[module] !== 'undefined';
    });

    if (allLoaded || document.readyState === 'complete') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initApp);
        } else {
            initApp();
        }
    } else {
        // Aguardar um pouco e tentar novamente
        setTimeout(checkModulesAndInit, 50);
    }
}

// Iniciar verificação
checkModulesAndInit();

