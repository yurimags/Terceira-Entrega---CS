/**
 * Máscaras de Input para CPF, Telefone e CEP
 * Compatível com sistema de SPA
 */

function initMasks() {
    // Máscara para CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            }
        });

        // Limitar tamanho máximo
        cpfInput.addEventListener('input', function(e) {
            if (e.target.value.length > 14) {
                e.target.value = e.target.value.slice(0, 14);
            }
        });
    }

    // Máscara para Telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 11) {
                if (value.length <= 10) {
                    // Telefone fixo: (00) 0000-0000
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{4})(\d)/, '$1-$2');
                } else {
                    // Celular: (00) 00000-0000
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                }
                e.target.value = value;
            }
        });

        // Limitar tamanho máximo
        telefoneInput.addEventListener('input', function(e) {
            if (e.target.value.length > 15) {
                e.target.value = e.target.value.slice(0, 15);
            }
        });
    }

    // Máscara para CEP
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 8) {
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
                e.target.value = value;
            }
        });

        // Limitar tamanho máximo
        cepInput.addEventListener('input', function(e) {
            if (e.target.value.length > 9) {
                e.target.value = e.target.value.slice(0, 9);
            }
        });

        // Buscar endereço pelo CEP (opcional - pode ser integrado com API ViaCEP)
        cepInput.addEventListener('blur', function(e) {
            const cep = e.target.value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                // Aqui você pode integrar com uma API de CEP como ViaCEP
                // fetch(`https://viacep.com.br/ws/${cep}/json/`)
                //     .then(response => response.json())
                //     .then(data => {
                //         if (!data.erro) {
                //             document.getElementById('endereco').value = data.logradouro || '';
                //             document.getElementById('cidade').value = data.localidade || '';
                //             document.getElementById('estado').value = data.uf || '';
                //         }
                //     })
                //     .catch(error => console.error('Erro ao buscar CEP:', error));
            }
        });
    }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMasks);
} else {
    initMasks();
}

// Inicializar quando página for carregada via SPA
document.addEventListener('pageLoaded', function(e) {
    initMasks();
});

