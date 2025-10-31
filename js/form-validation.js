function initFormValidation() {
    const form = document.getElementById('registrationForm');
    
    if (!form) return;

    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('blur', function() {
            const cpf = this.value.replace(/\D/g, '');
            if (cpf.length === 11 && !validarCPF(cpf)) {
                this.setCustomValidity('CPF inválido. Por favor, verifique o número informado.');
                this.classList.add('error');
            } else {
                this.setCustomValidity('');
                this.classList.remove('error');
            }
        });
    }

    const dataNascimentoInput = document.getElementById('dataNascimento');
    if (dataNascimentoInput) {
        dataNascimentoInput.addEventListener('change', function() {
            const dataNascimento = new Date(this.value);
            const hoje = new Date();
            const idade = hoje.getFullYear() - dataNascimento.getFullYear();
            const mesAniversario = hoje.getMonth() - dataNascimento.getMonth();
            
            let idadeReal = idade;
            if (mesAniversario < 0 || (mesAniversario === 0 && hoje.getDate() < dataNascimento.getDate())) {
                idadeReal--;
            }

            if (idadeReal < 16) {
                this.setCustomValidity('Você deve ter no mínimo 16 anos para se cadastrar.');
                this.classList.add('error');
            } else {
                this.setCustomValidity('');
                this.classList.remove('error');
            }
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            
            const firstInvalid = form.querySelector(':invalid');
            if (firstInvalid) {
                firstInvalid.focus();
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            alert('Por favor, preencha todos os campos obrigatórios corretamente.');
            return false;
        }

        const cpf = cpfInput ? cpfInput.value.replace(/\D/g, '') : '';
        if (cpf && !validarCPF(cpf)) {
            alert('Por favor, informe um CPF válido.');
            cpfInput.focus();
            return false;
        }

        alert('Formulário enviado com sucesso! Em breve entraremos em contato.');
        
        form.reset();
        form.classList.remove('was-validated');
    });

    function validarCPF(cpf) {
        if (cpf.length !== 11) return false;
        
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        let soma = 0;
        let resto;
        
        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;
        
        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;
        
        return true;
    }

    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormValidation);
} else {
    initFormValidation();
}

document.addEventListener('formReady', function(e) {
    initFormValidation();
});