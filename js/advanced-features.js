/**
 * Advanced Features for Token Price Estimator
 *
 * Includes:
 * - Vision model cost calculations
 * - Function call overhead estimator
 * - Batch vs Real-time cost comparison
 */

// Vision Model Pricing Data
const VISION_PRICING = {
    claude: {
        "claude-opus-4-6": {
            image_input_tokens_per_1m: 7.50,  // $7.50 per million image tokens
            description: "Image tokens for Claude 3.5 Opus"
        },
        "claude-sonnet-4-6": {
            image_input_tokens_per_1m: 1.50,  // $1.50 per million image tokens
            description: "Image tokens for Claude 3.5 Sonnet"
        },
        "claude-haiku-4-5": {
            image_input_tokens_per_1m: 0.30,  // $0.30 per million image tokens
            description: "Image tokens for Claude 3.5 Haiku"
        }
    },
    openai: {
        "gpt-4o": {
            image_input_tokens_per_1m: 2.50,  // $2.50 per million image tokens
            image_output_tokens_per_1m: 10.00,
            description: "Image tokens for GPT-4o"
        },
        "gpt-4-turbo": {
            image_input_tokens_per_1m: 10.00,
            image_output_tokens_per_1m: 30.00,
            description: "Image tokens for GPT-4 Turbo"
        }
    },
    gemini: {
        "gemini-2-flash": {
            image_input_tokens_per_1m: 0.075,
            description: "Image tokens for Gemini 2.0 Flash"
        },
        "gemini-1.5-pro": {
            image_input_tokens_per_1m: 1.50,
            description: "Image tokens for Gemini 1.5 Pro"
        }
    }
};

/**
 * Calculate vision model costs
 * @param {number} numImages - Number of images
 * @param {number} tokensPerImage - Average tokens per image (768 for 1024x1024 image)
 * @param {string} modelId - Model ID
 * @returns {Object} Cost breakdown
 */
function calculateVisionCost(numImages, tokensPerImage, modelId) {
    const totalImageTokens = numImages * tokensPerImage;

    // Find the model in VISION_PRICING
    for (const [provider, models] of Object.entries(VISION_PRICING)) {
        if (models[modelId]) {
            const model = models[modelId];
            const imageCost = (totalImageTokens / 1_000_000) * model.image_input_tokens_per_1m;
            return {
                provider,
                modelId,
                numImages,
                tokensPerImage,
                totalImageTokens,
                imageCost: parseFloat(imageCost.toFixed(6)),
                description: model.description
            };
        }
    }

    return null;
}

/**
 * Calculate function call overhead
 * @param {number} numFunctionCalls - Number of function/tool calls
 * @param {number} avgTokensPerCall - Average tokens added per call (default 250)
 * @param {number} baseInputTokens - Base input tokens
 * @param {number} baseOutputTokens - Base output tokens
 * @returns {Object} Overhead breakdown
 */
function calculateFunctionCallOverhead(numFunctionCalls, avgTokensPerCall = 250, baseInputTokens = 0, baseOutputTokens = 0) {
    const overheadTokens = numFunctionCalls * avgTokensPerCall;
    const totalInputTokens = baseInputTokens + overheadTokens;

    return {
        numFunctionCalls,
        avgTokensPerCall,
        overheadTokens,
        baseInputTokens,
        baseOutputTokens,
        totalInputTokens,
        percentageIncrease: baseInputTokens > 0 ? (overheadTokens / baseInputTokens * 100).toFixed(1) : 100,
        description: `${numFunctionCalls} function calls × ${avgTokensPerCall} tokens = ${overheadTokens} overhead tokens`
    };
}

/**
 * Compare batch vs real-time costs
 * @param {number} numRequests - Number of requests
 * @param {number} inputTokensPerRequest - Input tokens per request
 * @param {number} outputTokensPerRequest - Output tokens per request
 * @param {number} inputPrice - Input price per million tokens
 * @param {number} outputPrice - Output price per million tokens
 * @returns {Object} Cost comparison
 */
