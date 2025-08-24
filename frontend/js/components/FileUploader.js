export class FileUploader {
    constructor(options = {}) {
        this.options = {
            allowedTypes: ['.txt', '.pdf', '.docx', '.md', '.json', '.csv'],
            maxSize: 10 * 1024 * 1024, // 10MB
            onUpload: null,
            onError: null,
            ...options
        };

        this.files = [];
    }

    render() {
        return `
            <div class="file-uploader">
                <div class="upload-area" id="upload-area">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <h4>Drop files here or click to upload</h4>
                    <p class="upload-hint">Supported formats: ${this.options.allowedTypes.join(', ')}</p>
                    <input type="file" id="file-input" multiple style="display: none;">
                </div>

                <div class="file-list" id="file-list">
                    ${this.files.length > 0 ? this.renderFileList() : ''}
                </div>

                <div class="upload-actions">
                    <button class="btn btn-primary upload-btn" ${this.files.length === 0 ? 'disabled' : ''}>
                        Upload Files
                    </button>
                    <button class="btn btn-secondary clear-btn" ${this.files.length === 0 ? 'disabled' : ''}>
                        Clear All
                    </button>
                </div>
            </div>
        `;
    }

    renderFileList() {
        return `
            <div class="files-header">
                <h4>Selected Files (${this.files.length})</h4>
            </div>
            ${this.files.map((file, index) => `
                <div class="file-item" data-file-index="${index}">
                    <div class="file-icon">${this.getFileIcon(file.name)}</div>
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                    <button class="btn btn-sm btn-icon remove-file-btn" title="Remove file">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `).join('')}
        `;
    }

    getFileIcon(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const iconMap = {
            'txt': '📄',
            'pdf': '📕',
            'docx': '📘',
            'md': '📝',
            'json': '⚙️',
            'csv': '📊',
            'jpg': '🖼️',
            'png': '🖼️',
            'jpeg': '🖼️'
        };
        return iconMap[extension] || '📁';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    attachEventListeners(element) {
        const uploadArea = element.querySelector('#upload-area');
        const fileInput = element.querySelector('#file-input');
        const uploadBtn = element.querySelector('.upload-btn');
        const clearBtn = element.querySelector('.clear-btn');

        // Click to upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Upload button
        uploadBtn.addEventListener('click', () => {
            this.uploadFiles();
        });

        // Clear button
        clearBtn.addEventListener('click', () => {
            this.clearFiles();
        });

        // Remove individual files
        element.querySelectorAll('.remove-file-btn').forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFile(index);
            });
        });
    }

    handleFiles(fileList) {
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            
            // Check file type
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            if (!this.options.allowedTypes.includes(extension)) {
                this.options.onError?.(`File type not allowed: ${file.name}`);
                continue;
            }

            // Check file size
            if (file.size > this.options.maxSize) {
                this.options.onError?.(`File too large: ${file.name}`);
                continue;
            }

            this.files.push(file);
        }

        this.updateView();
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updateView();
    }

    clearFiles() {
        this.files = [];
        this.updateView();
    }

    async uploadFiles() {
        if (this.files.length === 0) return;

        try {
            for (const file of this.files) {
                const formData = new FormData();
                formData.append('file', file);
                
                if (this.options.onUpload) {
                    await this.options.onUpload(formData, file);
                }
            }

            this.clearFiles();
        } catch (error) {
            this.options.onError?.(`Upload failed: ${error.message}`);
        }
    }

    updateView() {
        const container = document.querySelector('.file-uploader');
        if (container) {
            const fileList = container.querySelector('#file-list');
            const uploadBtn = container.querySelector('.upload-btn');
            const clearBtn = container.querySelector('.clear-btn');

            if (fileList) {
                fileList.innerHTML = this.files.length > 0 ? this.renderFileList() : '';
            }

            if (uploadBtn) {
                uploadBtn.disabled = this.files.length === 0;
            }

            if (clearBtn) {
                clearBtn.disabled = this.files.length === 0;
            }

            // Reattach event listeners for new remove buttons
            container.querySelectorAll('.remove-file-btn').forEach((btn, index) => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeFile(index);
                });
            });
        }
    }
}