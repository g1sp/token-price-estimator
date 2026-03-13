/**
 * Token Price Calculator
 *
 * Responsible for:
 * - Loading pricing data
 * - Calculating costs based on tokens and pricing
 * - Generating formatted results
 */

class PriceCalculator {
    constructor() {
        this.pricingData = null;
        this.initialized = false;
    }

    /**
     * Initialize calculator and load pricing data
     * @returns {Promise<void>}
     */
    async init() {
        if (this.initialized) return;

        try {
            const response = await fetch('data/pricing.json');
            if (!response.ok) {
                throw new Error(`Failed to load pricing data: ${response.statusText}`);
            }
            this.pricingData = await response.json();
            this.initialized = true;
        } catch (error) {
            console.error('Error loading pricing data:', error);
            throw error;
        }
    }

    /**
     * Get provider data by ID
     * @param {string} providerId - 'claude', 'gemini', or 'openai'
     * @returns {Object} Provider data
     */
    getProvider(providerId) {
        if (!this.pricingData || !this.pricingData.providers[providerId]) {
            return null;
        }
        return this.pricingData.providers[providerId];
    }

    /**
     * Get all providers
     * @returns {Array} Array of provider objects
     */
    getAllProviders() {
        if (!this.pricingData) return [];
        return Object.entries(this.pricingData.providers).map(([key, value]) => ({
            id: key,
            ...value
        }));
    }

    /**
     * Calculate cost for a single model
     * @param {number} inputTokens - Number of input tokens
     * @param {number} outputTokens - Number of output tokens
     * @param {Object} model - Model object with pricing
     * @returns {Object} Cost breakdown
     */
    calculateModelCost(inputTokens, outputTokens, model) {
        const inputCost = (inputTokens / 1_000_000) * model.input_per_1m;
        const outputCost = (outputTokens / 1_000_000) * model.output_per_1m;
        const totalCost = inputCost + outputCost;

        return {
            inputCost: parseFloat(inputCost.toFixed(6)),
            outputCost: parseFloat(outputCost.toFixed(6)),
            totalCost: parseFloat(totalCost.toFixed(6))
        };
    }

    /**
     * Generate complete cost report
     * @param {number} inputTokens - Input token count
     * @param {number} outputTokens - Output token count
     * @returns {Array} Array of results per provider/model
     */
    generateReport(inputTokens, outputTokens) {
        if (!this.initialized) {
            throw new Error('Calculator not initialized');
        }

        const results = [];

        // Calculate for each provider and model
        Object.entries(this.pricingData.providers).forEach(([providerId, provider]) => {
            provider.models.forEach(model => {
                const costs = this.calculateModelCost(inputTokens, outputTokens, model);

                results.push({
                    provider: provider.name,
                    providerId: providerId,
                    providerUrl: provider.pricing_url,
                    model: model.name,
                    modelId: model.id,
                    inputTokens: inputTokens,
                    outputTokens: outputTokens,
                    inputCost: costs.inputCost,
                    outputCost: costs.outputCost,
                    totalCost: costs.totalCost
                });
            });
        });

        return results;
    }

    /**
     * Format cost as USD string
     * @param {number} cost - Cost in dollars
     * @returns {string} Formatted cost
     */
    formatCost(cost) {
        if (cost < 0.0001) {
            return '< $0.0001';
        }
        return `$${cost.toFixed(4)}`;
    }

    /**
     * Format cost as USD string with shorter notation
     * @param {number} cost - Cost in dollars
     * @returns {string} Formatted cost
     */
    formatCostShort(cost) {
        if (cost < 0.01) {
            return `$${cost.toFixed(4)}`;
        }
        if (cost < 1) {
            return `$${cost.toFixed(3)}`;
        }
        return `$${cost.toFixed(2)}`;
    }

    /**
     * Get cost category for color coding
     * @param {number} cost - Cost in dollars
     * @returns {string} Category: 'low', 'medium', or 'high'
     */
    getCostCategory(cost) {
        if (cost < 0.01) return 'low';
        if (cost < 0.10) return 'medium';
        return 'high';
    }

    /**
     * Format tokens with thousands separator
     * @param {number} tokens - Token count
     * @returns {string} Formatted tokens
     */
    formatTokens(tokens) {
        return tokens.toLocaleString();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PriceCalculator;
}
