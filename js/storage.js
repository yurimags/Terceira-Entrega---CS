class StorageManager {
    constructor(prefix = 'platform_ong_') {
        this.prefix = prefix;
        this.isAvailable = this.checkAvailability();
    }

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

    getKey(key) {
        return this.prefix + key;
    }

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

    has(key) {
        if (!this.isAvailable) return false;
        return localStorage.getItem(this.getKey(key)) !== null;
    }

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

const storage = new StorageManager();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageManager, storage };
}