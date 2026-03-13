/**
 * Test Templates for Token Price Estimator
 * Provides pre-configured project plans for quick testing
 */

const TEST_TEMPLATES = {
    simple: {
        name: "Simple: REST API Authentication",
        plan: `Build a simple REST API for user authentication

Step 1: Design the database schema (users table with email, password hash, created_at)
Step 2: Implement authentication endpoints (login, register, logout)
Step 3: Add JWT token generation and validation
Step 4: Create middleware for protecting routes
Step 5: Write unit tests for all endpoints
Step 6: Deploy to production

Expected output: Code examples, documentation, and test cases`,
        provider: "claude",
        scenario: "code",
        description: "Basic project - ~200 input tokens"
    },

    rag: {
        name: "RAG: Customer Support Pipeline",
        plan: `Build a retrieval-augmented generation (RAG) system for customer support

Step 1: Planner analyzes customer question and creates search strategy
Step 2: Retriever searches company knowledge base and documentation
Step 3: Retriever fetches relevant product guides and FAQ entries
Step 4: Generator synthesizes response using retrieved context
Step 5: Critic reviews response for accuracy and completeness
Step 6: Critic requests revisions if needed
Step 7: Finalizer produces polished customer-ready response
Step 8: System logs interaction for future improvement

Architecture considerations:
- Need to handle 1000+ concurrent requests
- Knowledge base contains 50,000+ documents
- Average response time must be under 5 seconds
- Must track retrieval accuracy metrics`,
        provider: "claude",
        scenario: "code",
        description: "Complex RAG workflow - ~900 input tokens"
    },

    analysis: {
        name: "Data Analysis: Quarterly Metrics",
        plan: `Implement automated data analysis pipeline for quarterly business metrics

Phase 1: Data Collection
- Retrieve sales data from CRM system
- Fetch customer engagement metrics
- Download marketing campaign performance
- Import financial transaction logs

Phase 2: Data Cleaning & Validation
- Remove duplicates and handle missing values
- Validate data types and ranges
- Flag anomalies for review
- Generate data quality report

Phase 3: Analysis & Insights
- Calculate KPIs (revenue, conversion rate, customer lifetime value)
- Generate trend analysis
- Identify patterns and outliers
- Create visualizations and dashboards

Phase 4: Reporting
- Draft executive summary
- Create detailed findings report
- Generate presentation slides
- Prepare recommendations for stakeholders

Phase 5: Deployment
- Set up automated weekly reports
- Configure alerts for critical metrics
- Document all processes
- Train team on using the system`,
        provider: "openai",
        scenario: "analysis",
        description: "Medium complexity - ~700 input tokens"
    },

    minimal: {
        name: "Minimal: Weather App Homepage",
        plan: `Create a weather app homepage

Step 1: Design UI mockup
Step 2: Build HTML structure
Step 3: Add CSS styling
Step 4: Implement weather API integration
Step 5: Test on mobile devices`,
        provider: "gemini",
        scenario: "code",
        description: "Simple project - ~75 input tokens"
    },

    agentic: {
        name: "Agentic: Code Review System",
        plan: `Build an AI-powered code review system

Requirements Analysis Phase:
- Define code quality standards
- Establish review checklist
- Document best practices

Planning Phase:
- Create review strategy
- Plan analysis sequence
- Prepare evaluation criteria

Execution Phase:
- Analyze code structure and architecture
- Check for performance issues
- Review security vulnerabilities
- Test error handling

Quality Review Phase:
- Reviewer assesses analysis quality
- Identifies missed issues
- Requests deeper analysis if needed
- Validates findings

Synthesis Phase:
- Compile detailed review report
- Generate actionable recommendations
- Create improvement roadmap
- Document patterns for future reviews

Deployment & Monitoring:
- Integrate with CI/CD pipeline
- Set up automatic code scanning
- Track review accuracy metrics
- Iterate based on feedback

Team Training:
- Educate team on review process
- Provide examples and case studies
- Set expectations for code quality
- Establish review SLAs`,
        provider: "claude",
        scenario: "code",
        description: "Complex agentic workflow - ~2000 input tokens"
    }
};

/**
 * Load a template into the form
 * @param {string} templateId - The ID of the template to load
 */
function loadTemplate(templateId) {
    if (!templateId || !TEST_TEMPLATES[templateId]) {
        return;
    }

    const template = TEST_TEMPLATES[templateId];

    // Set project plan
    const planTextarea = document.getElementById('projectPlan');
    if (planTextarea) {
        planTextarea.value = template.plan;
        planTextarea.style.height = 'auto';
        planTextarea.style.height = planTextarea.scrollHeight + 'px';
    }

    // Set scenario
    const scenarioSelect = document.getElementById('scenarioSelect');
    if (scenarioSelect) {
        scenarioSelect.value = template.scenario;
    }

    // Hide custom ratio if not needed
    const customRatioDiv = document.getElementById('customRatioDiv');
    if (customRatioDiv && template.scenario !== 'custom') {
        customRatioDiv.style.display = 'none';
    }

    // Show notification
    showTemplateNotification(template.name, template.description);
}

/**
 * Show a notification that template was loaded
 * @param {string} templateName - Name of the template
 * @param {string} description - Template description
 */
function showTemplateNotification(templateName, description) {
    // Create and show toast notification
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        <strong>✅ Template Loaded:</strong> ${templateName}<br>
        <small>${description}</small>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Insert at top of container
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

/**
 * Initialize template selector
 */
function initializeTemplates() {
    const templateSelect = document.getElementById('templateSelect');
    if (templateSelect) {
        templateSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                loadTemplate(e.target.value);
                // Reset selector after loading
                setTimeout(() => {
                    e.target.value = '';
                }, 100);
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeTemplates);
