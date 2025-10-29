/**
 * Storage.js - Gerenciamento de armazenamento local (localStorage)
 * Facilita o uso do localStorage com tratamento de erros
 */

class StorageManager {
    constructor(prefix = 'platform_ong_') {
        this.prefix = prefix;
        this.isAvailable = this.checkAvailability();
    }

    /**
     * Verifica se o localStorage está disponível
     * @returns {boolean} True se disponível
     */
    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage não está disponível:', e);
            return false;
        }
    }

    /**
     * Obtém uma chave completa com prefixo
     * @param {string} key - Chave
     * @returns {string} Chave completa
     */
    getKey(key) {
        return this.prefix + key;
    }

    /**
     * Salva um valor no localStorage
     * @param {string} key - Chave
     * @param {any} value - Valor (será convertido para JSON)
     * @returns {boolean} True se salvou com sucesso
     */
    set(key, value) {
        if (!this.isAvailable) return false;

        try {
            const jsonValue = JSON.stringify(value);
            localStorage.setItem(this.getKey(key), jsonValue);
            return true;
        } catch (e) {
            console.error('Erro ao salvar no localStorage:', e);
            return false;
        }
    }

    /**
     * Obtém um valor do localStorage
     * @param {string} key - Chave
     * @param {any} defaultValue - Valor padrão se não encontrado
     * @returns {any} Valor obtido ou valor padrão
     */
    get(key, defaultValue = null) {
        if (!this.isAvailable) return defaultValue;

        try {
            const item = localStorage.getItem(this.getKey(key));
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (e) {
            console.error('Erro ao ler do localStorage:', e);
            return defaultValue;
        }
    }

    /**
     * Remove um item do localStorage
     * @param {string} key - Chave
     * @returns {boolean} True se removeu com sucesso
     */
    remove(key) {
        if (!this.isAvailable) return false;

        try {
            localStorage.removeItem(this.getKey(key));
            return true;
        } catch (e) {
            console.error('Erro ao remover do localStorage:', e);
            return false;
        }
    }

    /**
     * Limpa todos os itens com o prefixo
     * @returns {boolean} True se limpou com sucesso
     */
    clear() {
        if (!this.isAvailable) return false;

        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (e) {
            console.error('Erro ao limpar localStorage:', e);
            return false;
        }
    }

    /**
     * Verifica se uma chave existe
     * @param {string} key - Chave
     * @returns {boolean} True se existe
     */
    has(key) {
        if (!this.isAvailable) return false;
        return localStorage.getItem(this.getKey(key)) !== null;
    }

    /**
     * Obtém todas as chaves com o prefixo
     * @returns {Array<string>} Array de chaves
     */
    keys() {
        if (!this.isAvailable) return [];

        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                keys.push(key.replace(this.prefix, ''));
            }
        }
        return keys;
    }
}

// Instância global do Storage Manager
const storage = new StorageManager();

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageManager, storage };
}
