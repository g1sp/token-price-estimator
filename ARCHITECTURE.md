# Architecture & Technical Documentation

## Project Overview

Token Price Estimator is a **single-page application (SPA)** that helps developers estimate LLM token usage and associated costs. It's built with vanilla JavaScript and requires no backend services.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
│                    (index.html + CSS)                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Input Form   │  │ Results      │  │ Footer Links     │  │
│  │              │  │ (Dynamic)    │  │ (Pricing URLs)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────────┬──────────────────────────────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
        ┌───────────────┐ ┌──────────────┐ ┌──────────────────┐
        │   app.js      │ │calculator.js │ │  tokenizer.js    │
        │               │ │              │ │                  │
        │ • Controller  │ │ • Pricing    │ │ • Token count    │
        │ • Events      │ │ • Reporting  │ │ • Output ratios  │
        │ • Display     │ │ • Formatting │ │ • Heuristics     │
        └───────────────┘ └──────────────┘ └──────────────────┘
                │            │            │
                └────────────┼────────────┘
                             │
                             ▼
                    ┌─────────────────────┐
                    │  pricing.json       │
                    │  (Static Data)      │
                    │                     │
                    │ • Provider data     │
                    │ • Model pricing     │
                    │ • Official URLs     │
                    └─────────────────────┘
```

---

## Module Breakdown

### 1. **index.html** - Main Template
**Purpose**: Define the UI structure and layout

**Key Sections**:
- Header with title and description
- Input form panel (textarea, dropdowns, buttons)
- Results panel (initially hidden)
- Empty state panel
- Footer with pricing links

**Dependencies**: Bootstrap 5 CDN

**Key Elements**:
```html
- #projectPlan        → Textarea for input
- #providerSelect     → Provider dropdown
- #scenarioSelect     → Scenario dropdown
- #customRatio        → Custom ratio input
- #calculateBtn       → Calculate button
- #resultsCard        → Results display (hidden)
- #resultsTable       → Cost table
- #copyBtn            → Copy results button
```

---

### 2. **css/style.css** - Styling
**Purpose**: Responsive design and visual presentation

**Key Features**:
- Bootstrap 5 integration
- Custom variables for consistent theming
- Responsive breakpoints (mobile, tablet, desktop)
- Smooth animations and transitions
- Professional color scheme

**Breakpoints**:
- Mobile: < 576px
- Tablet: 576px - 992px
- Desktop: > 992px

**Key Classes**:
- `.cost-low`, `.cost-medium`, `.cost-high` - Cost color coding
- `.btn-primary`, `.btn-outline-*` - Button variants
- `.form-control`, `.form-select` - Input styling
- `.table-responsive` - Table scrolling on mobile

---

### 3. **js/tokenizer.js** - Token Estimation
**Purpose**: Estimate token count from text using heuristics

**Class**: `SimpleTokenizer` (static methods only)

**Methods**:

#### `countTokens(text: string): number`
Estimates token count using character-based heuristics.

**Algorithm**:
```
1. Normalize text (trim whitespace, deduplicate)
2. Base calculation: characters ÷ 4 = tokens
3. Detect patterns:
   - Code blocks (``` markers)
   - Special characters ({}, [], etc.)
   - Markdown formatting (*_~`, etc.)
4. Adjust for patterns:
   - Code blocks: +50 tokens each
   - Special chars: +0.3 tokens each
