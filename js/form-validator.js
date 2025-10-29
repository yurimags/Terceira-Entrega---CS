/**
 * FormValidator.js - Sistema avançado de validação de formulários
 * Validação em tempo real com feedback visual consistente
 */

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) {
            console.warn(`Formulário com ID "${formId}" não encontrado`);
            return;
        }

        this.fields = {};
        this.errors = {};
        this.init();
    }

    /**
     * Inicializa o validador
     */
    init() {
        this.collectFields();
        this.attachListeners();
        this.setupCustomValidators();
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    /**
     * Coleta todos os campos do formulário
     */
    collectFields() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(field => {
            if (field.name || field.id) {
                const key = field.name || field.id;
                this.fields[key] = field;
                this.errors[key] = [];
            }
        });
    }

    /**
     * Anexa listeners de validação
     */
    attachListeners() {
        Object.values(this.fields).forEach(field => {
            // Validação em tempo real no blur
            field.addEventListener('blur', () => {
                this.validateField(field.name || field.id);
            });

            // Limpar erros ao editar
            field.addEventListener('input', () => {
                this.clearFieldError(field.name || field.id);
            });

            // Validação imediata para campos críticos
            if (field.type === 'email' || field.type === 'tel' || field.id === 'cpf') {
                field.addEventListener('input', () => {
                    this.validateField(field.name || field.id);
                });
            }
        });
    }

    /**
     * Configura validadores customizados
     */
    setupCustomValidators() {
        // Validador de CPF
        const cpfField = this.fields.cpf || this.fields.nomeCompleto; // fallback
        if (this.fields.cpf) {
            this.fields.cpf.addEventListener('blur', () => {
                this.validateCPF(this.fields.cpf);
            });
        }

        // Validador de idade mínima
        if (this.fields.dataNascimento) {
            this.fields.dataNascimento.addEventListener('change', () => {
                this.validateAge(this.fields.dataNascimento);
            });
        }

        // Validador de email
        if (this.fields.email) {
            this.fields.email.addEventListener('blur', () => {
                this.validateEmail(this.fields.email);
            });
        }

        // Validador de telefone
        if (this.fields.telefone) {
            this.fields.telefone.addEventListener('blur', () => {
                this.validatePhone(this.fields.telefone);
            });
        }
    }

    /**
     * Valida um campo específico
     * @param {string} fieldKey - Chave do campo
     * @returns {boolean} True se válido
     */
    validateField(fieldKey) {
        const field = this.fields[fieldKey];
        if (!field) return true;

        this.errors[fieldKey] = [];

        // Validação HTML5 nativa
        if (!field.validity.valid) {
            const message = this.getValidationMessage(field);
            this.addFieldError(fieldKey, message);
            return false;
        }

        // Validações customizadas específicas
        if (fieldKey === 'cpf') {
            return this.validateCPF(field);
        }
        if (fieldKey === 'dataNascimento') {
            return this.validateAge(field);
        }
        if (fieldKey === 'email') {
            return this.validateEmail(field);
        }
        if (fieldKey === 'telefone') {
            return this.validatePhone(field);
        }

        // Campo válido
        this.clearFieldError(fieldKey);
        return true;
    }

    /**
     * Valida CPF
     * @param {HTMLElement} field - Campo de CPF
     * @returns {boolean} True se válido
     */
    validateCPF(field) {
        const cpf = field.value.replace(/\D/g, '');
        
        if (cpf.length !== 11) {
            this.addFieldError('cpf', 'CPF deve conter 11 dígitos');
            return false;
        }

        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cpf)) {
            this.addFieldError('cpf', 'CPF inválido');
            return false;
        }

        // Validar dígitos verificadores
        let soma = 0;
        let resto;

        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) {
            this.addFieldError('cpf', 'CPF inválido');
            return false;
        }

        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) {
            this.addFieldError('cpf', 'CPF inválido');
            return false;
        }

        this.clearFieldError('cpf');
        return true;
    }

    /**
     * Valida idade mínima (16 anos)
     * @param {HTMLElement} field - Campo de data de nascimento
     * @returns {boolean} True se válido
     */
    validateAge(field) {
        const dataNascimento = new Date(field.value);
        const hoje = new Date();
        const idade = hoje.getFullYear() - dataNascimento.getFullYear();
        const mesAniversario = hoje.getMonth() - dataNascimento.getMonth();

        let idadeReal = idade;
        if (mesAniversario < 0 || (mesAniversario === 0 && hoje.getDate() < dataNascimento.getDate())) {
            idadeReal--;
        }

        if (idadeReal < 16) {
            this.addFieldError('dataNascimento', 'Você deve ter no mínimo 16 anos para se cadastrar');
            return false;
        }

        this.clearFieldError('dataNascimento');
        return true;
    }

    /**
     * Valida email com regex mais robusto
     * @param {HTMLElement} field - Campo de email
     * @returns {boolean} True se válido
     */
    validateEmail(field) {
        const email = field.value.trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            this.addFieldError('email', 'Por favor, insira um e-mail válido');
            return false;
        }

        this.clearFieldError('email');
        return true;
    }

    /**
     * Valida telefone
     * @param {HTMLElement} field - Campo de telefone
     * @returns {boolean} True se válido
     */
    validatePhone(field) {
        const phone = field.value.replace(/\D/g, '');

        if (phone.length < 10 || phone.length > 11) {
            this.addFieldError('telefone', 'Telefone deve conter 10 ou 11 dígitos');
            return false;
        }

        this.clearFieldError('telefone');
        return true;
    }

    /**
     * Obtém mensagem de validação do campo
     * @param {HTMLElement} field - Campo
     * @returns {string} Mensagem de erro
     */
    getValidationMessage(field) {
        if (field.validity.valueMissing) {
            return `${this.getFieldLabel(field)} é obrigatório`;
        }
        if (field.validity.typeMismatch) {
            if (field.type === 'email') {
                return 'Por favor, insira um e-mail válido';
            }
            return 'Formato inválido';
        }
        if (field.validity.tooShort) {
            return `${this.getFieldLabel(field)} é muito curto (mínimo ${field.minLength} caracteres)`;
        }
        if (field.validity.tooLong) {
            return `${this.getFieldLabel(field)} é muito longo (máximo ${field.maxLength} caracteres)`;
        }
        if (field.validity.patternMismatch) {
            return field.title || 'Formato inválido';
        }
        if (field.validity.rangeUnderflow || field.validity.rangeOverflow) {
            return 'Valor fora do intervalo permitido';
        }

        return 'Valor inválido';
    }

    /**
     * Obtém label do campo
     * @param {HTMLElement} field - Campo
     * @returns {string} Label do campo
     */
    getFieldLabel(field) {
        const label = field.closest('.form-field')?.querySelector('label');
        if (label) {
            let text = label.textContent.trim();
            // Remover asterisco e abreviações
            text = text.replace(/\s*\*.*$/, '').trim();
            return text || field.name || field.id;
        }
        return field.name || field.id || 'Campo';
    }

    /**
     * Adiciona erro a um campo
     * @param {string} fieldKey - Chave do campo
     * @param {string} message - Mensagem de erro
     */
    addFieldError(fieldKey, message) {
        const field = this.fields[fieldKey];
        if (!field) return;

        this.errors[fieldKey].push(message);

        // Adicionar classe visual
        field.classList.add('invalid');
        field.classList.remove('valid');
        field.setAttribute('aria-invalid', 'true');

        // Adicionar ou atualizar mensagem de erro
        this.showFieldError(fieldKey, message);

        // Adicionar classe ao container
        const container = field.closest('.form-field');
        if (container) {
            container.classList.add('has-error');
        }
    }

    /**
     * Remove erro de um campo
     * @param {string} fieldKey - Chave do campo
     */
    clearFieldError(fieldKey) {
        const field = this.fields[fieldKey];
        if (!field) return;

        this.errors[fieldKey] = [];

        // Remover classe visual
        field.classList.remove('invalid');
        field.classList.add('valid');
        field.setAttribute('aria-invalid', 'false');

        // Remover mensagem de erro
        this.hideFieldError(fieldKey);

        // Remover classe do container
        const container = field.closest('.form-field');
        if (container) {
            container.classList.remove('has-error');
        }
    }

    /**
     * Mostra mensagem de erro no campo
     * @param {string} fieldKey - Chave do campo
     * @param {string} message - Mensagem
     */
    showFieldError(fieldKey, message) {
        const field = this.fields[fieldKey];
        if (!field) return;

        const container = field.closest('.form-field');
        if (!container) return;

        // Remover mensagens anteriores
        this.hideFieldError(fieldKey);

        // Criar elemento de erro
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error-message';
        errorDiv.id = `${fieldKey}-error`;
        errorDiv.setAttribute('role', 'alert');
        errorDiv.textContent = message;

        // Inserir após o campo
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }

    /**
     * Esconde mensagem de erro do campo
     * @param {string} fieldKey - Chave do campo
     */
    hideFieldError(fieldKey) {
        const errorDiv = document.getElementById(`${fieldKey}-error`);
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    /**
     * Valida todo o formulário
     * @returns {boolean} True se válido
     */
    validateAll() {
        let isValid = true;

        Object.keys(this.fields).forEach(fieldKey => {
            if (!this.validateField(fieldKey)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Obtém todos os erros
     * @returns {Object} Objeto com erros por campo
     */
    getAllErrors() {
        return this.errors;
    }

    /**
     * Verifica se o formulário tem erros
     * @returns {boolean} True se tem erros
     */
    hasErrors() {
        return Object.values(this.errors).some(errors => errors.length > 0);
    }

    /**
     * Trata submit do formulário
     * @param {Event} e - Evento de submit
     */
    handleSubmit(e) {
        e.preventDefault();

        // Validar tudo
        const isValid = this.validateAll();

        if (!isValid) {
            // Mostrar mensagem geral de erro
            this.showFormError('Por favor, corrija os erros no formulário antes de enviar.');
            
            // Focar no primeiro campo inválido
            const firstInvalid = this.form.querySelector('.invalid, :invalid');
            if (firstInvalid) {
                firstInvalid.focus();
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            return false;
        }

        // Formulário válido - processar
        this.processForm();
    }

    /**
     * Processa formulário válido
     */
    processForm() {
        // Coletar dados do formulário
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        // Salvar no localStorage (opcional)
        if (typeof storage !== 'undefined') {
            storage.set('last_form_data', data);
        }

        // Mostrar mensagem de sucesso
        this.showFormSuccess('Formulário enviado com sucesso! Em breve entraremos em contato.');

        // Limpar formulário
        setTimeout(() => {
            this.form.reset();
            Object.keys(this.fields).forEach(key => this.clearFieldError(key));
            this.hideFormMessages();
        }, 3000);
    }

    /**
     * Mostra erro geral do formulário
     * @param {string} message - Mensagem
     */
    showFormError(message) {
        this.hideFormMessages();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-summary';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.textContent = message;

        this.form.insertBefore(errorDiv, this.form.firstChild);

        // Scroll para o erro
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * Mostra sucesso do formulário
     * @param {string} message - Mensagem
     */
    showFormSuccess(message) {
        this.hideFormMessages();

        const successDiv = document.createElement('div');
        successDiv.className = 'form-success-summary';
        successDiv.setAttribute('role', 'alert');
        successDiv.textContent = message;

        this.form.insertBefore(successDiv, this.form.firstChild);
    }

    /**
     * Esconde mensagens do formulário
     */
    hideFormMessages() {
        const errorSummary = this.form.querySelector('.form-error-summary');
        const successSummary = this.form.querySelector('.form-success-summary');
        if (errorSummary) errorSummary.remove();
        if (successSummary) successSummary.remove();
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}
