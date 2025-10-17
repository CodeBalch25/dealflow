const Groq = require('groq-sdk');
const { HfInference } = require('@huggingface/inference');

// Initialize AI clients
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

/**
 * AI Agent for Property Investment Analysis
 * Provides "ultra think" reasoning and market intelligence
 */
class PropertyAIAgent {
  constructor() {
    this.model = 'llama-3.3-70b-versatile'; // Groq's most powerful model
  }

  /**
   * Ultra Think Analysis - Deep AI reasoning about investment decision
   */
  async ultraThinkAnalysis(propertyData, calculatedMetrics) {
    try {
      const prompt = `You are an expert real estate investment advisor with 20+ years of experience. Analyze this property investment opportunity and provide ultra-detailed reasoning.

PROPERTY DATA:
- Address: ${propertyData.address}, ${propertyData.city}, ${propertyData.state} ${propertyData.zipCode}
- Purchase Price: $${propertyData.purchasePrice}
- Monthly Rent: $${propertyData.monthlyRent}
- Down Payment: ${propertyData.downPaymentPercent}%
- Interest Rate: ${propertyData.interestRate}%

CALCULATED METRICS:
- Monthly Cash Flow: $${calculatedMetrics.monthlyNumbers.cashFlow.toFixed(2)}
- Cap Rate: ${calculatedMetrics.metrics.capRate}%
- Cash-on-Cash Return: ${calculatedMetrics.metrics.cashOnCashReturn}%
- ROI: ${calculatedMetrics.metrics.roi}%
- Net Operating Income (Annual): $${calculatedMetrics.annualNumbers.noi.toFixed(2)}

INSTRUCTIONS:
Provide a comprehensive analysis in JSON format with these sections:

1. **Investment Grade**: Rate A+ to F
2. **Risk Level**: Low/Medium/High with specific risks
3. **Market Position**: Is this property priced fairly, overpriced, or undervalued?
4. **Cash Flow Analysis**: Deep dive into monthly cash flow sustainability
5. **Why Invest**: 3-5 compelling reasons to buy this property
6. **Why NOT Invest**: 3-5 red flags or concerns about this deal
7. **Comparable Analysis**: Expected market performance vs this deal
8. **5-Year Projection**: Estimated appreciation and wealth building potential
9. **Alternative Strategies**: How to improve the deal (e.g., house hack, add units, short-term rental)
10. **Final Verdict**: Clear BUY/HOLD/PASS recommendation with confidence level

Be brutally honest. If it's a bad deal, say so clearly. If it's excellent, explain why.
Return ONLY valid JSON, no markdown or additional text.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert real estate investment analyst. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.model,
        temperature: 0.3, // Lower temperature for more consistent analysis
        max_tokens: 4000,
      });

      const aiResponse = completion.choices[0]?.message?.content || '{}';

      // Parse AI response
      let analysis;
      try {
        // Remove markdown code blocks if present
        const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        analysis = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response:', aiResponse);
        // Return a fallback analysis
        analysis = {
          investmentGrade: 'B',
          riskLevel: 'Medium',
          marketPosition: 'Fair market value',
          cashFlowAnalysis: 'Analysis unavailable',
          whyInvest: ['Unable to generate detailed analysis'],
          whyNotInvest: ['AI parsing error - review metrics manually'],
          comparableAnalysis: 'Manual review recommended',
          fiveYearProjection: 'Consult with local market experts',
          alternativeStrategies: ['Review deal parameters'],
          finalVerdict: 'HOLD - Further analysis needed',
          confidenceLevel: 'Low',
        };
      }

      return analysis;
    } catch (error) {
      console.error('AI Agent Error:', error);
      throw new Error('Failed to generate AI analysis');
    }
  }

  /**
   * Market Sentiment Analysis
   * Analyzes market conditions for the property location
   */
  async getMarketSentiment(city, state) {
    try {
      const prompt = `Analyze the real estate market for ${city}, ${state}. Provide:
1. Current market trend (Hot/Warm/Cool/Cold)
2. Average rent growth (% annually)
3. Average property appreciation (% annually)
4. Job market strength (Strong/Moderate/Weak)
5. Population trend (Growing/Stable/Declining)
6. Investment outlook (Bullish/Neutral/Bearish)

Return as JSON only.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a real estate market analyst. Respond with JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.model,
        temperature: 0.2,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || '{}';
      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      try {
        return JSON.parse(cleanResponse);
      } catch {
        return {
          trend: 'Unknown',
          rentGrowth: 'N/A',
          appreciation: 'N/A',
          jobMarket: 'Moderate',
          populationTrend: 'Stable',
          outlook: 'Neutral',
        };
      }
    } catch (error) {
      console.error('Market sentiment error:', error);
      return {
        trend: 'Unknown',
        rentGrowth: 'N/A',
        appreciation: 'N/A',
        jobMarket: 'Unknown',
        populationTrend: 'Unknown',
        outlook: 'Neutral',
      };
    }
  }

