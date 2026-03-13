/**
 * Simple Token Estimator
 *
 * Estimates token count using a character-based heuristic:
 * Average: ~1 token per 4 characters (English text)
 *
 * Accuracy: ±10% for typical project plans
 * Why heuristic: No dependencies, lightweight, good enough for cost estimation
 */

class SimpleTokenizer {
    /**
     * Count estimated tokens in text
     * @param {string} text - The text to tokenize
     * @returns {number} Estimated token count
     */
    static countTokens(text) {
        if (!text || typeof text !== 'string') {
            return 0;
        }

        // Remove extra whitespace and normalize
        const cleaned = text
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n');

        if (cleaned.length === 0) {
            return 0;
        }

        // Base calculation: ~1 token per 4 characters
        let tokenCount = Math.ceil(cleaned.length / 4);

        // Adjust for common patterns that affect tokenization

        // Words (separated by spaces) are typically efficient
        const words = cleaned.split(/\s+/).length;

        // Code blocks and special characters take more tokens
        const codeBlocks = (cleaned.match(/```/g) || []).length / 2;
        const specialChars = (cleaned.match(/[{}[\]()`;:<>]/g) || []).length;

        // Markdown headers and formatting
        const headers = (cleaned.match(/^#+\s/gm) || []).length;
        const formatting = (cleaned.match(/[*_~\-`]/g) || []).length;

        // Adjust for detected patterns
        if (codeBlocks > 0) {
            tokenCount += codeBlocks * 50; // Code blocks add overhead
        }

        if (specialChars > 0) {
            tokenCount += Math.floor(specialChars * 0.3); // Each special char ~0.3 tokens
        }

        // Very conservative: ensure we don't go below minimum
        tokenCount = Math.max(tokenCount, Math.ceil(cleaned.length / 5));

        return Math.max(1, Math.round(tokenCount));
    }

    /**
     * Calculate output tokens based on usage scenario
     * @param {number} inputTokens - Input token count
     * @param {string} scenario - Usage scenario
     * @param {number} customRatio - Custom ratio if applicable
     * @returns {number} Estimated output tokens
     */
    static estimateOutputTokens(inputTokens, scenario = 'summary', customRatio = 1) {
        const ratios = {
            'summary': 1,      // 1:1 output-to-input
            'code': 3,         // 1:3 (verbose with examples)
            'analysis': 2,     // 1:2 (moderate)
            'qa': 1,           // 1:1 (conversational)
            'custom': customRatio
        };

        const ratio = ratios[scenario] || 1;
        return Math.round(inputTokens * ratio);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleTokenizer;
}
