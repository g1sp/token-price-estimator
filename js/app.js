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
            // Auto-recalculate when scenario changes
            if (this.currentInputTokens > 0) {
                this.handleCalculate();
            }
        });

        // Results controls
        document.getElementById('copyBtn').addEventListener('click', () => this.handleCopyResults());
        document.getElementById('backBtn').addEventListener('click', () => this.handleBack());

        // Advanced calculators
        document.getElementById('visionCalcBtn').addEventListener('click', () => this.handleVisionCalculation());
        document.getElementById('functionCalcBtn').addEventListener('click', () => this.handleFunctionCallCalculation());
        document.getElementById('batchCalcBtn').addEventListener('click', () => this.handleBatchComparison());
        document.getElementById('plannerCalcBtn').addEventListener('click', () => this.handleBudgetPlanner());
        document.getElementById('projectorCalcBtn').addEventListener('click', () => this.handleSpendProjector());

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
        const scenario = document.getElementById('scenarioSelect').value;
        const customRatio = parseFloat(document.getElementById('customRatio').value) || 1;

        // Validation
        if (!projectPlan.trim()) {
            this.showError('Please enter your project plan');
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
        document.getElementById('scenarioSelect').value = 'summary';
        document.getElementById('customRatio').value = '1';
        document.getElementById('customRatioDiv').style.display = 'none';
        document.getElementById('resultsCard').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
        this.currentResults = [];
        this.cacheKeyForCopy = null;
    }

    /**
     * Handle vision model cost calculation
     */
    handleVisionCalculation() {
        const model = document.getElementById('visionModel').value;
        const numImages = parseInt(document.getElementById('numImages').value) || 0;
        const tokensPerImage = parseInt(document.getElementById('tokensPerImage').value) || 0;

        if (!model || numImages <= 0 || tokensPerImage <= 0) {
            this.showError('Please fill in all vision calculator fields');
            return;
        }

        const result = calculateVisionCost(numImages, tokensPerImage, model);

        if (!result) {
            this.showError('Model not found in vision pricing data');
            return;
        }

        const resultsDiv = document.getElementById('visionResults');
        const resultsText = document.getElementById('visionResultsText');

        resultsText.innerHTML = `
            <strong>${result.description}</strong><br>
            ${numImages} images × ${tokensPerImage} tokens = ${result.totalImageTokens.toLocaleString()} image tokens<br>
            <strong>Cost: ${this.calculator.formatCost(result.imageCost)}</strong>
        `;
        resultsDiv.style.display = 'block';
    }

    /**
     * Handle function call overhead calculation
     */
    handleFunctionCallCalculation() {
        const numCalls = parseInt(document.getElementById('numFunctionCalls').value) || 0;
        const baseInput = parseInt(document.getElementById('baseInputTokens').value) || 0;
        const baseOutput = parseInt(document.getElementById('baseOutputTokens').value) || 0;
        const tokensPerCall = parseInt(document.getElementById('tokensPerCall').value) || 0;

        if (numCalls < 0 || baseInput < 0 || baseOutput < 0 || tokensPerCall <= 0) {
            this.showError('Please enter valid values');
            return;
        }

        const result = calculateFunctionCallOverhead(numCalls, tokensPerCall, baseInput, baseOutput);
        const resultsDiv = document.getElementById('functionResults');
        const resultsText = document.getElementById('functionResultsText');

        resultsText.innerHTML = `
            <strong>Function Call Overhead Analysis</strong><br>
            Base input tokens: ${baseInput.toLocaleString()}<br>
            Overhead tokens: <strong>+${result.overheadTokens.toLocaleString()}</strong> (${result.percentageIncrease}% increase)<br>
            Total input tokens: ${result.totalInputTokens.toLocaleString()}<br>
            Base output tokens: ${baseOutput.toLocaleString()}
        `;
        resultsDiv.style.display = 'block';
    }

    /**
     * Handle batch vs real-time cost comparison
     */
    handleBatchComparison() {
        const numRequests = parseInt(document.getElementById('batchNumRequests').value) || 0;
        const inputTokens = parseInt(document.getElementById('batchInputTokens').value) || 0;
        const outputTokens = parseInt(document.getElementById('batchOutputTokens').value) || 0;
        const modelSelect = document.getElementById('batchModel').value;

        if (numRequests <= 0 || inputTokens <= 0 || outputTokens <= 0) {
            this.showError('Please enter valid request and token values');
            return;
        }

        // Get pricing for selected model
        const modelPricing = {
            'claude-sonnet': { input: 3.00, output: 15.00 },
            'gpt-4o': { input: 2.50, output: 10.00 },
            'gemini-flash': { input: 0.075, output: 0.30 }
        };

        const pricing = modelPricing[modelSelect];
        if (!pricing) {
            this.showError('Invalid model selected');
            return;
        }

        const result = compareBatchVsRealtime(
            numRequests,
            inputTokens,
            outputTokens,
            pricing.input,
            pricing.output
        );

        const resultsDiv = document.getElementById('batchResults');
        const realtimeEl = document.getElementById('realtimeTotal');
        const batchEl = document.getElementById('batchTotal');
        const comparisonEl = document.getElementById('batchComparison');

        realtimeEl.innerHTML = `
            ${this.calculator.formatCost(result.realtime.inputCost)} (input)<br>
            ${this.calculator.formatCost(result.realtime.outputCost)} (output)<br>
            <strong>Total: ${this.calculator.formatCost(result.realtime.totalCost)}</strong>
        `;

        batchEl.innerHTML = `
            ${this.calculator.formatCost(result.batch.inputCost)} (input)<br>
            ${this.calculator.formatCost(result.batch.outputCost)} (output)<br>
            <strong>Total: ${this.calculator.formatCost(result.batch.totalCost)}</strong>
        `;

        const recommendClass = result.comparison.recommendBatch ? 'alert-success' : 'alert-info';
        const recommendText = result.comparison.recommendBatch
            ? '✅ Batch recommended: Saves $' + result.comparison.savings.toFixed(2)
            : '💡 Consider batch for larger workloads';

        comparisonEl.className = `alert ${recommendClass}`;
        comparisonEl.innerHTML = `
            <strong>💰 Savings: ${this.calculator.formatCost(result.comparison.savings)} (${result.comparison.savingsPercent}% discount)</strong><br>
            ${recommendText}<br>
            <small>Batch API processes ${numRequests.toLocaleString()} requests in 24 hours</small>
        `;

        resultsDiv.style.display = 'block';
    }

    /**
     * Handle budget-based capacity planner
     */
    handleBudgetPlanner() {
        const budget = parseFloat(document.getElementById('monthlyBudget').value) || 0;
        const inputTokens = parseInt(document.getElementById('plannerInputTokens').value) || 0;
        const outputTokens = parseInt(document.getElementById('plannerOutputTokens').value) || 0;
        const modelSelect = document.getElementById('plannerModel').value;

        if (budget <= 0 || inputTokens <= 0 || outputTokens <= 0) {
            this.showError('Please enter valid budget and token values');
            return;
        }

        const modelPricing = {
            'claude-sonnet': { input: 3.00, output: 15.00 },
            'claude-haiku': { input: 0.80, output: 4.00 },
            'gpt-4o': { input: 2.50, output: 10.00 },
            'gemini-flash': { input: 0.075, output: 0.30 }
        };

        const pricing = modelPricing[modelSelect];
        if (!pricing) {
            this.showError('Invalid model selected');
            return;
        }

        const result = calculateBudgetCapacity(budget, inputTokens, outputTokens, pricing.input, pricing.output);

        if (result.error) {
            this.showError(result.error);
            return;
        }

        const resultsDiv = document.getElementById('plannerResults');
        const capacityEl = document.getElementById('plannerCapacityText');
        const usersEl = document.getElementById('plannerUsersText');
        const throughputEl = document.getElementById('plannerThroughputText');
        const tokensEl = document.getElementById('plannerTokensText');

        capacityEl.innerHTML = `
            <strong>${result.totalRequestsPerMonth.toLocaleString()}</strong> requests/month<br>
            ${result.costPerRequest > 0 ? `$${result.costPerRequest.toFixed(6)} per request` : 'N/A'}<br>
            Budget: ${this.calculator.formatCost(result.monthlyBudget)}
        `;

        usersEl.innerHTML = `
            <strong>${result.maxActiveUsers.toLocaleString()}</strong> active users<br>
            (${result.requestsPerUserPerMonth} requests per user/month)<br>
            OR ${result.requestsPerDay.toLocaleString()} requests/day
        `;

        throughputEl.innerHTML = `
            Per Hour: ${result.requestsPerHour.toLocaleString()} requests<br>
            Per Second: ${result.requestsPerSecond} requests/sec
        `;

        tokensEl.innerHTML = `
            Input: ${result.totalInputTokens.toLocaleString()} tokens (${this.calculator.formatCost(result.breakdown.inputCost)})<br>
            Output: ${result.totalOutputTokens.toLocaleString()} tokens (${this.calculator.formatCost(result.breakdown.outputCost)})<br>
            <strong>Total: ${result.totalTokens.toLocaleString()} tokens</strong>
        `;

        resultsDiv.style.display = 'block';
    }

    /**
     * Handle monthly spend projector
     */
    handleSpendProjector() {
        const requestsPerDay = parseInt(document.getElementById('projectorRequestsPerDay').value) || 0;
        const inputTokens = parseInt(document.getElementById('projectorInputTokens').value) || 0;
        const outputTokens = parseInt(document.getElementById('projectorOutputTokens').value) || 0;
        const modelSelect = document.getElementById('projectorModel').value;

        if (requestsPerDay <= 0 || inputTokens <= 0 || outputTokens <= 0) {
            this.showError('Please enter valid request and token values');
            return;
        }

        const modelPricing = {
            'claude-sonnet': { input: 3.00, output: 15.00 },
            'claude-haiku': { input: 0.80, output: 4.00 },
            'gpt-4o': { input: 2.50, output: 10.00 },
            'gemini-flash': { input: 0.075, output: 0.30 }
        };

        const pricing = modelPricing[modelSelect];
        if (!pricing) {
            this.showError('Invalid model selected');
            return;
        }

        const result = projectMonthlySpend(requestsPerDay, inputTokens, outputTokens, pricing.input, pricing.output);

        const resultsDiv = document.getElementById('projectorResults');
        const dailyEl = document.getElementById('projectorDailyText');
        const monthlyEl = document.getElementById('projectorMonthlyText');
        const yearlyEl = document.getElementById('projectorYearlyText');
        const breakdownEl = document.getElementById('projectorTokenBreakdownText');

        dailyEl.innerHTML = `
            <strong>${this.calculator.formatCost(result.daily.cost)}</strong><br>
            ${result.daily.requests.toLocaleString()} requests
        `;

        monthlyEl.innerHTML = `
            <strong>${this.calculator.formatCost(result.monthly.totalCost)}</strong><br>
            ${result.monthly.requests.toLocaleString()} requests
        `;

        yearlyEl.innerHTML = `
            <strong>${this.calculator.formatCost(result.yearly.totalCost)}</strong><br>
            ${result.yearly.requests.toLocaleString()} requests
        `;

        breakdownEl.innerHTML = `
            Input tokens: ${result.monthly.inputTokens.toLocaleString()} (${this.calculator.formatCost(result.monthly.inputCost)})<br>
            Output tokens: ${result.monthly.outputTokens.toLocaleString()} (${this.calculator.formatCost(result.monthly.outputCost)})<br>
            <strong>Total: ${result.monthly.totalCost > 0 ? this.calculator.formatCost(result.monthly.totalCost) : 'N/A'}</strong>
        `;

        resultsDiv.style.display = 'block';
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
