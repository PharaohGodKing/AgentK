// Frontend configuration
window.env = {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8000/api',
    ENABLE_DEBUG: process.env.ENABLE_DEBUG || false,
    DEFAULT_MODEL: process.env.DEFAULT_MODEL || 'llama2',
    THEME: process.env.THEME || 'dark'
};