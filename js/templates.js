class TemplateEngine {
    constructor() {
        this.templates = {};
        this.cache = new Map();
    }

    register(name, template) {
        this.templates[name] = template;
    }

    render(name, data = {}) {
        const template = this.templates[name];
        
        if (!template) {
            console.warn(`Template "${name}" não encontrado`);
            return '';
        }

        const cacheKey = `${name}-${JSON.stringify(data)}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        let result;

        if (typeof template === 'function') {
            result = template(data);
        } else {
            result = this.replacePlaceholders(template, data);
        }

        this.cache.set(cacheKey, result);
        return result;
    }

    replacePlaceholders(template, data) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : match;
        });
    }

    createElement(name, data = {}) {
        const html = this.render(name, data);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const fragment = doc.body.firstElementChild;
        return fragment;
    }

    clearCache() {
        this.cache.clear();
    }
}

const templateEngine = new TemplateEngine();

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

templateEngine.register('statCard', (data) => {
    return `
        <article class="stat-card">
            <h3>${data.value || ''}</h3>
            <p>${data.label || ''}</p>
        </article>
    `;
});

templateEngine.register('teamMember', (data) => {
    return `
        <article class="team-member">
            <img src="${data.image || ''}" alt="${data.alt || ''}" width="300" height="300">
            <h3>${data.name || ''}</h3>
            <p>${data.description || ''}</p>
        </article>
    `;
});

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

templateEngine.register('formError', (data) => {
    return `
        <div class="form-error-message" role="alert">
            <span class="error-icon">✕</span>
            <span class="error-text">${data.message || ''}</span>
        </div>
    `;
});

templateEngine.register('formSuccess', (data) => {
    return `
        <div class="form-success-message" role="alert">
            <span class="success-icon">✓</span>
            <span class="success-text">${data.message || ''}</span>
        </div>
    `;
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TemplateEngine, templateEngine };
}