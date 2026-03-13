# Development Guide

## Getting Started

### Prerequisites
- Text editor (VS Code, Sublime, etc.)
- Web browser (Chrome, Firefox, Safari, Edge)
- Git (for version control)
- Python 3 or Node.js (for local server)

### Installation

```bash
# Clone or download the repository
cd token-price-estimator

# Run a local server
python -m http.server 8000
# or
npx http-server

# Open browser
open http://localhost:8000
```

---

## Project Structure

```
TokenPriceEstimator/
├── index.html              # Main UI template
├── css/
│   └── style.css          # Bootstrap 5 + custom styling
├── js/
│   ├── app.js             # Main controller (500+ lines)
│   ├── calculator.js      # Pricing calculations (200+ lines)
│   └── tokenizer.js       # Token estimation (100+ lines)
├── data/
│   └── pricing.json       # Official pricing data
├── README.md              # User documentation
├── QUICKSTART.md          # 30-second setup guide
├── ARCHITECTURE.md        # Technical deep dive
├── DEVELOPMENT.md         # This file
├── TESTING.md             # Testing checklist
└── .git/                  # Git repository
```

---

## Key Files & Their Responsibilities

### index.html (410 lines)
**What it does**: Defines the UI structure and layout

**Main sections**:
- Header with title
- Input form (textarea, dropdowns, buttons)
- Results panel (hidden by default)
- Empty state panel
- Footer with pricing links

**External dependencies**:
- Bootstrap 5 CSS CDN
- Bootstrap 5 JS CDN

**Tips for editing**:
- Keep form element IDs consistent with JavaScript selectors
- Add ARIA labels for accessibility
- Use Bootstrap utility classes for responsive design

---

### css/style.css (290 lines)
**What it does**: Styling and responsive design

**Key sections**:
- CSS variables for theming
- Card and button styling
- Form input styling
- Table and results styling
- Mobile breakpoints
- Animations and transitions

**Tips for editing**:
- Update CSS variables for consistent theming
- Add breakpoints before 576px for mobile optimization
- Use flexbox/grid for responsive layouts
- Test on mobile (use Chrome DevTools)

---

### js/tokenizer.js (90 lines)
**What it does**: Estimates token count using heuristics

**Key class**: `SimpleTokenizer`

**Main methods**:
- `countTokens(text)` - Estimate tokens from text
- `estimateOutputTokens(inputTokens, scenario, customRatio)` - Estimate output tokens

**Algorithm details**:
```
1. Normalize text (trim, deduplicate whitespace)
2. Base: characters ÷ 4 = tokens
3. Detect special patterns (code blocks, special chars)
4. Adjust for patterns (code +50, special +0.3)
5. Return rounded count
```

**Tips for editing**:
- Accuracy target: ±10% compared to official tokenizers
- Test with various text types (prose, code, markdown)
- Don't make the algorithm too complex
- Document any changes to the heuristic

---

### js/calculator.js (210 lines)
**What it does**: Load pricing data and calculate costs

**Key class**: `PriceCalculator`

**Main methods**:
- `init()` - Async load pricing data
- `getProvider(providerId)` - Get provider by ID
- `calculateModelCost(inputTokens, outputTokens, model)` - Calculate cost
- `generateReport(inputTokens, outputTokens)` - Generate full report
- `formatCost(cost)` - Format as USD
- `getCostCategory(cost)` - Categorize for color coding

**Tips for editing**:
- Always await `init()` before using calculator
- Pricing formula: `(tokens ÷ 1,000,000) × price_per_1m`
- Keep formatting methods separate for reusability
- Add new providers in pricing.json, not in code

---

### js/app.js (350 lines)
**What it does**: Main controller, event handling, UI logic

**Key class**: `TokenPriceApp`

**Main methods**:
- `init()` - Initialize app on page load
- `setupEventListeners()` - Attach handlers to UI
- `handleCalculate()` - Process form and calculate
- `displayResults()` - Render results table
- `handleCopyResults()` - Export to clipboard
- `handleReset()` - Clear form

**Tips for editing**:
- Keep event handlers focused and single-purpose
- Separate display logic from business logic
- Use try-catch for error handling
- Validate user input before processing

---

### data/pricing.json (80 lines)
**What it does**: Store official pricing data

**Structure**:
```json
{
  "providers": {
    "claude": {
      "name": "Claude (Anthropic)",
      "pricing_url": "https://...",
      "models": [
        {
          "name": "Claude 3.5 Opus",
          "id": "claude-opus-4-6",
          "input_per_1m": 15.00,
          "output_per_1m": 75.00
        }
      ]
    }
  }
}
```

**Update Strategy**:
1. When provider announces pricing changes
2. Verify against official pricing page
3. Update JSON with new prices
4. Test calculations manually
5. Commit with message: "Update [provider] pricing"

