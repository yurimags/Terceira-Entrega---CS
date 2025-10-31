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

    init() {
        this.collectFields();
        this.attachListeners();
        this.setupCustomValidators();
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

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

    attachListeners() {
        Object.values(this.fields).forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field.name || field.id);
            });

            field.addEventListener('input', () => {
                this.clearFieldError(field.name || field.id);
            });

            if (field.type === 'email' || field.type === 'tel' || field.id === 'cpf') {
                field.addEventListener('input', () => {
                    this.validateField(field.name || field.id);
                });
            }
        });
    }

    setupCustomValidators() {
        const cpfField = this.fields.cpf || this.fields.nomeCompleto;
        if (this.fields.cpf) {
            this.fields.cpf.addEventListener('blur', () => {
                this.validateCPF(this.fields.cpf);
            });
        }

        if (this.fields.dataNascimento) {
            this.fields.dataNascimento.addEventListener('change', () => {
                this.validateAge(this.fields.dataNascimento);
            });
        }

        if (this.fields.email) {
            this.fields.email.addEventListener('blur', () => {
                this.validateEmail(this.fields.email);
            });
        }

        if (this.fields.telefone) {
            this.fields.telefone.addEventListener('blur', () => {
                this.validatePhone(this.fields.telefone);
            });
        }
    }

    validateField(fieldKey) {
        const field = this.fields[fieldKey];
        if (!field) return true;

        this.errors[fieldKey] = [];

        if (!field.validity.valid) {
            const message = this.getValidationMessage(field);
            this.addFieldError(fieldKey, message);
            return false;
        }

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

        this.clearFieldError(fieldKey);
        return true;
    }

    validateCPF(field) {
        const cpf = field.value.replace(/\D/g, '');
        
        if (cpf.length !== 11) {
            this.addFieldError('cpf', 'CPF deve conter 11 dígitos');
            return false;
        }

        if (/^(\d)\1{10}$/.test(cpf)) {
            this.addFieldError('cpf', 'CPF inválido');
            return false;
        }

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

    validatePhone(field) {
        const phone = field.value.replace(/\D/g, '');

        if (phone.length < 10 || phone.length > 11) {
            this.addFieldError('telefone', 'Telefone deve conter 10 ou 11 dígitos');
            return false;
        }

        this.clearFieldError('telefone');
        return true;
    }

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

    getFieldLabel(field) {
        const label = field.closest('.form-field')?.querySelector('label');
        if (label) {
            let text = label.textContent.trim();
            text = text.replace(/\s*\*.*$/, '').trim();
            return text || field.name || field.id;
        }
        return field.name || field.id || 'Campo';
    }

    addFieldError(fieldKey, message) {
        const field = this.fields[fieldKey];
        if (!field) return;

        this.errors[fieldKey].push(message);

        field.classList.add('invalid');
        field.classList.remove('valid');
        field.setAttribute('aria-invalid', 'true');

        this.showFieldError(fieldKey, message);

        const container = field.closest('.form-field');
        if (container) {
            container.classList.add('has-error');
        }
    }

    clearFieldError(fieldKey) {
        const field = this.fields[fieldKey];
        if (!field) return;

        this.errors[fieldKey] = [];

        field.classList.remove('invalid');
        field.classList.add('valid');
        field.setAttribute('aria-invalid', 'false');

        this.hideFieldError(fieldKey);

        const container = field.closest('.form-field');
        if (container) {
            container.classList.remove('has-error');
        }
    }

    showFieldError(fieldKey, message) {
        const field = this.fields[fieldKey];
        if (!field) return;

        const container = field.closest('.form-field');
        if (!container) return;

        this.hideFieldError(fieldKey);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error-message';
        errorDiv.id = `${fieldKey}-error`;
        errorDiv.setAttribute('role', 'alert');
        errorDiv.textContent = message;

        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }

    hideFieldError(fieldKey) {
        const errorDiv = document.getElementById(`${fieldKey}-error`);
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    validateAll() {
        let isValid = true;

        Object.keys(this.fields).forEach(fieldKey => {
            if (!this.validateField(fieldKey)) {
                isValid = false;
            }
        });

        return isValid;
    }

    getAllErrors() {
        return this.errors;
    }

    hasErrors() {
        return Object.values(this.errors).some(errors => errors.length > 0);
    }

    handleSubmit(e) {
        e.preventDefault();

        const isValid = this.validateAll();

        if (!isValid) {
            this.showFormError('Por favor, corrija os erros no formulário antes de enviar.');
            
            const firstInvalid = this.form.querySelector('.invalid, :invalid');
            if (firstInvalid) {
                firstInvalid.focus();
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            return false;
        }

        this.processForm();
    }

    processForm() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        if (typeof storage !== 'undefined') {
            storage.set('last_form_data', data);
        }

        this.showFormSuccess('Formulário enviado com sucesso! Em breve entraremos em contato.');

        setTimeout(() => {
            this.form.reset();
            Object.keys(this.fields).forEach(key => this.clearFieldError(key));
            this.hideFormMessages();
        }, 3000);
    }

    showFormError(message) {
        this.hideFormMessages();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-summary';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.textContent = message;

        this.form.insertBefore(errorDiv, this.form.firstChild);

        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    showFormSuccess(message) {
        this.hideFormMessages();

        const successDiv = document.createElement('div');
        successDiv.className = 'form-success-summary';
        successDiv.setAttribute('role', 'alert');
        successDiv.textContent = message;

        this.form.insertBefore(successDiv, this.form.firstChild);
    }

    hideFormMessages() {
        const errorSummary = this.form.querySelector('.form-error-summary');
        const successSummary = this.form.querySelector('.form-success-summary');
        if (errorSummary) errorSummary.remove();
        if (successSummary) successSummary.remove();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}