  /**
   * Risk Assessment Analysis
   * Identifies specific risks for this investment
   */
  async assessRisks(propertyData, calculatedMetrics) {
    try {
      const prompt = `Analyze investment risks for this property:

Location: ${propertyData.city}, ${propertyData.state}
Purchase Price: $${propertyData.purchasePrice}
Monthly Cash Flow: $${calculatedMetrics.monthlyNumbers.cashFlow}
Cap Rate: ${calculatedMetrics.metrics.capRate}%

Identify:
1. Financial risks (e.g., negative cash flow, low cap rate)
2. Market risks (e.g., declining area, oversupply)
3. Property risks (e.g., age, maintenance, tenant issues)
4. Economic risks (e.g., job market, interest rate sensitivity)
5. Exit strategy risks

Rate each risk: LOW/MEDIUM/HIGH
Provide mitigation strategies.

Return as JSON with: { risks: [{type, level, description, mitigation}], overallRisk: "LOW/MEDIUM/HIGH" }`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a risk assessment expert for real estate. Respond with JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.model,
        temperature: 0.2,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content || '{}';
      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      try {
        return JSON.parse(cleanResponse);
      } catch {
        return {
          risks: [
            {
              type: 'Analysis Error',
              level: 'MEDIUM',
              description: 'Unable to perform automated risk analysis',
              mitigation: 'Consult with a local real estate professional',
            },
          ],
          overallRisk: 'MEDIUM',
        };
      }
    } catch (error) {
      console.error('Risk assessment error:', error);
      return {
        risks: [
          {
            type: 'System Error',
            level: 'MEDIUM',
            description: 'Risk analysis temporarily unavailable',
            mitigation: 'Manual review recommended',
          },
        ],
        overallRisk: 'MEDIUM',
      };
    }
  }

  /**
   * Demographic Insights
   * Provides demographic data about the property area
   */
  async getDemographicInsights(city, state, zipCode) {
    try {
      const prompt = `Provide demographic insights for ${city}, ${state} ${zipCode}:

1. Population size and growth rate
2. Median household income
3. Median age
4. Education level (% college educated)
5. Employment rate
6. Major industries/employers
7. Renter vs homeowner ratio
8. Crime rate (Low/Medium/High)
9. School rating (1-10)
10. Walkability/Transit score

Return as JSON only.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a demographic analyst. Provide accurate data when available. Return JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.model,
        temperature: 0.1,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content || '{}';
      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      try {
        return JSON.parse(cleanResponse);
      } catch {
        return {
          population: 'N/A',
          growthRate: 'N/A',
          medianIncome: 'N/A',
          medianAge: 'N/A',
          education: 'N/A',
          employment: 'N/A',
          industries: 'Data unavailable',
          renterRatio: 'N/A',
          crimeRate: 'Unknown',
          schoolRating: 'N/A',
          walkability: 'N/A',
        };
      }
    } catch (error) {
      console.error('Demographic insights error:', error);
      return {
        population: 'N/A',
        growthRate: 'N/A',
        medianIncome: 'N/A',
        medianAge: 'N/A',
        education: 'N/A',
        employment: 'N/A',
        industries: 'Data unavailable',
        renterRatio: 'N/A',
        crimeRate: 'Unknown',
        schoolRating: 'N/A',
        walkability: 'N/A',
      };
    }
  }

  /**
   * Complete AI-Powered Property Analysis
   * Combines all AI insights into one comprehensive report
   */
  async analyzeProperty(propertyData, calculatedMetrics) {
    try {
      console.log('🤖 Starting AI-powered analysis...');

      // Run all analyses in parallel for speed
      const [ultraThink, marketSentiment, riskAssessment, demographics] = await Promise.all([
        this.ultraThinkAnalysis(propertyData, calculatedMetrics),
        this.getMarketSentiment(propertyData.city, propertyData.state),
        this.assessRisks(propertyData, calculatedMetrics),
        this.getDemographicInsights(propertyData.city, propertyData.state, propertyData.zipCode),
      ]);

      console.log('✅ AI analysis complete');

      return {
        ultraThink,
        marketSentiment,
        riskAssessment,
        demographics,
        aiPowered: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Complete AI analysis error:', error);
      throw error;
    }
  }
}

module.exports = new PropertyAIAgent();
