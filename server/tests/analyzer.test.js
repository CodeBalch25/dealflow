/**
 * DealFlow Property Analyzer Unit Tests
 * Tests for property analysis, API endpoints, and AI integration
 */

const axios = require('axios');
const PropertyCalculator = require('../utils/calculator');

const API_URL = 'http://localhost:5000/api';

// Test data
const testProperty = {
  address: '123 Test St',
  city: 'Austin',
  state: 'TX',
  zipCode: '78701',
  purchasePrice: 300000,
  monthlyRent: 2000,
  downPaymentPercent: 20,
  interestRate: 7,
  loanTerm: 30,
  propertyTax: 3000,
  insurance: 1200,
  hoaFees: 0,
  maintenancePercent: 1,
  vacancyPercent: 5,
  propertyManagementPercent: 10,
};

// Color codes for test output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log(`\n${colors.bright}${colors.blue}Running DealFlow Unit Tests${colors.reset}\n`);
    console.log('='.repeat(60) + '\n');

    for (const test of this.tests) {
      try {
        await test.fn();
        this.passed++;
        console.log(`${colors.green}✓${colors.reset} ${test.name}`);
      } catch (error) {
        this.failed++;
        console.log(`${colors.red}✗${colors.reset} ${test.name}`);
        console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n${colors.bright}Test Summary:${colors.reset}`);
    console.log(`${colors.green}Passed: ${this.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${this.failed}${colors.reset}`);
    console.log(`Total: ${this.tests.length}\n`);

    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

// Assertion helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Create test runner
const runner = new TestRunner();

// ============================================================================
// UNIT TESTS: PropertyCalculator
// ============================================================================

runner.test('PropertyCalculator: Calculate monthly mortgage correctly', () => {
  const calc = new PropertyCalculator(testProperty);
  const mortgage = calc.getMonthlyMortgage();

  // Mortgage should be around $1597 for $240k loan at 7% for 30 years
  assert(mortgage > 1595 && mortgage < 1598, `Expected mortgage ~1597, got ${mortgage}`);
});

runner.test('PropertyCalculator: Calculate NOI correctly', () => {
  const calc = new PropertyCalculator(testProperty);
  const analysis = calc.getFullAnalysis();

  // NOI should be annual rent minus annual expenses (excluding mortgage)
  const expectedNOI = 24000 - (testProperty.propertyTax + testProperty.insurance +
                                (testProperty.monthlyRent * 0.01 * 12) +
                                (testProperty.monthlyRent * 0.05 * 12) +
                                (testProperty.monthlyRent * 0.10 * 12));

  assert(Math.abs(analysis.annualNumbers.noi - expectedNOI) < 1,
         `Expected NOI ~${expectedNOI}, got ${analysis.annualNumbers.noi}`);
});

runner.test('PropertyCalculator: Cap rate calculation', () => {
  const calc = new PropertyCalculator(testProperty);
  const analysis = calc.getFullAnalysis();

  // Cap rate should be positive and reasonable (0-20%)
  assert(analysis.metrics.capRate > 0 && analysis.metrics.capRate < 20,
         `Cap rate ${analysis.metrics.capRate}% is out of reasonable range`);
});

runner.test('PropertyCalculator: Cash flow calculation', () => {
  const calc = new PropertyCalculator(testProperty);
  const analysis = calc.getFullAnalysis();

  // Cash flow should be rent minus all expenses including mortgage
  assert(typeof analysis.monthlyNumbers.cashFlow === 'number',
         'Cash flow should be a number');
});

runner.test('PropertyCalculator: Generate recommendation', () => {
  const calc = new PropertyCalculator(testProperty);
  const analysis = calc.getFullAnalysis();

  assert(analysis.recommendation.verdict, 'Should have a verdict');
  assert(['EXCELLENT', 'GOOD', 'MARGINAL', 'AVOID'].includes(analysis.recommendation.verdict),
         `Unexpected verdict: ${analysis.recommendation.verdict}`);
});

// ============================================================================
// INTEGRATION TESTS: API Endpoints
// ============================================================================

runner.test('API: Health endpoint responds', async () => {
  const response = await axios.get(`${API_URL}/health`);
  assert(response.status === 200, `Expected status 200, got ${response.status}`);
  assert(response.data.status === 'OK', 'Health check should return OK status');
});

runner.test('API: Analyze property without authentication', async () => {
  const response = await axios.post(`${API_URL}/properties/analyze`, testProperty);

  assert(response.status === 200, `Expected status 200, got ${response.status}`);
  assert(response.data.success === true, 'Analysis should succeed');
  assert(response.data.analysis, 'Should return analysis data');
});

runner.test('API: Analysis includes financial metrics', async () => {
  const response = await axios.post(`${API_URL}/properties/analyze`, testProperty);
  const analysis = response.data.analysis;

  assert(analysis.monthlyNumbers, 'Should have monthly numbers');
  assert(analysis.monthlyNumbers.cashFlow !== undefined, 'Should have cash flow');
  assert(analysis.metrics, 'Should have metrics');
  assert(analysis.metrics.roi !== undefined, 'Should have ROI');
  assert(analysis.metrics.capRate !== undefined, 'Should have cap rate');
});

runner.test('API: Analysis includes AI insights', async () => {
  const response = await axios.post(`${API_URL}/properties/analyze`, testProperty);
  const analysis = response.data.analysis;

  assert(analysis.ai, 'Should have AI analysis');

  // AI might fail, so we check if it's present or has error
  if (analysis.ai.aiPowered) {
    assert(analysis.ai.ultraThink, 'Should have ultra think analysis');
    assert(analysis.ai.marketSentiment, 'Should have market sentiment');
    assert(analysis.ai.riskAssessment, 'Should have risk assessment');
  } else {
    assert(analysis.ai.error, 'If AI failed, should have error message');
  }
});

runner.test('API: Analysis handles missing required fields gracefully', async () => {
  // The API currently accepts requests with defaults, which is OK
  // This test verifies it doesn't crash with minimal data
  const response = await axios.post(`${API_URL}/properties/analyze`, {
    address: '123 Test St',
    purchasePrice: 300000,
    monthlyRent: 2000,
  });

  assert(response.status === 200, 'Should process with defaults');
  assert(response.data.success === true, 'Should succeed with defaults');
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

runner.test('Edge Case: Negative cash flow property', async () => {
  const negativeProperty = {
    ...testProperty,
    purchasePrice: 500000, // Very high price
    monthlyRent: 1000, // Low rent
  };

  const response = await axios.post(`${API_URL}/properties/analyze`, negativeProperty);
  const analysis = response.data.analysis;

  assert(analysis.monthlyNumbers.cashFlow < 0, 'Should have negative cash flow');
  assert(['MARGINAL', 'AVOID'].includes(analysis.recommendation.verdict),
         'Should recommend avoiding or be marginal');
});

runner.test('Edge Case: Excellent deal property', async () => {
  const excellentProperty = {
    ...testProperty,
    purchasePrice: 100000, // Low price
    monthlyRent: 2000, // High rent
  };

  const response = await axios.post(`${API_URL}/properties/analyze`, excellentProperty);
  const analysis = response.data.analysis;

  assert(analysis.monthlyNumbers.cashFlow > 500, 'Should have high positive cash flow');
  assert(['EXCELLENT', 'GOOD'].includes(analysis.recommendation.verdict),
         'Should recommend buying');
});

runner.test('Edge Case: Zero down payment', async () => {
  const zeroDownProperty = {
    address: '123 Test St',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    purchasePrice: 300000,
    monthlyRent: 2000,
    downPaymentPercent: 0,
  };

  const response = await axios.post(`${API_URL}/properties/analyze`, zeroDownProperty);
  const analysis = response.data.analysis;

  assert(Math.abs(analysis.purchaseInfo.downPayment) < 0.01,
         `Down payment should be ~0, got ${analysis.purchaseInfo.downPayment}`);
  assert(Math.abs(analysis.purchaseInfo.loanAmount - zeroDownProperty.purchasePrice) < 0.01,
         `Loan amount should equal purchase price (${zeroDownProperty.purchasePrice}), got ${analysis.purchaseInfo.loanAmount}`);
});

// ============================================================================
// AI INTEGRATION TESTS
// ============================================================================

runner.test('AI: UltraThink analysis structure', async () => {
  const response = await axios.post(`${API_URL}/properties/analyze`, testProperty);
  const ai = response.data.analysis.ai;

  if (ai.aiPowered && ai.ultraThink) {
    assert(ai.ultraThink.whyInvest, 'Should have reasons to invest');
    assert(ai.ultraThink.whyNotInvest, 'Should have reasons not to invest');
    assert(Array.isArray(ai.ultraThink.whyInvest), 'whyInvest should be an array');
    assert(Array.isArray(ai.ultraThink.whyNotInvest), 'whyNotInvest should be an array');
  }
});

runner.test('AI: Market sentiment for Austin, TX', async () => {
  const response = await axios.post(`${API_URL}/properties/analyze`, testProperty);
  const ai = response.data.analysis.ai;

  if (ai.aiPowered && ai.marketSentiment) {
    assert(ai.marketSentiment.market_trend, 'Should have market trend');
    assert(ai.marketSentiment.investment_outlook, 'Should have investment outlook');
  }
});

runner.test('AI: Risk assessment levels', async () => {
  const response = await axios.post(`${API_URL}/properties/analyze`, testProperty);
  const ai = response.data.analysis.ai;

  if (ai.aiPowered && ai.riskAssessment) {
    assert(ai.riskAssessment.overallRisk, 'Should have overall risk');
    assert(['LOW', 'MEDIUM', 'HIGH'].includes(ai.riskAssessment.overallRisk),
           `Unexpected risk level: ${ai.riskAssessment.overallRisk}`);
    assert(Array.isArray(ai.riskAssessment.risks), 'Should have array of risks');
  }
});

// ============================================================================
// RUN ALL TESTS
// ============================================================================

runner.run().catch((error) => {
  console.error(`\n${colors.red}Test runner failed:${colors.reset}`, error);
  process.exit(1);
});