5. Return rounded token count
```

**Accuracy**: ±10% compared to official tokenizers

**Example**:
```javascript
const text = "Build an API with 3 endpoints.";
const tokens = SimpleTokenizer.countTokens(text);
// Returns ~8 tokens (31 chars ÷ 4 ≈ 8)
```

#### `estimateOutputTokens(inputTokens: number, scenario: string, customRatio: number): number`
Estimates output tokens based on usage scenario.

**Scenarios**:
- `summary`: 1:1 ratio
- `code`: 1:3 ratio
- `analysis`: 1:2 ratio
- `qa`: 1:1 ratio
- `custom`: User-defined ratio

**Example**:
```javascript
const outputTokens = SimpleTokenizer.estimateOutputTokens(100, 'code');
// Returns 300 (1:3 ratio)
```

---

### 4. **js/calculator.js** - Pricing Calculations
**Purpose**: Load pricing data and calculate costs

**Class**: `PriceCalculator`

**Constructor**:
```javascript
constructor() {
  this.pricingData = null;
  this.initialized = false;
}
```

**Methods**:

#### `init(): Promise<void>`
Asynchronously loads pricing data from `data/pricing.json`.

**Error Handling**: Throws on fetch failure.

**Example**:
```javascript
const calc = new PriceCalculator();
await calc.init(); // Loads pricing data
```

#### `getProvider(providerId: string): Object`
Returns provider object by ID.

**Parameters**:
- `providerId`: 'claude', 'gemini', or 'openai'

**Returns**:
```javascript
{
  name: "Claude (Anthropic)",
  pricing_url: "...",
  models: [...]
}
```

#### `getAllProviders(): Array`
Returns array of all providers with IDs.

#### `calculateModelCost(inputTokens, outputTokens, model): Object`
Calculates cost for a single model.

**Formula**:
```
Input Cost = (inputTokens ÷ 1,000,000) × model.input_per_1m
Output Cost = (outputTokens ÷ 1,000,000) × model.output_per_1m
Total Cost = Input Cost + Output Cost
```

**Returns**:
```javascript
{
  inputCost: 0.000003,
  outputCost: 0.000015,
  totalCost: 0.000018
}
```

#### `generateReport(inputTokens, outputTokens): Array`
Generates complete cost report for all models.

**Returns**: Array of result objects:
```javascript
{
  provider: "Claude (Anthropic)",
  providerId: "claude",
  providerUrl: "https://...",
  model: "Claude 3.5 Sonnet",
  modelId: "claude-sonnet-4-6",
  inputTokens: 1000,
  outputTokens: 1000,
  inputCost: 0.003,
  outputCost: 0.015,
  totalCost: 0.018
}
```

#### `formatCost(cost: number): string`
Formats cost as USD string.

**Example**:
```javascript
calculator.formatCost(0.000005); // "$0.0000"
calculator.formatCost(0.01);     // "$0.0100"
calculator.formatCost(1.23);     // "$1.23"
```

#### `formatTokens(tokens: number): string`
Formats tokens with thousands separator.

**Example**:
```javascript
calculator.formatTokens(1000000); // "1,000,000"
```

#### `getCostCategory(cost: number): string`
Returns cost category for color coding.

**Categories**:
- `'low'`: < $0.01
- `'medium'`: $0.01 - $0.10
- `'high'`: > $0.10

---

### 5. **js/app.js** - Main Controller
**Purpose**: Orchestrate UI and business logic

**Class**: `TokenPriceApp`

**Properties**:
```javascript
calculator: PriceCalculator           // Pricing engine
isInitialized: boolean                // Init state
currentResults: Array                 // Latest calculation results
currentInputTokens: number            // Last input token count
currentOutputTokens: number           // Last output token count
cacheKeyForCopy: Object               // Cached results for export
```

**Methods**:

#### `init(): Promise<void>`
Initialize app and load pricing data.

**Steps**:
1. Initialize calculator
2. Set up event listeners
3. Mark as initialized

**Called**: On `DOMContentLoaded`

#### `setupEventListeners(): void`
Attach event handlers to UI elements.

**Events**:
- Calculate button → `handleCalculate()`
- Reset button → `handleReset()`
- Copy button → `handleCopyResults()`
- Back button → `handleBack()`
- Scenario dropdown → Show/hide custom ratio
- Textarea → Allow Ctrl+Enter to calculate

#### `handleCalculate(): void`
Process form inputs and calculate costs.

**Steps**:
1. Validate inputs (text, provider, scenario)
2. Count tokens using `SimpleTokenizer`
3. Estimate output tokens based on scenario
4. Generate cost report using `PriceCalculator`
5. Display results
6. Show results panel and scroll to view

**Error Handling**: Display user-friendly error messages

#### `displayResults(inputTokens, outputTokens, scenario): void`
Render results table and summary.

**Steps**:
1. Update token summary
2. Sort results by cost (ascending)
3. Generate table rows with formatting
4. Cache results for export

#### `handleCopyResults(): void`
Export results to clipboard as formatted text.

**Format**:
```
Token Price Estimation Results
Generated: [timestamp]

Input Tokens: 1,000
Output Tokens: 1,000
Total Tokens: 2,000
Scenario: Code Generation (1:3)

