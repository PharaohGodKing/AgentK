import { ApiClient } from './api_client.js';

export class AuthService {
    constructor() {
        this.api = new ApiClient();
        this.isAuthenticated = false;
        this.user = null;
    }

    async initialize() {
        // Check if user is already authenticated
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                // Verify token is still valid
                const user = await this.api.get('/auth/verify');
                this.isAuthenticated = true;
                this.user = user;
                return true;
            } catch (error) {
                // Token is invalid, clear it
                this.clearAuth();
                return false;
            }
        }
        return false;
    }

    async login(username, password) {
        try {
            const response = await this.api.post('/auth/login', {
                username,
                password
            });
            
            if (response.token) {
                // Store token
                localStorage.setItem('auth_token', response.token);
                this.isAuthenticated = true;
                this.user = response.user;
                
                return { success: true, user: response.user };
            }
            
            throw new Error('No token received');
            
        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Login failed' 
            };
        }
    }

    async logout() {
        try {
            await this.api.post('/auth/logout');
        } catch (error) {
            console.warn('Logout API call failed:', error);
        } finally {
            this.clearAuth();
        }
    }

    clearAuth() {
        localStorage.removeItem('auth_token');
        this.isAuthenticated = false;
        this.user = null;
    }

    getToken() {
        return localStorage.getItem('auth_token');
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }

    getUser() {
        return this.user;
    }
}