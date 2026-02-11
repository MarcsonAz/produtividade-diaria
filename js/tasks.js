/**
 * Gerenciador de Tarefas
 */

const TaskManager = {
    tasks: [],
    
    /**
     * Inicializa o gerenciador de tarefas
     */
    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.renderTasks();
    },
    
    /**
     * Configura os event listeners
     */
    setupEventListeners() {
        const taskInput = document.getElementById('task-input');
        const addTaskBtn = document.getElementById('add-task-btn');
        const clearCompletedBtn = document.getElementById('clear-completed-btn');
        
        // Adicionar tarefa ao clicar no botão
        addTaskBtn.addEventListener('click', () => this.addTask());
        
        // Adicionar tarefa ao pressionar Enter
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        // Limpar tarefas concluídas
        clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
    },
    
    /**
     * Carrega tarefas do localStorage
     */
    loadTasks() {
        this.tasks = Storage.loadTasks();
    },
    
    /**
     * Salva tarefas no localStorage
     */
    saveTasks() {
        Storage.saveTasks(this.tasks);
    },
    
    /**
     * Adiciona uma nova tarefa
     */
    addTask() {
        const input = document.getElementById('task-input');
        const text = input.value.trim();
        
        if (text === '') {
            showToast('Digite uma tarefa válida', 'error');
            return;
        }
        
        const task = {
            id: generateUniqueId(),
            text: sanitizeText(text),
            completed: false,
            createdAt: Date.now()
        };
        
        this.tasks.unshift(task); // Adiciona no início
        input.value = '';
        input.focus();
        
        this.saveTasks();
        this.renderTasks();
        showToast('Tarefa adicionada!', 'success');
    },
    
    /**
     * Remove uma tarefa
     * @param {string} id - ID da tarefa
     */
    deleteTask(id) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) return;
        
        const taskText = this.tasks[taskIndex].text;
        this.tasks.splice(taskIndex, 1);
        
        this.saveTasks();
        this.renderTasks();
        showToast('Tarefa removida', 'info');
    },
    
    /**
     * Alterna o estado de conclusão de uma tarefa
     * @param {string} id - ID da tarefa
     */
    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (!task) return;
        
        task.completed = !task.completed;
        task.completedAt = task.completed ? Date.now() : null;
        
        this.saveTasks();
        this.renderTasks();
        
        if (task.completed) {
            showToast('Tarefa concluída! 🎉', 'success');
        }
    },
    
    /**
     * Remove todas as tarefas concluídas
     */
    clearCompleted() {
        const completedCount = this.tasks.filter(task => task.completed).length;
        
        if (completedCount === 0) {
            showToast('Não há tarefas concluídas', 'info');
            return;
        }
        
        if (confirm(`Deseja remover ${completedCount} tarefa(s) concluída(s)?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.renderTasks();
            showToast(`${completedCount} tarefa(s) removida(s)`, 'success');
        }
    },
    
    /**
     * Renderiza a lista de tarefas
     */
    renderTasks() {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';
        
        if (this.tasks.length === 0) {
            taskList.innerHTML = '<li class="empty-state">Nenhuma tarefa adicionada. Comece agora!</li>';
        } else {
            this.tasks.forEach(task => {
                const li = this.createTaskElement(task);
                taskList.appendChild(li);
            });
        }
        
        this.updateStats();
    },
    
    /**
     * Cria um elemento de tarefa
     * @param {Object} task - Objeto da tarefa
     * @returns {HTMLElement} Elemento li da tarefa
     */
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', task.id);
        
        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => this.toggleTask(task.id));
        
        // Texto da tarefa
        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = task.text;
        
        // Botão de deletar
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-task-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.setAttribute('aria-label', 'Deletar tarefa');
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
        
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        
        return li;
    },
    
    /**
     * Atualiza as estatísticas de tarefas
     */
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        
        document.getElementById('total-tasks').textContent = total;
        document.getElementById('completed-tasks').textContent = completed;
    },
    
    /**
     * Exporta tarefas para JSON
     * @returns {string} JSON das tarefas
     */
    exportToJSON() {
        return JSON.stringify(this.tasks, null, 2);
    },
    
    /**
     * Importa tarefas de JSON
     * @param {string} json - JSON com tarefas
     */
    importFromJSON(json) {
        try {
            const importedTasks = JSON.parse(json);
            if (Array.isArray(importedTasks)) {
                this.tasks = importedTasks;
                this.saveTasks();
                this.renderTasks();
                showToast('Tarefas importadas com sucesso!', 'success');
            }
        } catch (error) {
            showToast('Erro ao importar tarefas', 'error');
            console.error('Erro ao importar:', error);
        }
    }
};

// Exporta para uso modular se necessário
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskManager;
}
