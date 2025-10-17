#!/usr/bin/env node

/**
 * DealFlow MCP Server
 * Model Context Protocol server for AI-powered real estate analysis
 */

const Groq = require('groq-sdk');
const PropertyCalculator = require('./utils/calculator');
const aiAgent = require('./services/aiAgent');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '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',
});

class DealFlowMCPServer {
  constructor() {
    this.tools = {
      analyze_property: this.analyzeProperty.bind(this),
      get_market_data: this.getMarketData.bind(this),
      compare_properties: this.compareProperties.bind(this),
    };
  }

  /**
   * Analyze a property investment
   */
  async analyzeProperty(params) {
    try {
      const {
        address,
        city,
        state,
        zipCode,
        purchasePrice,
        monthlyRent,
        downPaymentPercent = 20,
        interestRate = 7,
        loanTerm = 30,
        propertyTax = 0,
        insurance = 0,
        hoaFees = 0,
        maintenancePercent = 1,
        vacancyPercent = 5,
        propertyManagementPercent = 10,
      } = params;

      // Calculate financial metrics
      const calculator = new PropertyCalculator({
        purchasePrice,
        downPaymentPercent,
        interestRate,
        loanTerm,
        monthlyRent,
        propertyTax,
        insurance,
        hoaFees,
        maintenancePercent,
        vacancyPercent,
        propertyManagementPercent,
      });

      const analysis = calculator.getFullAnalysis();

      // Get AI insights
      const aiInsights = await aiAgent.analyzeProperty(
        { address, city, state, zipCode, purchasePrice, monthlyRent },
        analysis
      );

      return {
        success: true,
        property: {
          address,
          city,
          state,
          zipCode,
        },
        financialMetrics: analysis,
        aiInsights,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get market data for a location
   */
  async getMarketData(params) {
    try {
      const { city, state } = params;

      const marketSentiment = await aiAgent.getMarketSentiment(city, state);
      const demographics = await aiAgent.getDemographicInsights(city, state, '');

      return {
        success: true,
        location: { city, state },
        marketSentiment,
        demographics,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Compare multiple properties
   */
  async compareProperties(params) {
    try {
      const { properties } = params;

      const comparisons = await Promise.all(
        properties.map(async (prop) => {
          const calculator = new PropertyCalculator(prop);
          const analysis = calculator.getFullAnalysis();
          return {
            property: prop,
            analysis,
          };
        })
      );

      // Rank properties by ROI
      comparisons.sort((a, b) => b.analysis.metrics.roi - a.analysis.metrics.roi);

      return {
        success: true,
        comparisons,
        bestDeal: comparisons[0],
        ranking: comparisons.map((c, idx) => ({
          rank: idx + 1,
          address: c.property.address,
          roi: c.analysis.metrics.roi,
          cashFlow: c.analysis.monthlyNumbers.cashFlow,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle MCP protocol messages
   */
  async handleMessage(message) {
    try {
      const { method, params } = JSON.parse(message);

      if (method === 'list_tools') {
        return JSON.stringify({
          tools: Object.keys(this.tools).map((name) => ({
            name,
            description: `DealFlow tool: ${name}`,
          })),
        });
      }

      if (method === 'call_tool') {
        const { tool, arguments: args } = params;
        const toolFunc = this.tools[tool];

        if (!toolFunc) {
          throw new Error(`Tool not found: ${tool}`);
        }

        const result = await toolFunc(args);
        return JSON.stringify(result);
      }

      throw new Error(`Unknown method: ${method}`);
    } catch (error) {
      return JSON.stringify({
        error: error.message,
      });
    }
  }

  /**
   * Start MCP server
   */
  start() {
    console.log('🚀 DealFlow MCP Server started');
    console.log('📊 Available tools:', Object.keys(this.tools).join(', '));

    process.stdin.on('data', async (data) => {
      const response = await this.handleMessage(data.toString());
      process.stdout.write(response + '\n');
    });
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new DealFlowMCPServer();
  server.start();
}

module.exports = DealFlowMCPServer;
