// DOM manipulation helpers
export const $ = (selector, context = document) => context.querySelector(selector);
export const $$ = (selector, context = document) => context.querySelectorAll(selector);

export const createElement = (tag, classes = '', attributes = {}) => {
    const element = document.createElement(tag);
    if (classes) element.className = classes;
    Object.keys(attributes).forEach(key => {
        element.setAttribute(key, attributes[key]);
    });
    return element;
};

export const appendChildren = (parent, ...children) => {
    children.forEach(child => {
        if (child) parent.appendChild(child);
    });
    return parent;
};

export const removeChildren = (parent) => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
};

export const showElement = (element) => {
    element.classList.remove('hidden');
};

export const hideElement = (element) => {
    element.classList.add('hidden');
};

export const toggleElement = (element, force) => {
    if (force !== undefined) {
        element.classList.toggle('hidden', !force);
    } else {
        element.classList.toggle('hidden');
    }
};

// String manipulation helpers
export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncate = (str, length, suffix = '...') => {
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
};

export const slugify = (str) => {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

// Date and time helpers
export const formatDate = (date, options = {}) => {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return new Date(date).toLocaleDateString(undefined, { ...defaultOptions, ...options });
};

export const formatTime = (date, options = {}) => {
    const defaultOptions = {
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleTimeString(undefined, { ...defaultOptions, ...options });
};

export const formatDateTime = (date) => {
    return `${formatDate(date)} ${formatTime(date)}`;
};

export const relativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
};

// Object and array helpers
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

export const mergeObjects = (target, ...sources) => {
    sources.forEach(source => {
        for (const key in source) {
            if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                mergeObjects(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    });
    return target;
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Storage helpers
export const getStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
};

export const setStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
};

export const removeStorage = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch {
        return false;
    }
};

// Event helpers
export const on = (element, event, handler, options = {}) => {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
};

export const once = (element, event, handler) => {
    return on(element, event, handler, { once: true });
};

export const triggerEvent = (element, eventName, detail = {}) => {
    const event = new CustomEvent(eventName, { detail });
    element.dispatchEvent(event);
};

// Validation helpers
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const isEmpty = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
};

// Number helpers
export const formatNumber = (number, options = {}) => {
    const defaultOptions = {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    };
    return number.toLocaleString(undefined, { ...defaultOptions, ...options });
};

export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

export const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Color helpers
export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

export const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
};

export const lightenColor = (hex, percent) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const r = Math.min(255, rgb.r + Math.round(255 * percent));
    const g = Math.min(255, rgb.g + Math.round(255 * percent));
    const b = Math.min(255, rgb.b + Math.round(255 * percent));
    
    return rgbToHex(r, g, b);
};

export const darkenColor = (hex, percent) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const r = Math.max(0, rgb.r - Math.round(255 * percent));
    const g = Math.max(0, rgb.g - Math.round(255 * percent));
    const b = Math.max(0, rgb.b - Math.round(255 * percent));
    
    return rgbToHex(r, g, b);
};

// Promise helpers
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const retry = async (fn, retries = 3, delayMs = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await delay(delayMs);
        return retry(fn, retries - 1, delayMs * 2);
    }
};

// Export all helpers to global scope for easy access
window.AgentKHelpers = {
    $, $$, createElement, appendChildren, removeChildren,
    showElement, hideElement, toggleElement,
    capitalize, truncate, slugify,
    formatDate, formatTime, formatDateTime, relativeTime,
    deepClone, mergeObjects, debounce, throttle,
    getStorage, setStorage, removeStorage,
    on, once, triggerEvent,
    isValidEmail, isValidUrl, isEmpty,
    formatNumber, formatBytes, randomInt,
    hexToRgb, rgbToHex, lightenColor, darkenColor,
    delay, retry
};