---

## Common Development Tasks

### Task 1: Add a New Provider

**Steps**:

1. **Add to `data/pricing.json`**:
```json
"mistral": {
  "name": "Mistral",
  "pricing_url": "https://mistral.ai/pricing",
  "models": [
    {
      "name": "Mistral Large",
      "id": "mistral-large",
      "input_per_1m": 2.70,
      "output_per_1m": 8.10
    }
  ]
}
```

2. **Add option to `index.html`**:
```html
<option value="mistral">Mistral AI</option>
```

3. **That's it!** The app will automatically:
   - Load the new provider
   - Display all models in results
   - Calculate costs

4. **Test**:
   - Select Mistral from dropdown
   - Calculate tokens
   - Verify costs appear in results

---

### Task 2: Update Pricing

**Steps**:

1. Check official pricing page
2. Update `data/pricing.json` with new prices
3. Test calculations:
   ```
   Old: $3.00 per 1M input
   New: $3.50 per 1M input

   Test calculation:
   1000 tokens × $3.50 / 1M = $0.0035
   ```
4. Commit:
   ```bash
   git add data/pricing.json
   git commit -m "Update Claude pricing (March 2025)"
   ```

---

### Task 3: Add a New Scenario

**Steps**:

1. **Update `js/tokenizer.js`**:
```javascript
static estimateOutputTokens(inputTokens, scenario = 'summary', customRatio = 1) {
  const ratios = {
    'summary': 1,
    'code': 3,
    'analysis': 2,
    'qa': 1,
    'documentation': 2.5,  // NEW
    'custom': customRatio
  };
  // ...
}
```

2. **Add option to `index.html`**:
```html
<option value="documentation">Documentation (1:2.5)</option>
```

3. **Test**:
   - Select scenario
   - Calculate tokens
   - Verify output ratio: output ≈ input × 2.5

---

### Task 4: Fix a Bug

**Example**: Token count is inaccurate for code

**Steps**:

1. **Identify the problem**:
   - Test with sample code
   - Compare to actual count
   - Document discrepancy

2. **Update `js/tokenizer.js`**:
```javascript
// Adjust code detection logic
const codeBlocks = (cleaned.match(/```/g) || []).length / 2;
tokenCount += codeBlocks * 75;  // Increase from 50
```

3. **Test thoroughly**:
   - Test with various code samples
   - Ensure ±10% accuracy
   - Check that other text types still work

4. **Commit**:
```bash
git commit -m "Fix: Improve token counting for code blocks

- Increase code block token overhead to 75
- Update heuristic to better match gpt-3.5-turbo tokenizer
- Tested with Python, JavaScript, JSON samples
- Accuracy now within ±8%"
```

---

### Task 5: Improve Performance

**Example**: Calculations are slow

**Steps**:

1. **Profile the issue**:
```javascript
console.time('calculation');
// ... do calculation ...
console.timeEnd('calculation');
```

2. **Identify bottleneck**:
   - Is it tokenization?
   - Is it pricing lookup?
   - Is it DOM rendering?

3. **Optimize**:
```javascript
// Bad: Loop through all providers every time
results.forEach(provider => {
  provider.models.forEach(model => {
    // ... expensive operation ...
  });
});

// Good: Cache results, reuse calculations
```

4. **Verify improvement**:
   - Test calculation speed before/after
   - Aim for < 100ms total

---

## Testing Locally

### Manual Testing

```bash
# 1. Start server
python -m http.server 8000

# 2. Open in browser
open http://localhost:8000

# 3. Test scenarios
# - Empty input → Error message
# - Short text → Quick calculation
# - Long text → Verify token count
# - All providers → Show all costs
# - Copy button → Paste to verify format
```

### Testing on Mobile

```bash
# 1. Find your IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# 2. On mobile, visit
http://YOUR_IP:8000

# 3. Test:
# - Responsive layout
# - Touch-friendly buttons
# - Input handling
# - Results display
```

### Testing Different Browsers

```bash
# Chrome
open -a "Google Chrome" http://localhost:8000

# Firefox
open -a Firefox http://localhost:8000

# Safari
open -a Safari http://localhost:8000
```

---

## Git Workflow

### Making Changes

```bash
# 1. Create a branch (optional)
git checkout -b feature/add-new-provider

# 2. Make changes
# ... edit files ...

# 3. Test changes
# ... test locally ...

# 4. Stage changes
git add js/app.js data/pricing.json

# 5. Commit
git commit -m "Add Mistral provider

- Add Mistral to pricing.json
- Add HTML option for provider selection
- Tested calculation and cost display
- All scenarios working correctly"

