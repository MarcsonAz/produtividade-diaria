/**
 * Gerenciador de armazenamento local (localStorage)
 * Implementa cache para melhor performance
 */

const Storage = {
    // Chaves do localStorage
    KEYS: {
        TASKS: 'productivity_tasks',
        TIMER_STATE: 'productivity_timer_state',
        LAPS: 'productivity_laps',
        PREFERENCES: 'productivity_preferences',
        VERSION: 'productivity_version'
    },
    
    // Versão atual do app (para gerenciar migrações)
    CURRENT_VERSION: '1.0.0',
    
    /**
     * Inicializa o storage
     */
    init() {
        this.checkVersion();
        this.clearExpiredData();
    },
    
    /**
     * Verifica e atualiza versão
     */
    checkVersion() {
        const savedVersion = this.get(this.KEYS.VERSION);
        if (savedVersion !== this.CURRENT_VERSION) {
            console.log('Nova versão detectada. Atualizando...');
            this.set(this.KEYS.VERSION, this.CURRENT_VERSION);
            // Aqui você pode adicionar lógica de migração se necessário
        }
    },
    
    /**
     * Salva dados no localStorage
     * @param {string} key - Chave
     * @param {any} value - Valor (será convertido para JSON)
     * @returns {boolean} Sucesso da operação
     */
    set(key, value) {
        try {
            const data = {
                value: value,
                timestamp: Date.now(),
                version: this.CURRENT_VERSION
            };
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            // Se excedeu quota, limpa dados antigos
            if (error.name === 'QuotaExceededError') {
                this.clearOldData();
                return this.set(key, value); // Tenta novamente
            }
            return false;
        }
    },
    
    /**
     * Recupera dados do localStorage
     * @param {string} key - Chave
     * @param {any} defaultValue - Valor padrão se não encontrado
     * @returns {any} Valor armazenado ou valor padrão
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;
            
            const data = JSON.parse(item);
            return data.value;
        } catch (error) {
            console.error('Erro ao ler do localStorage:', error);
            return defaultValue;
        }
    },
    
    /**
     * Remove item do localStorage
     * @param {string} key - Chave
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
        }
    },
    
    /**
     * Limpa todos os dados da aplicação
     */
    clearAll() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            console.log('Todos os dados foram limpos');
        } catch (error) {
            console.error('Erro ao limpar localStorage:', error);
        }
    },
    
    /**
     * Limpa dados expirados (mais de 30 dias)
     */
    clearExpiredData() {
        const EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000; // 30 dias
        const now = Date.now();
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                const item = localStorage.getItem(key);
                const data = JSON.parse(item);
                
                if (data.timestamp && (now - data.timestamp > EXPIRATION_TIME)) {
                    localStorage.removeItem(key);
                    console.log(`Dados expirados removidos: ${key}`);
                }
            } catch (error) {
                // Ignora erros de parse
            }
        }
    },
    
    /**
     * Limpa dados mais antigos quando quota é excedida
     */
    clearOldData() {
        const items = [];
        
        // Coleta todos os itens com timestamp
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                const item = localStorage.getItem(key);
                const data = JSON.parse(item);
                if (data.timestamp) {
                    items.push({ key, timestamp: data.timestamp });
                }
            } catch (error) {
                // Ignora
            }
        }
        
        // Ordena por timestamp (mais antigos primeiro)
        items.sort((a, b) => a.timestamp - b.timestamp);
        
        // Remove os 20% mais antigos
        const toRemove = Math.ceil(items.length * 0.2);
        for (let i = 0; i < toRemove; i++) {
            localStorage.removeItem(items[i].key);
        }
        
        console.log(`${toRemove} itens antigos removidos para liberar espaço`);
    },
    
    /**
     * Salva tarefas
     * @param {Array} tasks - Array de tarefas
     */
    saveTasks(tasks) {
        return this.set(this.KEYS.TASKS, tasks);
    },
    
    /**
     * Carrega tarefas
     * @returns {Array} Array de tarefas
     */
    loadTasks() {
        return this.get(this.KEYS.TASKS, []);
    },
    
    /**
     * Salva estado do cronômetro
     * @param {Object} state - Estado do cronômetro
     */
    saveTimerState(state) {
        return this.set(this.KEYS.TIMER_STATE, state);
    },
    
    /**
     * Carrega estado do cronômetro
     * @returns {Object} Estado do cronômetro
     */
    loadTimerState() {
        return this.get(this.KEYS.TIMER_STATE, {
            elapsedTime: 0,
            isRunning: false,
            lastUpdated: Date.now()
        });
    },
    
    /**
     * Salva voltas do cronômetro
     * @param {Array} laps - Array de voltas
     */
    saveLaps(laps) {
        return this.set(this.KEYS.LAPS, laps);
    },
    
    /**
     * Carrega voltas do cronômetro
     * @returns {Array} Array de voltas
     */
    loadLaps() {
        return this.get(this.KEYS.LAPS, []);
    },
    
    /**
     * Exporta todos os dados
     * @returns {Object} Objeto com todos os dados
     */
    exportData() {
        return {
            tasks: this.loadTasks(),
            timerState: this.loadTimerState(),
            laps: this.loadLaps(),
            version: this.CURRENT_VERSION,
            exportDate: new Date().toISOString()
        };
    },
    
    /**
     * Importa dados
     * @param {Object} data - Dados para importar
     * @returns {boolean} Sucesso da operação
     */
    importData(data) {
        try {
            if (data.tasks) this.saveTasks(data.tasks);
            if (data.timerState) this.saveTimerState(data.timerState);
            if (data.laps) this.saveLaps(data.laps);
            return true;
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            return false;
        }
    },
    
    /**
     * Retorna estatísticas de uso do storage
     * @returns {Object} Estatísticas
     */
    getStorageStats() {
        let totalSize = 0;
        const stats = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            const size = new Blob([value]).size;
            totalSize += size;
            stats[key] = size;
        }
        
        return {
            totalSize: totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            itemCount: localStorage.length,
            items: stats
        };
    }
};

// Inicializa o storage quando o script é carregado
Storage.init();

// Exporta para uso modular se necessário
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
