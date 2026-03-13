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
    },

    production: {
        name: "Production: Full LLM Application Stack",
        plan: `Build and deploy a production-grade LLM application

Infrastructure Setup:
- Set up cloud environment (AWS/GCP/Azure)
- Configure API gateway and load balancing
- Implement caching layer (Redis)
- Set up monitoring and logging

API Development:
- Design RESTful endpoints for LLM inference
- Implement request validation and sanitization
- Add rate limiting and authentication
- Handle concurrent requests (100+ QPS)

Performance Optimization:
- Implement request batching
- Add response caching for common queries
- Use model quantization for faster inference
- Optimize database queries

Cost Management:
- Track token usage per user/endpoint
- Implement spend limits and alerts
- A/B test models for cost vs. quality
- Monitor token efficiency metrics

Deployment & DevOps:
- Set up CI/CD pipeline
- Implement blue-green deployments
- Configure auto-scaling policies
- Add health checks and failover

Observability:
- Set up distributed tracing
- Create dashboards for latency/errors
- Log all LLM requests and responses
- Monitor model performance drift

Security:
- Implement API key rotation
- Add request encryption
- Audit logging for compliance
- DDoS protection and rate limiting`,
        provider: "claude",
        scenario: "code",
        description: "Production deployment - ~1500 input tokens"
    },

    multiagent: {
        name: "Multi-Agent: Distributed Team Orchestration",
        plan: `Design a multi-agent system for complex workflows

Architecture Planning:
- Define agent roles (researcher, analyst, writer, reviewer)
- Design inter-agent communication protocol
- Plan message queuing system
- Define error handling and retry logic

Research Agent:
- Search and retrieve relevant information
- Validate source credibility
- Summarize findings
- Handle knowledge base queries

Analysis Agent:
- Process research findings
- Identify patterns and insights
- Calculate metrics and statistics
- Generate visualizations

Writing Agent:
- Create content based on analysis
- Maintain consistent tone and style
- Structure information hierarchically
- Add citations and references

Review Agent:
- Validate factual accuracy
- Check for consistency
- Suggest improvements
- Ensure quality standards

Execution Orchestration:
- Coordinate agent workflows
- Handle dependencies between agents
- Manage agent state and context
- Log all interactions for audit trail

Monitoring & Optimization:
- Track performance of each agent
- Measure total latency and cost
- Identify bottlenecks
- Optimize agent specialization`,
        provider: "claude",
        scenario: "code",
        description: "Complex multi-agent system - ~1800 input tokens"
    },

    document: {
        name: "Document Processing: Batch Analysis Pipeline",
        plan: `Build an automated document processing system

Document Ingestion:
- Support multiple file formats (PDF, DOCX, TXT, images)
- Extract text with OCR for scanned documents
- Parse document metadata
- Handle large files (split into chunks)

Text Processing:
- Normalize and clean extracted text
- Identify document type and structure
- Segment into sections and paragraphs
- Extract key information fields

Classification & Tagging:
- Classify documents by category
- Extract relevant tags and keywords
- Identify entity types (person, location, company)
- Detect sentiment and tone

Content Extraction:
- Extract structured data from unstructured text
- Identify and link related information
- Generate summaries for each section
- Create table of contents

Quality Assurance:
- Validate extracted information
- Flag low-confidence extractions
- Cross-reference with known databases
- Manual review process for edge cases

Storage & Indexing:
- Store processed documents in database
- Create full-text search index
- Build vector embeddings for semantic search
- Set up backup and disaster recovery

API & Integration:
- Provide REST API for document submission
- Implement webhooks for status updates
- Support async processing for batch jobs
- Generate reports on processing results`,
        provider: "openai",
        scenario: "analysis",
        description: "Batch document processing - ~1600 input tokens"
    },

    chatapp: {
        name: "Chat Application: Real-time Conversational AI",
        plan: `Develop a real-time chat application with AI

Frontend Development:
- Build responsive chat UI (web, mobile)
- Implement real-time messaging with WebSockets
- Add message history and search
- Support markdown and rich formatting

Backend Architecture:
- Design stateless API endpoints
- Implement session management
- Set up message queue for reliability
- Store conversations in database

AI Integration:
- Stream LLM responses in real-time
- Maintain conversation context
- Implement typing indicators
- Handle interruptions gracefully

Conversation Management:
- Store full chat history
- Implement context windowing
- Add conversation search and retrieval
- Support multiple conversation threads

User Features:
- User authentication and profiles
- Conversation sharing and collaboration
- Custom system prompts per user
- Export conversations as PDF/JSON

Moderation & Safety:
- Content filtering for harmful inputs
- Detect and prevent prompt injection
- Log all conversations for compliance
- Implement user reporting system

Performance & Scaling:
- Handle 1000+ concurrent users
- Implement load balancing
- Optimize database queries
- Cache frequently used responses

Analytics & Monitoring:
- Track usage metrics per user
- Monitor response latency
- Measure token consumption
- Alert on unusual patterns`,
        provider: "claude",
        scenario: "code",
        description: "Real-time chat application - ~1700 input tokens"
    },

    training: {
        name: "Training: Fine-tuning Custom LLM Model",
        plan: `Plan and execute LLM fine-tuning project

Data Preparation:
- Collect and curate training dataset (10K-100K examples)
- Clean and validate training data
- Format data for fine-tuning compatibility
- Split into train/validation/test sets (80/10/10)

Data Quality:
- Remove duplicates and near-duplicates
- Validate label accuracy
- Handle class imbalance
- Augment data where needed

Fine-tuning Configuration:
- Select base model and architecture
- Choose learning rate and batch size
- Set number of epochs and early stopping
- Configure validation metrics

Training Process:
- Run fine-tuning job on GPU cluster
- Monitor loss curves and metrics
- Track token usage during training
- Implement checkpointing for recovery

Evaluation:
- Test on held-out evaluation set
- Compare against baseline model
- Measure task-specific metrics
- Analyze failure cases

Cost Analysis:
- Calculate total GPU hours consumed
- Estimate inference cost per token
- Compare vs. API-based solutions
- ROI analysis for custom model

Deployment:
- Quantize model for deployment
- Set up serving infrastructure
- Create A/B test framework
- Monitor model performance in production

Iteration:
- Collect user feedback
- Identify improvement areas
- Plan next training iteration
- Document lessons learned`,
        provider: "claude",
        scenario: "code",
        description: "Fine-tuning project planning - ~1400 input tokens"
    },

    vision: {
        name: "Vision: Image Analysis & Processing System",
        plan: `Build an AI system for image analysis and understanding

Image Ingestion:
- Accept images from multiple sources (upload, URL, API)
- Support formats: JPEG, PNG, WebP, GIF
- Implement image validation and sanitization
- Resize and optimize for model processing

Image Processing Pipeline:
- Extract visual features from images
- Perform object detection and classification
- Identify text and content within images
- Generate visual descriptions

Analysis & Understanding:
- Classify images by category
- Extract text (OCR) from images
- Identify entities in images (people, objects, scenes)
- Analyze composition and aesthetics

Multi-modal Integration:
- Combine image analysis with text queries
- Support follow-up questions about images
- Generate detailed captions and summaries
- Create structured data from visual content

Use Cases:
- Product image analysis for e-commerce
- Document scanning and processing
- Medical image analysis assistance
- Social media content moderation

API Implementation:
- Design endpoints for image submission
- Implement async processing for large batches
- Cache vision model responses
- Handle concurrent image requests

Cost Optimization:
- Batch similar images to reduce overhead
- Implement image compression before processing
- Cache analysis results for same images
- Monitor and track per-image costs

Performance & Scaling:
- Process 100+ images per second
- Maintain sub-2 second latency per image
- Support parallel image processing
- Monitor model accuracy metrics`,
        provider: "claude",
        scenario: "code",
        description: "Vision model system - ~1200 input tokens"
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
