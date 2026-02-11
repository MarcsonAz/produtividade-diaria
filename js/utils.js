/**
 * Funções utilitárias para a aplicação
 */

/**
 * Formata um número para ter sempre 2 dígitos
 * @param {number} num - Número para formatar
 * @returns {string} Número formatado
 */
function formatTwoDigits(num) {
    return num.toString().padStart(2, '0');
}

/**
 * Formata um número para ter sempre 3 dígitos
 * @param {number} num - Número para formatar
 * @returns {string} Número formatado
 */
function formatThreeDigits(num) {
    return num.toString().padStart(3, '0');
}

/**
 * Formata o tempo em milissegundos para HH:MM:SS.mmm
 * @param {number} milliseconds - Tempo em milissegundos
 * @returns {object} Objeto com horas, minutos, segundos e milissegundos
 */
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor(milliseconds % 1000);
    
    return {
        hours: formatTwoDigits(hours),
        minutes: formatTwoDigits(minutes),
        seconds: formatTwoDigits(seconds),
        milliseconds: formatThreeDigits(ms)
    };
}

/**
 * Formata uma data para exibição
 * @param {Date} date - Data para formatar
 * @returns {string} Data formatada
 */
function formatDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('pt-BR', options);
}

/**
 * Calcula a diferença entre dois tempos
 * @param {number} time1 - Primeiro tempo em ms
 * @param {number} time2 - Segundo tempo em ms
 * @returns {object} Diferença e se foi mais rápido ou lento
 */
function calculateTimeDifference(time1, time2) {
    const diff = Math.abs(time1 - time2);
    const isFaster = time1 < time2;
    
    return {
        difference: diff,
        isFaster: isFaster,
        formatted: formatTimeShort(diff)
    };
}

/**
 * Formata tempo de forma resumida (MM:SS.mmm)
 * @param {number} milliseconds - Tempo em milissegundos
 * @returns {string} Tempo formatado
 */
function formatTimeShort(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor(milliseconds % 1000);
    
    if (minutes > 0) {
        return `${formatTwoDigits(minutes)}:${formatTwoDigits(seconds)}.${formatThreeDigits(ms)}`;
    }
    return `${formatTwoDigits(seconds)}.${formatThreeDigits(ms)}`;
}

/**
 * Gera um ID único
 * @returns {string} ID único
 */
function generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitiza texto para prevenir XSS
 * @param {string} text - Texto para sanitizar
 * @returns {string} Texto sanitizado
 */
function sanitizeText(text) {
    const element = document.createElement('div');
    element.textContent = text;
    return element.innerHTML;
}

/**
 * Debounce para otimizar eventos
 * @param {Function} func - Função para fazer debounce
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} Função com debounce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Mostra notificação toast
 * @param {string} message - Mensagem para exibir
 * @param {string} type - Tipo da notificação (success, error, info)
 */
function showToast(message, type = 'info') {
    // Implementação simples de toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'success' ? '#5CB85C' : type === 'error' ? '#E74C3C' : '#4A90E2'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Exporta as funções (para uso modular se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatTwoDigits,
        formatThreeDigits,
        formatTime,
        formatDate,
        calculateTimeDifference,
        formatTimeShort,
        generateUniqueId,
        sanitizeText,
        debounce,
        showToast
    };
}
