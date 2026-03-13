/**
 * Advanced Token Estimator - Synthesizing Best of Both Approaches
 *
 * Combines:
 * - Claude: Simple heuristic baseline + clear logic
 * - ChatGPT: Workflow modeling + realistic overhead calculations
 *
 * Supports both modes:
 * 1. Simple: Just token count from text length
 * 2. Advanced: Workflow-aware with retries, cache, retrieval overhead
 */

class AdvancedTokenizer {
    /**
     * Count estimated tokens from text (simple mode)
     * @param {string} text - The text to tokenize
     * @returns {number} Estimated token count
     */
    static countTokens(text) {
        if (!text || typeof text !== 'string') return 0;
        const cleaned = text.trim().replace(/\s+/g, ' ');
        return Math.max(1, Math.round(cleaned.length / 4));
    }

    /**
     * Advanced estimation with workflow modeling
     * @param {string} text - Plan text
     * @param {Object} options - Advanced options
     * @returns {Object} Detailed token breakdown
     */
    static advancedEstimate(text, options = {}) {
        const {
            workflow = 'simple',     // 'simple', 'rag', 'agentic'
            runs = 1,
            retryRate = 0.0,         // 0-3, e.g. 0.15 = 15% retry rate
            cacheHitRatio = 0.0,     // 0-1, e.g. 0.25 = 25% cached
            outputSize = 'medium',   // 'small', 'medium', 'large'
            includeRetrieval = false,
            retrievalTokensPerStep = 2400,
            toolOverheadPerCall = 500
        } = options;

        // Infer structure from text
        const stats = this._inferPlanStats(text);

        // Workflow multipliers
        const workflowMultipliers = {
            simple: { calls: 1.0, input: 1.0, output: 1.0 },
            rag: { calls: 1.2, input: 1.15, output: 1.1 },
            agentic: { calls: 1.6, input: 1.25, output: 1.25 }
        };

        const multipliers = workflowMultipliers[workflow] || workflowMultipliers.simple;
        const steps = Math.max(stats.explicitSteps, 1);
        const totalCalls = runs * steps * multipliers.calls * (1 + retryRate);

        // Input token calculation
        const baseInputTokens = runs * steps * 1800 * multipliers.input;
        const retrievalInputTokens = includeRetrieval ? (runs * stats.retrievalSteps * retrievalTokensPerStep) : 0;
        const toolOverheadTokens = totalCalls * toolOverheadPerCall;
        const totalInputTokens = baseInputTokens + retrievalInputTokens + toolOverheadTokens;

        // Output token calculation
        const outputSizeMap = { small: 700, medium: 1400, large: 2600 };
        const baseOutputTokens = runs * steps * outputSizeMap[outputSize] * multipliers.output;
        const totalOutputTokens = Math.round(baseOutputTokens * (1 + retryRate));

        // Cache split
        const cachedInputTokens = Math.round(totalInputTokens * cacheHitRatio);
        const uncachedInputTokens = Math.max(0, totalInputTokens - cachedInputTokens);

        return {
            stats,
            uncachedInputTokens: Math.round(uncachedInputTokens),
            cachedInputTokens: Math.round(cachedInputTokens),
            totalInputTokens: Math.round(totalInputTokens),
            outputTokens: Math.round(totalOutputTokens),
            breakdown: {
                baseInputTokens: Math.round(baseInputTokens),
                retrievalInputTokens: Math.round(retrievalInputTokens),
                toolOverheadTokens: Math.round(toolOverheadTokens),
                baseOutputTokens: Math.round(baseOutputTokens)
            },
            metadata: {
                workflow,
                runs,
                steps,
                totalCalls,
                retryRate,
                cacheHitRatio,
                outputSize
            }
        };
    }

    /**
     * Infer plan structure from text (ChatGPT's approach)
     * @private
     */
    static _inferPlanStats(text) {
        const lower = text.toLowerCase();

        // Count explicit steps
        const stepPatterns = [
            /\bstep\s*\d+/gi,
            /\bphase\s*\d+/gi,
            /^\s*[-*]\s+/gm,
            /^\s*\d+[.)]\s+/gm
        ];
        const explicitSteps = Math.max(
            stepPatterns.reduce((sum, p) => sum + (lower.match(p) || []).length, 0),
            1
        );

        // Detect workflow hints
        const retrievalHints = this._countMatches(lower, [
            /\brag\b/g, /retriev/g, /search/g, /lookup/g, /docs?/g, /knowledge base/g
        ]);

        const criticHints = this._countMatches(lower, [
            /critic/g, /verify/g, /review/g, /revise/g, /qa/g, /validation/g, /test/g
        ]);

        const codingHints = this._countMatches(lower, [
            /code/g, /implement/g, /function/g, /api/g, /debug/g
        ]);

        const planningHints = this._countMatches(lower, [
            /plan/g, /strategy/g, /breakdown/g, /task/g, /roadmap/g
        ]);

        let retrievalSteps = Math.min(Math.max(retrievalHints, 0), explicitSteps);
        let criticSteps = Math.min(Math.max(criticHints, 0), explicitSteps);

        if (retrievalHints === 0 && lower.includes('research')) {
            retrievalSteps = Math.max(retrievalSteps, 1);
        }
        if (criticHints === 0 && lower.includes('final')) {
            criticSteps = Math.max(criticSteps, 1);
        }

        return {
            explicitSteps,
            retrievalSteps,
            criticSteps,
            codingHints,
            planningHints
        };
    }

    /**
     * Count pattern matches in text
     * @private
     */
    static _countMatches(text, patterns) {
        let count = 0;
        for (const pattern of patterns) {
            const matches = text.match(pattern) || [];
            count += matches.length;
        }
        return count;
    }

    /**
     * Estimate output tokens based on scenario
     * @param {number} inputTokens - Input token count
     * @param {string} scenario - Scenario type
     * @param {number} customRatio - Custom ratio if applicable
     * @returns {number} Estimated output tokens
     */
    static estimateOutputTokens(inputTokens, scenario = 'summary', customRatio = 1) {
        const ratios = {
            'summary': 1,
            'code': 3,
            'analysis': 2,
            'qa': 1,
            'custom': customRatio
        };

        const ratio = ratios[scenario] || 1;
        return Math.round(inputTokens * ratio);
    }

    /**
     * Get workflow description for UI
     */
    static getWorkflowDescription(workflow) {
        const descriptions = {
            simple: 'Direct model calls, minimal overhead',
            rag: 'Retrieval-augmented generation (docs lookup)',
            agentic: 'Multi-step planning with critic review'
        };
        return descriptions[workflow] || 'Unknown workflow';
    }

    /**
     * Get workflow multiplier info
     */
    static getWorkflowMultipliers(workflow) {
        const multipliers = {
            simple: { calls: 1.0, input: 1.0, output: 1.0, description: 'Direct calls' },
            rag: { calls: 1.2, input: 1.15, output: 1.1, description: 'RAG adds retrieval overhead' },
            agentic: { calls: 1.6, input: 1.25, output: 1.25, description: 'Agentic adds planning/critique' }
        };
        return multipliers[workflow] || multipliers.simple;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedTokenizer;
}
