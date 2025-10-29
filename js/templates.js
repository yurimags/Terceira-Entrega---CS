/**
 * Templates.js - Sistema de templates JavaScript
 * Permite criar e renderizar templates reutilizáveis
 */

class TemplateEngine {
    constructor() {
        this.templates = {};
        this.cache = new Map();
    }

    /**
     * Registra um template
     * @param {string} name - Nome do template
     * @param {string|Function} template - Template (string ou função)
     */
    register(name, template) {
        this.templates[name] = template;
    }

    /**
     * Renderiza um template com dados
     * @param {string} name - Nome do template
     * @param {Object} data - Dados para preencher o template
     * @returns {string} HTML renderizado
     */
    render(name, data = {}) {
        const template = this.templates[name];
        
        if (!template) {
            console.warn(`Template "${name}" não encontrado`);
            return '';
        }

        // Verificar cache
        const cacheKey = `${name}-${JSON.stringify(data)}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        let result;

        if (typeof template === 'function') {
            // Template como função
            result = template(data);
        } else {
            // Template como string (substituição simples)
            result = this.replacePlaceholders(template, data);
        }

        // Cachear resultado
        this.cache.set(cacheKey, result);
        return result;
    }

    /**
     * Substitui placeholders no template
     * @param {string} template - Template string
     * @param {Object} data - Dados
     * @returns {string} Template renderizado
     */
    replacePlaceholders(template, data) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : match;
        });
    }

    /**
     * Cria um elemento DOM a partir de um template
     * @param {string} name - Nome do template
     * @param {Object} data - Dados
     * @returns {HTMLElement} Elemento DOM criado
     */
    createElement(name, data = {}) {
        const html = this.render(name, data);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Retornar o primeiro elemento filho do body
        const fragment = doc.body.firstElementChild;
        return fragment;
    }

    /**
     * Limpa o cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Instância global do Template Engine
const templateEngine = new TemplateEngine();

// Templates pré-definidos

// Template para card de projeto
templateEngine.register('projectCard', (data) => {
    return `
        <article class="project-card" id="${data.id || ''}">
            <img src="${data.image || ''}" alt="${data.alt || ''}" width="400" height="250">
            <div class="project-content">
                <h3>${data.title || ''}</h3>
                <p class="project-description">${data.description || ''}</p>
                <div class="project-stats">
                    ${data.stats ? data.stats.map(stat => `<p><strong>${stat.label}:</strong> ${stat.value}</p>`).join('') : ''}
                </div>
            </div>
        </article>
    `;
});

// Template para card de estatística
templateEngine.register('statCard', (data) => {
    return `
        <article class="stat-card">
            <h3>${data.value || ''}</h3>
            <p>${data.label || ''}</p>
        </article>
    `;
});

// Template para card de membro da equipe
templateEngine.register('teamMember', (data) => {
    return `
        <article class="team-member">
            <img src="${data.image || ''}" alt="${data.alt || ''}" width="300" height="300">
            <h3>${data.name || ''}</h3>
            <p>${data.description || ''}</p>
        </article>
    `;
});

// Template para mensagem de toast/notificação
templateEngine.register('toast', (data) => {
    const type = data.type || 'info';
    const icon = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    }[type] || 'ℹ';

    return `
        <div class="toast toast-${type}" role="alert">
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${data.message || ''}</span>
            <button class="toast-close" aria-label="Fechar">×</button>
        </div>
    `;
});

// Template para mensagem de erro de formulário
templateEngine.register('formError', (data) => {
    return `
        <div class="form-error-message" role="alert">
            <span class="error-icon">✕</span>
            <span class="error-text">${data.message || ''}</span>
        </div>
    `;
});

// Template para mensagem de sucesso de formulário
templateEngine.register('formSuccess', (data) => {
    return `
        <div class="form-success-message" role="alert">
            <span class="success-icon">✓</span>
            <span class="success-text">${data.message || ''}</span>
        </div>
    `;
});

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TemplateEngine, templateEngine };
}
