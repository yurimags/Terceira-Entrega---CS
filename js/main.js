let router;
let formValidator;

function initApp() {
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

    const elementsToAnimate = document.querySelectorAll('.project-card, .stat-card, .team-member, .method-card');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });

    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navOverlay = document.querySelector('.nav-overlay');
    
    if (navToggle && navMenu) {
        function toggleMenu() {
            const isActive = navMenu.classList.contains('active');
            
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            navOverlay?.classList.toggle('active');
            
            navToggle.setAttribute('aria-expanded', !isActive);
            
            if (!isActive) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
        
        navToggle.addEventListener('click', toggleMenu);
        
        if (navOverlay) {
            navOverlay.addEventListener('click', toggleMenu);
        }
        
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 991) {
                    toggleMenu();
                }
            });
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    }

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

    if (typeof Router !== 'undefined') {
        router = new Router();
    }

    const form = document.getElementById('registrationForm');
    if (form && typeof FormValidator !== 'undefined') {
        if (!form.hasAttribute('data-validator-initialized')) {
            formValidator = new FormValidator('registrationForm');
            form.setAttribute('data-validator-initialized', 'true');
        }
    }

    console.log('Plataforma ONG - Sistema carregado com sucesso!');
}

function checkModulesAndInit() {
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
        setTimeout(checkModulesAndInit, 50);
    }
}

checkModulesAndInit();