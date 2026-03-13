/**
 * Chart Manager for Token Price Estimator
 *
 * Manages Chart.js bar chart visualization for cost comparison
 * Provides professional visualization alongside existing CSS-based charts
 */

class ChartManager {
    constructor() {
        this.costComparisonChart = null;
    }

    /**
     * Update or create the cost comparison bar chart
     * @param {Array} results - Array of cost calculation results
     */
    updateChart(results) {
        const ctx = document.getElementById('costChart');

        if (!ctx) {
            console.warn('Chart canvas not found');
            return;
        }

        // Extract labels (Model Names) and data (Total Costs)
        const labels = results.map(data => data.model);
        const costs = results.map(data => data.totalCost);
        const providers = results.map(data => data.provider);

        // Provider color mapping
        const providerColors = {
            'Claude (Anthropic)': 'rgba(116, 170, 156, 0.7)',
            'OpenAI': 'rgba(16, 163, 127, 0.7)',
            'Google Gemini': 'rgba(66, 133, 244, 0.7)'
        };

        const providerBorders = {
            'Claude (Anthropic)': 'rgb(116, 170, 156)',
            'OpenAI': 'rgb(16, 163, 127)',
            'Google Gemini': 'rgb(66, 133, 244)'
        };

        // Map colors based on provider
        const backgroundColor = providers.map(provider => providerColors[provider] || 'rgba(100, 100, 100, 0.7)');
        const borderColor = providers.map(provider => providerBorders[provider] || 'rgb(100, 100, 100)');

        // Destroy existing chart if it exists so we can draw a fresh one
        if (this.costComparisonChart) {
            this.costComparisonChart.destroy();
        }

        // Create the new bar chart
        this.costComparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Cost (USD)',
                    data: costs,
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // Horizontal bars
                plugins: {
                    legend: {
                        display: false // Hide legend since labels are on the axis
                    },
                    title: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 13 },
                        bodyFont: { size: 12 },
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                let label = 'Total Cost: ';
                                if (context.parsed.x !== null) {
                                    label += new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        minimumFractionDigits: 4,
                                        maximumFractionDigits: 4
                                    }).format(context.parsed.x);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: this.calculateMaxCost(costs),
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(4);
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y: {
                        grid: {
                            drawBorder: false,
                            color: 'transparent'
                        },
                        ticks: {
                            font: {
                                size: 11,
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Calculate appropriate max value for chart
     * @param {Array} costs - Array of cost values
     * @returns {number} Max value for chart scale
     */
    calculateMaxCost(costs) {
        if (costs.length === 0) return 1;
        const max = Math.max(...costs);
        // Add 20% padding to the top
        return max * 1.2;
    }

    /**
     * Destroy the chart instance
     */
    destroy() {
        if (this.costComparisonChart) {
            this.costComparisonChart.destroy();
            this.costComparisonChart = null;
        }
    }
}

// Create global instance
const chartManager = new ChartManager();