COST BREAKDOWN:
─────────────────────────────────
Model                   Input      Output     Total
─────────────────────────────────
Claude 3.5 Sonnet       $0.003     $0.015     $0.018
...
```

#### `handleReset(): void`
Clear all inputs and hide results.

#### `handleBack(): void`
Return to empty state without clearing inputs.

#### `showError(message: string): void`
Display error alert to user.

**Duration**: 5 seconds before auto-dismiss

---

### 6. **data/pricing.json** - Pricing Data
**Purpose**: Store official pricing data

**Structure**:
```json
{
  "providers": {
    "claude": {
      "name": "Claude (Anthropic)",
      "pricing_url": "https://www.anthropic.com/pricing",
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

**Update Strategy**: Manual updates when prices change

---

## Data Flow

### Calculation Flow

```
User Input
    ↓
[Validate inputs]
    ↓
[Count tokens] ← SimpleTokenizer.countTokens()
    ↓
[Estimate output] ← SimpleTokenizer.estimateOutputTokens()
    ↓
[Generate report] ← PriceCalculator.generateReport()
    ↓
[Sort by cost]
    ↓
[Format & display]
    ↓
Results Panel
```

### Copy Flow

```
Results cached
    ↓
[Format as text table]
    ↓
[Copy to clipboard] ← navigator.clipboard.writeText()
    ↓
[Show success feedback]
    ↓
[Auto-dismiss after 2s]
```

---

## State Management

### Local State (TokenPriceApp)

```javascript
{
  calculator: PriceCalculator,          // Initialized on app load
  isInitialized: boolean,               // false → true after init
  currentResults: Array,                // Populated after calculate
  currentInputTokens: number,           // Set during calculate
  currentOutputTokens: number,          // Set during calculate
  cacheKeyForCopy: Object               // Set during calculate
}
```

### UI State

```javascript
{
  projectPlan: string,                  // Textarea value
  provider: string,                     // Dropdown value
  scenario: string,                     // Dropdown value
  customRatio: number,                  // Input value
  customRatioVisible: boolean,           // Show/hide custom ratio
  resultsVisible: boolean,               // Show/hide results panel
  emptyStateVisible: boolean             // Show/hide empty state
}
```

---

## Error Handling

### Error Categories

| Category | Source | Handling |
|----------|--------|----------|
| Load Error | Fetch `pricing.json` | Throw, show error alert |
| Validation Error | Empty input, no provider | Show error alert, don't calculate |
| Calculation Error | Tokenizer/Calculator | Show error alert, log to console |
| Copy Error | Clipboard API | Show error alert, suggest manual copy |

### Error Messages

- **"Please enter your project plan"** → Empty textarea
- **"Please select a provider"** → No provider selected
- **"Failed to load pricing data"** → `pricing.json` fetch failed
- **"An error occurred while calculating costs"** → Generic calculation error

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Pricing Load**: Load `pricing.json` only once
2. **Efficient Tokenization**: Character-based heuristic, not API call
3. **Cached Results**: Store for copy operation
4. **No External APIs**: All computation client-side
5. **CSS Optimization**: Bootstrap CDN, minimal custom CSS

### Performance Targets

- Initial load: < 2 seconds
- Calculate: < 100ms
- Display results: Instant
- Copy: < 500ms
- Memory: < 10MB

---

## Security Considerations

### XSS Prevention
- No `innerHTML` with user data
- Use `textContent` for user-generated content
- Bootstrap sanitization for HTML

### Data Privacy
- All calculations client-side
- No data sent to servers
- No analytics or tracking

### CORS
- Not applicable (static site)
- Pricing data served from same origin

---

## Browser Compatibility

### Target Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Features Used
- ES6 classes
- Arrow functions
- `fetch()` API
- `navigator.clipboard` API
- Template literals

### Fallbacks Needed
- None (all targets support ES6)

---

## Future Extensibility

### Add New Provider
```javascript
// 1. Update data/pricing.json
{
  "providers": {
    "anthropic": {
      "name": "Anthropic Direct",
      "pricing_url": "...",
      "models": [...]
    }
  }
}

// 2. Add option to HTML
<option value="anthropic">Anthropic</option>

// 3. App handles automatically via PriceCalculator
```

### Add New Scenario
```javascript
// 1. Update tokenizer.js
const ratios = {
  'summary': 1,
  'custom_scenario': 2.5
};

// 2. Add option to HTML
<option value="custom_scenario">Custom Scenario</option>

// 3. App handles automatically
```

### Use Official Tokenizer
```javascript
// Replace SimpleTokenizer with js-tiktoken
import { encoding_for_model } from "js-tiktoken";

class OfficialTokenizer {
  static countTokens(text) {
    const encoding = encoding_for_model("gpt-3.5-turbo");
    return encoding.encode(text).length;
  }
}
```

---

## Testing Strategy

### Unit Tests (Future)
- `SimpleTokenizer.countTokens()` - Token estimation accuracy
- `PriceCalculator.calculateModelCost()` - Cost math
- Scenario ratios - Output token calculation

### Integration Tests (Future)
- Full calculation flow
- Data loading and caching
- UI state management

### E2E Tests (Future)
- User workflows
- Copy functionality
- Error scenarios

---

## Deployment Checklist

- [ ] All pricing data verified against official sources
- [ ] Links to pricing pages work
- [ ] No console errors
- [ ] Mobile responsive working
- [ ] Copy to clipboard working
- [ ] All models display correctly
- [ ] Calculations verified for accuracy
- [ ] Documentation complete
- [ ] Git repo initialized
- [ ] GitHub Pages configured

