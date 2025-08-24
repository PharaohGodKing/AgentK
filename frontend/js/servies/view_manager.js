export class ViewManager {
    constructor() {
        this.viewContainer = document.getElementById('view-container');
        this.views = {
            'dashboard': './js/components/Dashboard.js',
            'agents': './js/components/Agents.js',
            'workflows': './js/components/Workflows.js',
            'chat': './js/components/Chat.js',
            'memory': './js/components/Memory.js',
            'models': './js/components/Models.js',
            'settings': './js/components/Settings.js'
        };
    }

    async loadView(viewName) {
        try {
            // Show loading state
            this.showLoading();
            
            // Load view component
            const viewPath = this.views[viewName];
            if (!viewPath) {
                throw new Error(`View ${viewName} not found`);
            }
            
            // Import the view component
            const module = await import(viewPath);
            const ViewComponent = module.default || module;
            
            // Render the view
            this.viewContainer.innerHTML = '';
            const viewInstance = new ViewComponent();
            await viewInstance.render();
            
            // Append to container
            this.viewContainer.appendChild(viewInstance.element);
            
        } catch (error) {
            console.error(`Failed to load view ${viewName}:`, error);
            this.showError(viewName, error);
        }
    }

    showLoading() {
        this.viewContainer.innerHTML = `
            <div class="view-loading">
                <div class="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    }

    showError(viewName, error) {
        this.viewContainer.innerHTML = `
            <div class="view-error">
                <h2>Failed to load ${viewName}</h2>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
            </div>
        `;
    }
}