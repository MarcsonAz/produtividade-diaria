/**
 * Gerenciador de Cronômetro
 */

const TimerManager = {
    elapsedTime: 0,
    startTime: 0,
    intervalId: null,
    isRunning: false,
    laps: [],
    
    /**
     * Inicializa o cronômetro
     */
    init() {
        this.loadState();
        this.setupEventListeners();
        this.updateDisplay();
        this.renderLaps();
    },
    
    /**
     * Configura os event listeners
     */
    setupEventListeners() {
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const resetBtn = document.getElementById('reset-btn');
        const lapBtn = document.getElementById('lap-btn');
        
        startBtn.addEventListener('click', () => this.start());
        pauseBtn.addEventListener('click', () => this.pause());
        resetBtn.addEventListener('click', () => this.reset());
        lapBtn.addEventListener('click', () => this.recordLap());
    },
    
    /**
     * Carrega estado salvo do localStorage
     */
    loadState() {
        const savedState = Storage.loadTimerState();
        this.elapsedTime = savedState.elapsedTime || 0;
        this.laps = Storage.loadLaps();
        
        // Não retoma automaticamente o cronômetro ao recarregar
        this.isRunning = false;
    },
    
    /**
     * Salva o estado atual
     */
    saveState() {
        Storage.saveTimerState({
            elapsedTime: this.elapsedTime,
            isRunning: this.isRunning,
            lastUpdated: Date.now()
        });
        Storage.saveLaps(this.laps);
    },
    
    /**
     * Inicia o cronômetro
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now() - this.elapsedTime;
        
        this.intervalId = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            this.updateDisplay();
            
            // Salva periodicamente (a cada 5 segundos)
            if (Math.floor(this.elapsedTime / 1000) % 5 === 0) {
                this.saveState();
            }
        }, 10); // Atualiza a cada 10ms para mostrar milissegundos
        
        this.updateButtons();
        document.querySelector('.timer-column').classList.add('timer-running');
        showToast('Cronômetro iniciado', 'info');
    },
    
    /**
     * Pausa o cronômetro
     */
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.intervalId);
        this.intervalId = null;
        
        this.updateButtons();
        this.saveState();
        document.querySelector('.timer-column').classList.remove('timer-running');
        showToast('Cronômetro pausado', 'info');
    },
    
    /**
     * Reseta o cronômetro
     */
    reset() {
        const wasRunning = this.isRunning;
        
        if (wasRunning) {
            this.pause();
        }
        
        // Se o cronômetro tem tempo ou voltas, pede confirmação
        if (this.elapsedTime > 0 || this.laps.length > 0) {
            if (!confirm('Deseja realmente resetar o cronômetro e apagar as voltas?')) {
                if (wasRunning) {
                    this.start();
                }
                return;
            }
        }
        
        this.elapsedTime = 0;
        this.startTime = 0;
        this.laps = [];
        
        this.updateDisplay();
        this.renderLaps();
        this.updateButtons();
        this.saveState();
        
        showToast('Cronômetro resetado', 'success');
    },
    
    /**
     * Registra uma volta
     */
    recordLap() {
        if (this.elapsedTime === 0) return;
        
        const lapNumber = this.laps.length + 1;
        const lapTime = this.elapsedTime;
        
        const lap = {
            id: generateUniqueId(),
            number: lapNumber,
            time: lapTime,
            timestamp: Date.now()
        };
        
        this.laps.unshift(lap); // Adiciona no início
        this.renderLaps();
        this.saveState();
        
        showToast(`Volta ${lapNumber} registrada!`, 'success');
    },
    
    /**
     * Atualiza o display do cronômetro
     */
    updateDisplay() {
        const time = formatTime(this.elapsedTime);
        
        document.getElementById('hours').textContent = time.hours;
        document.getElementById('minutes').textContent = time.minutes;
        document.getElementById('seconds').textContent = time.seconds;
        document.getElementById('milliseconds').textContent = time.milliseconds;
    },
    
    /**
     * Atualiza o estado dos botões
     */
    updateButtons() {
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const lapBtn = document.getElementById('lap-btn');
        
        startBtn.disabled = this.isRunning;
        pauseBtn.disabled = !this.isRunning;
        lapBtn.disabled = this.elapsedTime === 0;
    },
    
    /**
     * Renderiza a lista de voltas
     */
    renderLaps() {
        const lapList = document.getElementById('lap-list');
        lapList.innerHTML = '';
        
        if (this.laps.length === 0) {
            return; // O CSS já mostra mensagem "Nenhuma volta registrada"
        }
        
        this.laps.forEach((lap, index) => {
            const li = this.createLapElement(lap, index);
            lapList.appendChild(li);
        });
    },
    
    /**
     * Cria um elemento de volta
     * @param {Object} lap - Objeto da volta
     * @param {number} index - Índice da volta na lista
     * @returns {HTMLElement} Elemento li da volta
     */
    createLapElement(lap, index) {
        const li = document.createElement('li');
        li.className = 'lap-item';
        
        // Número da volta
        const numberSpan = document.createElement('span');
        numberSpan.className = 'lap-number';
        numberSpan.textContent = `Volta ${lap.number}`;
        
        // Tempo da volta
        const timeSpan = document.createElement('span');
        timeSpan.className = 'lap-time';
        const time = formatTime(lap.time);
        timeSpan.textContent = `${time.hours}:${time.minutes}:${time.seconds}.${time.milliseconds}`;
        
        li.appendChild(numberSpan);
        li.appendChild(timeSpan);
        
        // Adiciona diferença de tempo se não for a primeira volta
        if (index < this.laps.length - 1) {
            const prevLap = this.laps[index + 1];
            const diff = calculateTimeDifference(lap.time, prevLap.time);
            
            const diffSpan = document.createElement('span');
            diffSpan.className = `lap-diff ${diff.isFaster ? 'faster' : 'slower'}`;
            diffSpan.textContent = `${diff.isFaster ? '-' : '+'}${diff.formatted}`;
            
            li.appendChild(diffSpan);
        }
        
        return li;
    },
    
    /**
     * Exporta voltas para texto
     * @returns {string} Texto formatado com as voltas
     */
    exportLaps() {
        if (this.laps.length === 0) {
            return 'Nenhuma volta registrada';
        }
        
        let text = 'VOLTAS REGISTRADAS\n';
        text += '==================\n\n';
        
        // Inverte para mostrar na ordem crescente
        const sortedLaps = [...this.laps].reverse();
        
        sortedLaps.forEach(lap => {
            const time = formatTime(lap.time);
            text += `Volta ${lap.number}: ${time.hours}:${time.minutes}:${time.seconds}.${time.milliseconds}\n`;
        });
        
        return text;
    },
    
    /**
     * Limpa todas as voltas
     */
    clearLaps() {
        if (this.laps.length === 0) return;
        
        if (confirm('Deseja apagar todas as voltas registradas?')) {
            this.laps = [];
            this.renderLaps();
            this.saveState();
            showToast('Voltas apagadas', 'info');
        }
    }
};

// Exporta para uso modular se necessário
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimerManager;
}
