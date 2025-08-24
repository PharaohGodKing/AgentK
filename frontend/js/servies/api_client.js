export class ApiClient {
    constructor() {
        this.baseUrl = '';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    setBaseUrl(url) {
        this.baseUrl = url;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            ...this.defaultHeaders,
            ...options.headers
        };

        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
            
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async get(endpoint, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'GET'
        });
    }

    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'DELETE'
        });
    }

    async upload(endpoint, formData, options = {}) {
        const headers = {
            ...options.headers
        };

        // Remove Content-Type for FormData (let browser set it)
        delete headers['Content-Type'];

        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: formData,
            headers
        });
    }
}