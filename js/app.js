/**
 * Token Price Estimator - Main Application Controller
 *
 * Orchestrates UI interactions, form handling, and result display
 */

class TokenPriceApp {
    constructor() {
        this.calculator = new PriceCalculator();
        this.isInitialized = false;
        this.currentResults = [];
        this.currentInputTokens = 0;
        this.currentOutputTokens = 0;
        this.cacheKeyForCopy = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            await this.calculator.init();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('✅ Token Price Estimator initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showError('Failed to load pricing data. Please refresh the page.');
        }
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Form controls
        document.getElementById('calculateBtn').addEventListener('click', () => this.handleCalculate());
        document.getElementById('resetBtn').addEventListener('click', () => this.handleReset());
        document.getElementById('scenarioSelect').addEventListener('change', (e) => {
            const customRatioDiv = document.getElementById('customRatioDiv');
            if (e.target.value === 'custom') {
                customRatioDiv.style.display = 'block';
            } else {
                customRatioDiv.style.display = 'none';
            }
        });

        // Results controls
        document.getElementById('copyBtn').addEventListener('click', () => this.handleCopyResults());
        document.getElementById('backBtn').addEventListener('click', () => this.handleBack());

        // Allow Enter to calculate (Ctrl+Enter in textarea)
        document.getElementById('projectPlan').addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.handleCalculate();
            }
        });
    }

    /**
     * Handle calculate button click
     */
    async handleCalculate() {
        const projectPlan = document.getElementById('projectPlan').value;
        const provider = document.getElementById('providerSelect').value;
        const scenario = document.getElementById('scenarioSelect').value;
        const customRatio = parseFloat(document.getElementById('customRatio').value) || 1;

        // Validation
        if (!projectPlan.trim()) {
            this.showError('Please enter your project plan');
            return;
        }

        if (!provider) {
            this.showError('Please select a provider');
            return;
        }

        try {
            // Calculate tokens
            const inputTokens = SimpleTokenizer.countTokens(projectPlan);
            const outputTokens = SimpleTokenizer.estimateOutputTokens(
                inputTokens,
                scenario,
                customRatio
            );

            // Store for later reference
            this.currentInputTokens = inputTokens;
            this.currentOutputTokens = outputTokens;

            // Generate report
            this.currentResults = this.calculator.generateReport(inputTokens, outputTokens);

            // Display results
            this.displayResults(inputTokens, outputTokens, scenario);

            // Show results section
            document.getElementById('resultsCard').style.display = 'block';
            document.getElementById('emptyState').style.display = 'none';

            // Smooth scroll to results
            setTimeout(() => {
                document.getElementById('resultsCard').scrollIntoView({ behavior: 'smooth' });
            }, 100);

        } catch (error) {
            console.error('❌ Calculation error:', error);
            this.showError('An error occurred while calculating costs. Please try again.');
        }
    }

    /**
     * Display calculation results
     * @param {number} inputTokens - Input token count
     * @param {number} outputTokens - Output token count
     * @param {string} scenario - Scenario used
     */
    displayResults(inputTokens, outputTokens, scenario) {
        // Update summary
        const summaryHtml = `
            <strong>📊 Token Breakdown:</strong><br>
            Input Tokens: <strong>${this.calculator.formatTokens(inputTokens)}</strong> |
            Output Tokens: <strong>${this.calculator.formatTokens(outputTokens)}</strong> |
            Total: <strong>${this.calculator.formatTokens(inputTokens + outputTokens)}</strong>
            <br>
            <small class="text-muted">Scenario: ${this.getScenarioLabel(scenario)}</small>
        `;
        document.getElementById('tokenSummary').innerHTML = summaryHtml;

        // Generate table rows
        const tbody = document.getElementById('resultsBody');
        tbody.innerHTML = '';

        // Sort results by total cost for better readability
        const sortedResults = [...this.currentResults].sort((a, b) => a.totalCost - b.totalCost);

        sortedResults.forEach(result => {
            const row = document.createElement('tr');
            const costCategory = this.calculator.getCostCategory(result.totalCost);

            row.innerHTML = `
                <td>
                    <div class="fw-semibold">${result.model}</div>
                    <small class="text-muted">${result.provider}</small>
                </td>
                <td class="text-end">${this.calculator.formatCostShort(result.inputCost)}</td>
                <td class="text-end">${this.calculator.formatCostShort(result.outputCost)}</td>
                <td class="text-end">
                    <span class="cost-${costCategory} fw-bold">
                        ${this.calculator.formatCostShort(result.totalCost)}
                    </span>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Create cache key for copy functionality
        this.cacheKeyForCopy = {
            timestamp: new Date().toISOString(),
            inputTokens,
            outputTokens,
            scenario,
            results: sortedResults
        };
    }

    /**
     * Get human-readable scenario label
     * @param {string} scenario - Scenario ID
     * @returns {string} Label
     */
    getScenarioLabel(scenario) {
        const labels = {
            'summary': 'Summary (1:1)',
            'code': 'Code Generation (1:3)',
            'analysis': 'Data Analysis (1:2)',
            'qa': 'Chat/Q&A (1:1)',
            'custom': 'Custom Ratio'
        };
        return labels[scenario] || scenario;
    }

    /**
     * Handle copy results to clipboard
     */
    async handleCopyResults() {
        if (!this.cacheKeyForCopy || !this.cacheKeyForCopy.results) {
            this.showError('No results to copy');
            return;
        }

        try {
            const { results, inputTokens, outputTokens, scenario } = this.cacheKeyForCopy;

            // Format as plain text table
            let text = 'Token Price Estimation Results\n';
            text += `Generated: ${new Date().toLocaleString()}\n`;
            text += `\n`;
            text += `Input Tokens: ${this.calculator.formatTokens(inputTokens)}\n`;
            text += `Output Tokens: ${this.calculator.formatTokens(outputTokens)}\n`;
            text += `Total Tokens: ${this.calculator.formatTokens(inputTokens + outputTokens)}\n`;
            text += `Scenario: ${this.getScenarioLabel(scenario)}\n`;
            text += `\n`;
            text += `COST BREAKDOWN:\n`;
            text += '─'.repeat(80) + '\n';
            text += `Model${' '.repeat(35)}Input Cost${' '.repeat(10)}Output Cost${' '.repeat(8)}Total Cost\n`;
            text += '─'.repeat(80) + '\n';

            results.forEach(result => {
                const modelName = `${result.model} (${result.provider})`;
                const padding = 40 - modelName.length;
                text += modelName + ' '.repeat(Math.max(1, padding));
                text += this.calculator.formatCostShort(result.inputCost).padEnd(20);
                text += this.calculator.formatCostShort(result.outputCost).padEnd(20);
                text += this.calculator.formatCostShort(result.totalCost) + '\n';
            });

            text += '─'.repeat(80) + '\n';
            text += `\nPricing Sources:\n`;
            text += `Claude/Anthropic: https://www.anthropic.com/pricing\n`;
            text += `Google Gemini: https://ai.google.dev/pricing\n`;
            text += `OpenAI: https://openai.com/pricing\n`;

            // Copy to clipboard
            await navigator.clipboard.writeText(text);

            // Show success feedback
            const btn = document.getElementById('copyBtn');
            const originalText = btn.textContent;
            btn.textContent = '✓ Copied!';
            btn.classList.add('btn-success');
            btn.classList.remove('btn-outline-primary');

            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('btn-success');
                btn.classList.add('btn-outline-primary');
            }, 2000);

        } catch (error) {
            console.error('❌ Copy error:', error);
            this.showError('Failed to copy results. Try again or manually select the text.');
        }
    }

    /**
     * Handle back button
     */
    handleBack() {
        document.getElementById('resultsCard').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
        this.currentResults = [];
        this.cacheKeyForCopy = null;
    }

    /**
     * Handle reset button
     */
    handleReset() {
        document.getElementById('projectPlan').value = '';
        document.getElementById('providerSelect').value = '';
        document.getElementById('scenarioSelect').value = 'summary';
        document.getElementById('customRatio').value = '1';
        document.getElementById('customRatioDiv').style.display = 'none';
        document.getElementById('resultsCard').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
        this.currentResults = [];
        this.cacheKeyForCopy = null;
    }

    /**
     * Show error message to user
     * @param {string} message - Error message
     */
    showError(message) {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Insert at top of results section (or create container)
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(alert, container.firstChild);
            setTimeout(() => {
                alert.remove();
            }, 5000);
        }

        console.error('User Error:', message);
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new TokenPriceApp();
    await app.init();

    // Make global for debugging
    window.app = app;
    window.calculator = app.calculator;
});
