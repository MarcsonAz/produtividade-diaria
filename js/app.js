/**
 * Arquivo principal da aplicação
 * Inicializa todos os módulos e configurações
 */

// Configuração da aplicação
const App = {
    name: 'Produtividade Diária',
    version: '1.0.0',
    
    /**
     * Inicializa a aplicação
     */
    init() {
        console.log(`${this.name} v${this.version} - Iniciando...`);
        
        // Verifica suporte a localStorage
        if (!this.checkLocalStorageSupport()) {
            this.showStorageWarning();
        }
        
        // Registra Service Worker para cache (se disponível)
        this.registerServiceWorker();
        
        // Atualiza data atual
        this.updateCurrentDate();
        
        // Inicializa módulos
        this.initializeModules();
        
        // Configura eventos globais
        this.setupGlobalEvents();
        
        // Adiciona atalhos de teclado
        this.setupKeyboardShortcuts();
        
        console.log('Aplicação iniciada com sucesso!');
    },
    
    /**
     * Verifica suporte a localStorage
     */
    checkLocalStorageSupport() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    /**
     * Mostra aviso de falta de suporte ao localStorage
     */
    showStorageWarning() {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #f39c12;
            color: white;
            padding: 12px;
            text-align: center;
            z-index: 9999;
            font-weight: 600;
        `;
        warning.textContent = '⚠️ Seu navegador não suporta armazenamento local. Seus dados não serão salvos.';
        document.body.prepend(warning);
    },
    
    /**
     * Registra Service Worker para cache offline
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registrado:', registration);
                })
                .catch(error => {
                    console.log('Falha ao registrar Service Worker:', error);
                });
        }
    },
    
    /**
     * Atualiza a data atual no header
     */
    updateCurrentDate() {
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            const now = new Date();
            dateElement.textContent = formatDate(now);
        }
    },
    
    /**
     * Inicializa todos os módulos
     */
    initializeModules() {
        try {
            TaskManager.init();
            TimerManager.init();
        } catch (error) {
            console.error('Erro ao inicializar módulos:', error);
            showToast('Erro ao inicializar aplicação', 'error');
        }
    },
    
    /**
     * Configura eventos globais
     */
    setupGlobalEvents() {
        // Salva dados antes de sair da página
        window.addEventListener('beforeunload', () => {
            TaskManager.saveTasks();
            TimerManager.saveState();
        });
        
        // Detecta quando a página fica visível/invisível
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Página ficou invisível - salva dados
                TaskManager.saveTasks();
                TimerManager.saveState();
            } else {
                // Página voltou a ficar visível - atualiza data
                this.updateCurrentDate();
            }
        });
        
        // Atualiza a data à meia-noite
        this.scheduleNextMidnightUpdate();
    },
    
    /**
     * Agenda atualização da data à meia-noite
     */
    scheduleNextMidnightUpdate() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const timeUntilMidnight = tomorrow - now;
        
        setTimeout(() => {
            this.updateCurrentDate();
            this.scheduleNextMidnightUpdate(); // Agenda próxima atualização
        }, timeUntilMidnight);
    },
    
    /**
     * Configura atalhos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S - Salva dados manualmente
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                TaskManager.saveTasks();
            TimerManager.saveState();
                showToast('Dados salvos!', 'success');
            }
            
            // Ctrl/Cmd + Shift + D - Debug info
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.showDebugInfo();
            }
            
            // Espaço - Inicia/Pausa cronômetro (se não estiver digitando)
            if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                if (TimerManager.isRunning) {
                    TimerManager.pause();
                } else {
                    TimerManager.start();
                }
            }
        });
    },
    
    /**
     * Mostra informações de debug
     */
    showDebugInfo() {
        const stats = Storage.getStorageStats();
        const info = {
            versão: this.version,
            tarefas: TaskManager.tasks.length,
            voltasRegistradas: TimerManager.laps.length,
            tempoDecorrido: formatTimeShort(TimerManager.elapsedTime),
            cronômetroRodando: TimerManager.isRunning,
            armazenamento: `${stats.totalSizeKB} KB (${stats.itemCount} itens)`,
            navegador: navigator.userAgent
        };
        
        console.table(info);
        console.log('Detalhes do armazenamento:', stats);
    },
    
    /**
     * Exporta todos os dados da aplicação
     */
    exportAllData() {
        const data = Storage.exportData();
        const json = JSON.stringify(data, null, 2);
        
        // Cria um blob e faz download
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `produtividade-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('Dados exportados!', 'success');
    },
    
    /**
     * Importa dados da aplicação
     */
    importAllData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (Storage.importData(data)) {
                        TaskManager.loadTasks();
                        TaskManager.renderTasks();
                        TimerManager.loadState();
                        TimerManager.updateDisplay();
                        TimerManager.renderLaps();
                        showToast('Dados importados com sucesso!', 'success');
                    }
                } catch (error) {
                    showToast('Erro ao importar dados', 'error');
                    console.error('Erro:', error);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    },
    
    /**
     * Limpa todos os dados
     */
    clearAllData() {
        if (confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os dados da aplicação. Deseja continuar?')) {
            if (confirm('Tem certeza? Esta ação não pode ser desfeita!')) {
                Storage.clearAll();
                location.reload();
            }
        }
    }
};

// Inicializa a aplicação quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Torna o App acessível globalmente para debug
window.App = App;

// Exporta para uso modular se necessário
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