function compareBatchVsRealtime(numRequests, inputTokensPerRequest, outputTokensPerRequest, inputPrice, outputPrice) {
    const totalInputTokens = numRequests * inputTokensPerRequest;
    const totalOutputTokens = numRequests * outputTokensPerRequest;

    // Real-time pricing (100% cost)
    const realtimeInputCost = (totalInputTokens / 1_000_000) * inputPrice;
    const realtimeOutputCost = (totalOutputTokens / 1_000_000) * outputPrice;
    const realtimeTotalCost = realtimeInputCost + realtimeOutputCost;

    // Batch pricing (50% discount)
    const batchInputCost = realtimeInputCost * 0.5;
    const batchOutputCost = realtimeOutputCost * 0.5;
    const batchTotalCost = batchInputCost + batchOutputCost;

    // Savings
    const savings = realtimeTotalCost - batchTotalCost;
    const savingsPercent = (savings / realtimeTotalCost * 100).toFixed(1);

    return {
        numRequests,
        inputTokensPerRequest,
        outputTokensPerRequest,
        totalInputTokens,
        totalOutputTokens,
        realtime: {
            inputCost: parseFloat(realtimeInputCost.toFixed(6)),
            outputCost: parseFloat(realtimeOutputCost.toFixed(6)),
            totalCost: parseFloat(realtimeTotalCost.toFixed(6))
        },
        batch: {
            inputCost: parseFloat(batchInputCost.toFixed(6)),
            outputCost: parseFloat(batchOutputCost.toFixed(6)),
            totalCost: parseFloat(batchTotalCost.toFixed(6)),
            waitTime: "24 hours"
        },
        comparison: {
            savings: parseFloat(savings.toFixed(6)),
            savingsPercent,
            recommendBatch: savings > 5  // Recommend batch if savings > $5
        }
    };
}

/**
 * Calculate retry cost multiplier
 * @param {number} successRate - Success rate (0-1, e.g., 0.95 = 95%)
 * @param {number} baseCost - Base cost per request
 * @returns {Object} Effective cost breakdown
 */
function calculateRetryOverhead(successRate, baseCost) {
    const failureRate = 1 - successRate;
    const expectedAttempts = 1 / successRate;
    const effectiveCost = baseCost * expectedAttempts;
    const overhead = effectiveCost - baseCost;

    return {
        successRate: (successRate * 100).toFixed(1),
        failureRate: (failureRate * 100).toFixed(1),
        expectedAttempts: expectedAttempts.toFixed(2),
        baseCost,
        effectiveCost: parseFloat(effectiveCost.toFixed(6)),
        retryOverhead: parseFloat(overhead.toFixed(6)),
        retryOverheadPercent: (overhead / baseCost * 100).toFixed(1)
    };
}

/**
 * Budget-based capacity planner
 * @param {number} monthlyBudget - Monthly budget in USD
 * @param {number} inputTokensPerRequest - Input tokens per request
 * @param {number} outputTokensPerRequest - Output tokens per request
 * @param {number} inputPrice - Input price per million tokens
 * @param {number} outputPrice - Output price per million tokens
 * @returns {Object} Capacity breakdown
 */
