import { NOTIFICATION_TYPES } from '../utils/constants.js';
import { createElement, appendChildren, showElement, hideElement } from '../utils/helpers.js';

export class NotificationService {
    constructor() {
        this.container = document.getElementById('notification-container');
        this.notifications = new Map();
        this.nextId = 1;
        
        if (!this.container) {
            this.container = createElement('div', 'notification-container');
            document.body.appendChild(this.container);
        }
    }

    show(message, type = NOTIFICATION_TYPES.INFO, options = {}) {
        const id = this.nextId++;
        const notification = this.createNotification(id, message, type, options);
        
        this.container.appendChild(notification);
        this.notifications.set(id, notification);
        
        // Auto-dismiss if duration is specified
        if (options.duration !== false) {
            const duration = options.duration || 5000;
            setTimeout(() => this.dismiss(id), duration);
        }
        
        return id;
    }

    success(message, options = {}) {
        return this.show(message, NOTIFICATION_TYPES.SUCCESS, options);
    }

    error(message, options = {}) {
        return this.show(message, NOTIFICATION_TYPES.ERROR, options);
    }

    warning(message, options = {}) {
        return this.show(message, NOTIFICATION_TYPES.WARNING, options);
    }

    info(message, options = {}) {
        return this.show(message, NOTIFICATION_TYPES.INFO, options);
    }

    dismiss(id) {
        const notification = this.notifications.get(id);
        if (notification) {
            notification.classList.add('exiting');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.notifications.delete(id);
            }, 300);
        }
    }

    dismissAll() {
        this.notifications.forEach((_, id) => this.dismiss(id));
    }

    createNotification(id, message, type, options) {
        const notification = createElement('div', `notification notification-${type}`);
        
        const icon = this.createIcon(type);
        const content = createElement('div', 'notification-content');
        const title = createElement('div', 'notification-title', {}, {
            textContent: this.getTitle(type)
        });
        const messageEl = createElement('p', 'notification-message', {}, {
            textContent: message
        });
        
        appendChildren(content, title, messageEl);
        
        const closeButton = createElement('button', 'notification-close', {}, {
            type: 'button',
            'aria-label': 'Close notification'
        });
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => this.dismiss(id));
        
        appendChildren(notification, icon, content, closeButton);
        
        return notification;
    }

    createIcon(type) {
        const icon = createElement('div', 'notification-icon');
        
        const svgMap = {
            [NOTIFICATION_TYPES.SUCCESS]: `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            `,
            [NOTIFICATION_TYPES.ERROR]: `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            `,
            [NOTIFICATION_TYPES.WARNING]: `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            `,
            [NOTIFICATION_TYPES.INFO]: `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
            `
        };
        
        icon.innerHTML = svgMap[type] || svgMap[NOTIFICATION_TYPES.INFO];
        return icon;
    }

    getTitle(type) {
        const titles = {
            [NOTIFICATION_TYPES.SUCCESS]: 'Success',
            [NOTIFICATION_TYPES.ERROR]: 'Error',
            [NOTIFICATION_TYPES.WARNING]: 'Warning',
            [NOTIFICATION_TYPES.INFO]: 'Information'
        };
        return titles[type] || 'Notification';
    }

    // Toast-style notifications (simpler version)
    toast(message, type = NOTIFICATION_TYPES.INFO, duration = 3000) {
        const toast = createElement('div', `toast toast-${type}`);
        toast.textContent = message;
        
        document.body.appendChild(toast);
        showElement(toast);
        
        setTimeout(() => {
            toast.classList.add('exiting');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
        
        return toast;
    }

    // Progress notification
    progress(id, message, progress = 0) {
        let notification = this.notifications.get(id);
        
        if (!notification) {
            notification = this.createProgressNotification(id, message);
            this.container.appendChild(notification);
            this.notifications.set(id, notification);
        }
        
        const progressBar = notification.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (progress >= 100) {
            setTimeout(() => this.dismiss(id), 1000);
        }
        
        return id;
    }

    createProgressNotification(id, message) {
        const notification = createElement('div', 'notification notification-info');
        
        const icon = this.createIcon(NOTIFICATION_TYPES.INFO);
        const content = createElement('div', 'notification-content');
        const title = createElement('div', 'notification-title', {}, {
            textContent: 'Processing...'
        });
        const messageEl = createElement('p', 'notification-message', {}, {
            textContent: message
        });
        
        const progressContainer = createElement('div', 'progress');
        const progressBar = createElement('div', 'progress-bar');
        progressContainer.appendChild(progressBar);
        
        appendChildren(content, title, messageEl, progressContainer);
        appendChildren(notification, icon, content);
        
        return notification;
    }

    // Update existing notification
    update(id, message, type) {
        const notification = this.notifications.get(id);
        if (notification) {
            const messageEl = notification.querySelector('.notification-message');
            if (messageEl) {
                messageEl.textContent = message;
            }
            
            if (type) {
                // Update notification type
                notification.classList.remove(
                    'notification-success',
                    'notification-error',
                    'notification-warning',
                    'notification-info'
                );
                notification.classList.add(`notification-${type}`);
                
                const icon = notification.querySelector('.notification-icon');
                if (icon) {
                    icon.innerHTML = this.createIcon(type).innerHTML;
                }
                
                const title = notification.querySelector('.notification-title');
                if (title) {
                    title.textContent = this.getTitle(type);
                }
            }
        }
    }
}

// Create global notification service instance
const notificationService = new NotificationService();

// Export for modules
export { notificationService, NotificationService };

// Export to global scope
window.AgentKNotifications = notificationService;