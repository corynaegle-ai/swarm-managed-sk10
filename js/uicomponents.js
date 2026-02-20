export class UIComponents {
    constructor() {
        this.animationDuration = 400; // Match CSS transition duration
    }
    
    createElement(tag, className = '', textContent = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }
    
    showError(container, message) {
        if (!container) {
            console.error('Error container not found');
            return;
        }
        
        this.clearMessages(container);
        
        const errorDiv = this.createElement('div', 'error-message', message);
        container.appendChild(errorDiv);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.classList.add('slide-out');
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        errorDiv.remove();
                    }
                }, this.animationDuration);
            }
        }, 5000);
    }
    
    showSuccess(container, message) {
        if (!container) {
            console.error('Success container not found');
            return;
        }
        
        this.clearMessages(container);
        
        const successDiv = this.createElement('div', 'success-message', message);
        container.appendChild(successDiv);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.classList.add('slide-out');
                setTimeout(() => {
                    if (successDiv.parentNode) {
                        successDiv.remove();
                    }
                }, this.animationDuration);
            }
        }, 3000);
    }
    
    clearMessages(container) {
        if (!container) return;
        
        const messages = container.querySelectorAll('.error-message, .success-message');
        messages.forEach(message => message.remove());
    }
    
    createPlayerItem(player, onRemove) {
        const playerItem = this.createElement('div', 'player-item fade-in');
        
        const playerInfo = this.createElement('div', 'player-info');
        const playerName = this.createElement('div', 'player-name', player.name);
        const playerId = this.createElement('div', 'player-id', player.id);
        
        playerInfo.appendChild(playerName);
        playerInfo.appendChild(playerId);
        
        const playerActions = this.createElement('div', 'player-actions');
        const removeBtn = this.createElement('button', 'btn btn-danger', 'Remove');
        
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (onRemove && typeof onRemove === 'function') {
                onRemove(player.id);
            }
        });
        
        playerActions.appendChild(removeBtn);
        playerItem.appendChild(playerInfo);
        playerItem.appendChild(playerActions);
        
        return playerItem;
    }
    
    smoothTransition(fromElement, toElement, callback) {
        if (!fromElement || !toElement) {
            console.error('Invalid elements for smooth transition');
            if (callback) callback();
            return;
        }
        
        // Add transition classes
        fromElement.classList.add('smooth-transition', 'section-exit');
        toElement.classList.add('smooth-transition', 'section-enter');
        
        // Show the target element
        toElement.classList.remove('hidden');
        
        // Trigger transition on next frame
        requestAnimationFrame(() => {
            fromElement.classList.add('section-exit-active');
            toElement.classList.add('section-enter-active');
            toElement.classList.remove('section-enter');
        });
        
        // Complete transition
        setTimeout(() => {
            fromElement.classList.add('hidden');
            fromElement.classList.remove('smooth-transition', 'section-exit', 'section-exit-active');
            toElement.classList.remove('smooth-transition', 'section-enter-active');
            
            if (callback && typeof callback === 'function') {
                callback();
            }
        }, this.animationDuration);
    }
    
    setButtonLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }
    
    updateButtonState(button, enabled, text) {
        if (!button) return;
        
        if (enabled) {
            button.classList.remove('disabled');
            button.disabled = false;
        } else {
            button.classList.add('disabled');
            button.disabled = true;
        }
        
        if (text) {
            button.textContent = text;
        }
    }
}