function calculateBudgetCapacity(monthlyBudget, inputTokensPerRequest, outputTokensPerRequest, inputPrice, outputPrice) {
    // Cost per request
    const costPerRequest = (inputTokensPerRequest / 1_000_000) * inputPrice + (outputTokensPerRequest / 1_000_000) * outputPrice;

    if (costPerRequest <= 0) {
        return {
            error: "Invalid pricing data"
        };
    }

    // Calculate capacity
    const maxRequestsPerMonth = Math.floor(monthlyBudget / costPerRequest);
    const requestsPerDay = Math.floor(maxRequestsPerMonth / 30);
    const requestsPerHour = Math.floor(requestsPerDay / 24);
    const requestsPerSecond = (requestsPerHour / 3600).toFixed(2);

    // Calculate total tokens
    const totalInputTokens = maxRequestsPerMonth * inputTokensPerRequest;
    const totalOutputTokens = maxRequestsPerMonth * outputTokensPerRequest;
    const totalTokens = totalInputTokens + totalOutputTokens;

    // Capacity for different user counts
    const requestsPerUserPerMonth = 30; // Assume 30 requests per user per month
    const maxActiveUsers = Math.floor(maxRequestsPerMonth / requestsPerUserPerMonth);

    // Cost breakdown
    const inputCost = (totalInputTokens / 1_000_000) * inputPrice;
    const outputCost = (totalOutputTokens / 1_000_000) * outputPrice;

    return {
        monthlyBudget,
        costPerRequest: parseFloat(costPerRequest.toFixed(6)),
        totalRequestsPerMonth: maxRequestsPerMonth,
        requestsPerDay,
        requestsPerHour,
        requestsPerSecond,
        totalInputTokens,
        totalOutputTokens,
        totalTokens,
        maxActiveUsers,
        requestsPerUserPerMonth,
        breakdown: {
            inputCost: parseFloat(inputCost.toFixed(6)),
            outputCost: parseFloat(outputCost.toFixed(6)),
            totalCost: parseFloat((inputCost + outputCost).toFixed(6))
        }
    };
}

/**
 * Monthly spend projector
 * @param {number} requestsPerDay - Requests per day
 * @param {number} inputTokensPerRequest - Input tokens per request
 * @param {number} outputTokensPerRequest - Output tokens per request
 * @param {number} inputPrice - Input price per million tokens
 * @param {number} outputPrice - Output price per million tokens
 * @returns {Object} Monthly spend projection
 */
function projectMonthlySpend(requestsPerDay, inputTokensPerRequest, outputTokensPerRequest, inputPrice, outputPrice) {
    const costPerRequest = (inputTokensPerRequest / 1_000_000) * inputPrice + (outputTokensPerRequest / 1_000_000) * outputPrice;

    const dailyCost = requestsPerDay * costPerRequest;
    const monthlyCost = dailyCost * 30;
    const yearlyCost = monthlyCost * 12;

    const dailyInputTokens = requestsPerDay * inputTokensPerRequest;
    const dailyOutputTokens = requestsPerDay * outputTokensPerRequest;
    const monthlyInputTokens = dailyInputTokens * 30;
    const monthlyOutputTokens = dailyOutputTokens * 30;

    const monthlyInputCost = (monthlyInputTokens / 1_000_000) * inputPrice;
    const monthlyOutputCost = (monthlyOutputTokens / 1_000_000) * outputPrice;

    return {
        requestsPerDay,
        costPerRequest: parseFloat(costPerRequest.toFixed(6)),
        daily: {
            requests: requestsPerDay,
            inputTokens: dailyInputTokens,
            outputTokens: dailyOutputTokens,
            cost: parseFloat(dailyCost.toFixed(6))
        },
        monthly: {
            requests: requestsPerDay * 30,
            inputTokens: monthlyInputTokens,
            outputTokens: monthlyOutputTokens,
            inputCost: parseFloat(monthlyInputCost.toFixed(6)),
            outputCost: parseFloat(monthlyOutputCost.toFixed(6)),
            totalCost: parseFloat(monthlyCost.toFixed(6))
        },
        yearly: {
            requests: requestsPerDay * 365,
            totalCost: parseFloat(yearlyCost.toFixed(6))
        }
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateVisionCost,
        calculateFunctionCallOverhead,
        compareBatchVsRealtime,
        calculateRetryOverhead,
        calculateBudgetCapacity,
        projectMonthlySpend,
        VISION_PRICING
    };
}
