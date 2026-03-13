# Testing & Verification Guide

## Manual Testing Checklist

### 1. Application Launch
- [ ] Open `index.html` in browser
- [ ] No console errors
- [ ] UI loads with all sections visible
- [ ] Bootstrap styling applied correctly

### 2. Form Inputs
- [ ] Provider dropdown shows 3 options (Claude, Gemini, OpenAI)
- [ ] Textarea accepts text input
- [ ] Scenario dropdown shows 5 options
- [ ] Custom ratio input appears only when "Custom Ratio" selected
- [ ] Buttons are visible and clickable

### 3. Token Calculation
- [ ] Empty input shows error message
- [ ] No provider selected shows error message
- [ ] Short text (100 chars) calculates tokens
- [ ] Long text (5000+ chars) calculates tokens
- [ ] Token count is reasonable (±10% of 1 token per 4 chars)

### 4. Pricing Calculations
- [ ] Results table displays after calculation
- [ ] All 9+ models appear in results
- [ ] Cost values are positive numbers
- [ ] Input cost + output cost = total cost
- [ ] Claude Opus has highest cost
- [ ] Gemini Flash has lowest cost
- [ ] Costs match official pricing (within 0.01% tolerance)

### 5. Scenario Handling
- [ ] Summary: Output ≈ Input tokens (1:1)
- [ ] Code Generation: Output ≈ 3× Input tokens (1:3)
- [ ] Data Analysis: Output ≈ 2× Input tokens (1:2)
- [ ] Chat/Q&A: Output ≈ Input tokens (1:1)
- [ ] Custom: Output = Input × custom ratio

### 6. UI Controls
- [ ] Calculate button triggers calculation
- [ ] Reset button clears all inputs
- [ ] Copy button exports results to clipboard
- [ ] Back button returns to empty state
- [ ] Ctrl+Enter in textarea triggers calculation

### 7. Results Display
- [ ] Summary card shows input/output/total tokens
- [ ] Results sorted by total cost (ascending)
- [ ] Model names and providers displayed correctly
- [ ] Costs formatted with proper decimal places
- [ ] Table responsive on mobile (2-3 columns)

### 8. Responsive Design
- [ ] Desktop (1200px+): Full layout, side-by-side panels
- [ ] Tablet (768px-1199px): Stacked panels, readable
- [ ] Mobile (< 768px): Single column, touch-friendly buttons
- [ ] Text readable at all sizes
- [ ] No horizontal scrolling on mobile

### 9. Data Validation
- [ ] Pricing data loads from `data/pricing.json`
- [ ] No hard-coded prices in JS files
- [ ] All pricing URLs are valid and accessible
- [ ] Price format is USD (e.g., $0.0015)
- [ ] Token counts use correct formatting (e.g., 1,234)

### 10. Browser Compatibility
- [ ] Chrome 90+ - ✅
- [ ] Firefox 88+ - ✅
- [ ] Safari 14+ - ✅
- [ ] Edge 90+ - ✅

---

## Unit Testing (Manual)

### Test Case 1: Simple Text
```
Input: "Hello world"
Expected: ~3 tokens
Actual: ?
```

### Test Case 2: Code Block
```
Input: """
def hello():
    print("Hello")
"""
Expected: ~20 tokens (code has more overhead)
Actual: ?
```

### Test Case 3: Large Project Plan
```
Input: [Paste large technical spec]
Expected: 5000-10000 tokens
Actual: ?
Tolerance: ±10%
```

### Test Case 4: Price Calculation
```
Provider: Claude Sonnet
Input Tokens: 1000
Output Tokens: 1000
Scenario: Chat (1:1)

Expected Costs:
- Input: (1000 / 1,000,000) × $3.00 = $0.000003
- Output: (1000 / 1,000,000) × $15.00 = $0.000015
- Total: $0.000018

Actual: ?
```

### Test Case 5: Copy Results
```
Steps:
1. Calculate tokens
2. Click "Copy Results"
3. Paste to text editor
4. Verify format is readable table
```

---

## Pricing Verification

### Claude Pricing (as of March 2025)
- **Opus**: Input $15/1M, Output $75/1M
- **Sonnet**: Input $3/1M, Output $15/1M
- **Haiku**: Input $0.80/1M, Output $4/1M

Source: https://www.anthropic.com/pricing

### Gemini Pricing (as of March 2025)
- **Gemini 2.0 Flash**: Input $0.075/1M, Output $0.30/1M
- **Gemini 1.5 Pro**: Input $1.50/1M, Output $6/1M
- **Gemini 1.5 Flash**: Input $0.075/1M, Output $0.30/1M

Source: https://ai.google.dev/pricing

### OpenAI Pricing (as of March 2025)
- **GPT-4o**: Input $2.50/1M, Output $10/1M
- **GPT-4 Turbo**: Input $10/1M, Output $30/1M
- **GPT-3.5 Turbo**: Input $0.50/1M, Output $1.50/1M

Source: https://openai.com/pricing

---

## Performance Testing

### Load Time
- [ ] Page loads in < 2 seconds
- [ ] All resources (CSS, JS) load successfully
- [ ] No blocking scripts

### Calculation Speed
- [ ] Token calculation < 50ms for typical text
- [ ] Cost calculation < 100ms for all models
- [ ] Results display instantly (no lag)

### Memory
- [ ] No memory leaks
- [ ] Multiple calculations don't increase memory
- [ ] App remains responsive after 10+ calculations

---

## Accessibility Testing

- [ ] All form inputs have labels
- [ ] Buttons have clear text
- [ ] Color not the only indicator (success/error states)
- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Error messages are clear

---

## Security Testing

- [ ] No user data sent to external servers
- [ ] No XSS vulnerabilities (test with HTML injection)
- [ ] No local storage issues
- [ ] CORS not required (static site)
- [ ] Links open in new tabs safely

---

## Test Results Template

```markdown
## Test Run: [Date]

**Browser**: [Chrome/Firefox/Safari/Edge] [Version]
**OS**: [Windows/macOS/Linux]
**Screen Size**: [1920x1080 / 768x1024 / 375x812]

### Passed ✅
- Item 1
- Item 2

### Failed ❌
- Item 1
  - Error: [description]
  - Steps to reproduce: [steps]

### Warnings ⚠️
- Item 1
  - Note: [description]
```

---

## Known Limitations

1. **Token Estimation Accuracy**: ±10% (uses heuristic, not official tokenizer)
2. **No Real-Time Pricing Updates**: Manual updates required
3. **No Historical Data**: Can't compare pricing over time
4. **No Batch Processing**: One plan at a time

---

## Future Test Coverage

- [ ] Add Jest/Vitest unit tests
- [ ] Add E2E tests with Playwright
- [ ] Integrate with CI/CD for automated testing
- [ ] Load testing with 1000+ simultaneous users
- [ ] A/B testing for UI improvements