# 6. Push (if using remote)
git push origin feature/add-new-provider
```

### Committing Best Practices

- **Clear messages**: Describe what changed and why
- **Atomic commits**: One logical change per commit
- **Test before commit**: Verify changes work
- **Reference issues**: Link to GitHub issues if applicable

---

## Debugging Tips

### Enable Browser DevTools

```javascript
// In browser console:

// Check app state
window.app.currentResults

// Check calculator
window.calculator.getAllProviders()

// Test token counting
SimpleTokenizer.countTokens("your text here")

// Test output estimation
SimpleTokenizer.estimateOutputTokens(100, 'code')

// Manual cost calculation
window.calculator.calculateModelCost(100, 100, {
  input_per_1m: 3.00,
  output_per_1m: 15.00
})
```

### Common Issues

**Issue**: Results not displaying
- Check: Is `resultsCard` visible?
- Check: Is `currentResults` populated?
- Check: No console errors?

**Issue**: Pricing looks wrong
- Check: `data/pricing.json` loaded correctly?
- Check: Model pricing values correct?
- Check: Calculation formula in calculator.js?

**Issue**: Token count seems off
- Check: Test with SimpleTokenizer directly
- Check: Heuristic using ±10% tolerance?
- Check: Special characters properly handled?

---

## Performance Optimization

### Current Performance (Targets)
- Page load: < 2 seconds
- Calculate: < 100ms
- Copy: < 500ms
- Memory: < 10MB

### Optimization Opportunities

1. **Lazy load Bootstrap CSS**:
```javascript
// Load CSS only when needed
const link = document.createElement('link');
link.href = 'bootstrap.min.css';
document.head.appendChild(link);
```

2. **Cache results more aggressively**:
```javascript
const cache = new Map();
const key = `${inputTokens}-${outputTokens}-${scenario}`;
if (cache.has(key)) return cache.get(key);
```

3. **Optimize JSON parsing**:
```javascript
// If pricing.json gets large, consider compression
const compressed = LZ4.compress(pricingData);
const decompressed = LZ4.decompress(compressed);
```

---

## Code Style & Standards

### JavaScript Style Guide

```javascript
// ✅ Good: Clear naming, proper structure
class TokenPriceApp {
  async init() {
    await this.calculator.init();
    this.setupEventListeners();
  }

  handleCalculate() {
    const text = this.getInputText();
    const tokens = SimpleTokenizer.countTokens(text);
    this.displayResults(tokens);
  }
}

// ❌ Bad: Unclear naming, mixed concerns
class App {
  init() {
    this.calc.load();
    this.setup();
  }

  calc() {
    const t = document.getElementById('txt').value;
    const toks = SimpleTokenizer.countTokens(t);
    this.show(toks);
  }
}
```

### Comments & Documentation

```javascript
// ✅ Good: Explains WHY, not WHAT
// Use heuristic instead of API to avoid external dependency
static countTokens(text) {
  // Normalize whitespace before calculation
  const cleaned = text.trim().replace(/\s+/g, ' ');
  return Math.ceil(cleaned.length / 4);
}

// ❌ Bad: Redundant with code
// Count the tokens
static countTokens(text) {
  // Set cleaned to trimmed and normalized text
  const cleaned = text.trim().replace(/\s+/g, ' ');
  // Divide length by 4 and round up
  return Math.ceil(cleaned.length / 4);
}
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] No console errors
- [ ] Pricing verified against official sources
- [ ] Links to pricing pages working
- [ ] Mobile responsive on actual devices
- [ ] Copy button working on all browsers
- [ ] Error messages clear and helpful
- [ ] Documentation updated
- [ ] README reflects all features
- [ ] QUICKSTART is accurate
- [ ] No hardcoded paths or URLs (except CDN)
- [ ] Git history is clean

---

## Resources

### Documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical deep dive
- [TESTING.md](./TESTING.md) - Testing guide
- [README.md](./README.md) - User documentation

### External Resources
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.0/)
- [MDN Web Docs](https://developer.mozilla.org/) - JavaScript reference
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - Debugging

### Provider Documentation
- [Claude Pricing](https://www.anthropic.com/pricing)
- [Gemini Pricing](https://ai.google.dev/pricing)
- [OpenAI Pricing](https://openai.com/pricing)

---

## Questions & Support

**For technical questions**, check:
1. ARCHITECTURE.md - How things work
2. TESTING.md - Known issues
3. Browser console - Error messages
4. Git history - Previous changes

**To report bugs**:
1. Describe the issue clearly
2. Include steps to reproduce
3. Provide browser/OS information
4. Check if issue already exists

**For feature requests**:
1. Check if similar feature exists
2. Describe the use case
3. Explain why it would help
4. Be open to alternatives

---

**Happy coding! 🚀**

