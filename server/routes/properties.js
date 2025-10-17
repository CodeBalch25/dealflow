const express = require('express');
const router = express.Router();
const { allAsync, runAsync } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const PropertyCalculator = require('../utils/calculator');

// Analyze property (no auth required for MVP - freemium later)
router.post('/analyze', async (req, res) => {
  try {
    const propertyData = req.body;

    // Create calculator instance
    const calculator = new PropertyCalculator(propertyData);

    // Get full analysis
    const analysis = calculator.getFullAnalysis();

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Error analyzing property' });
  }
});

// Save property analysis (requires auth)
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { address, city, state, zipCode, ...propertyData } = req.body;
    const userId = req.user.id;

    // Calculate metrics
    const calculator = new PropertyCalculator(propertyData);
    const analysis = calculator.getFullAnalysis();

    // Save to database
    const result = await runAsync(
      `INSERT INTO properties (
        user_id, address, city, state, zip_code,
        purchase_price, down_payment_percent, interest_rate, loan_term,
        monthly_rent, property_tax, insurance, hoa_fees,
        maintenance_percent, vacancy_percent, property_management_percent,
        cash_flow, roi, cap_rate, cash_on_cash_return
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        address,
        city,
        state,
        zipCode,
        propertyData.purchasePrice,
        propertyData.downPaymentPercent || 20,
        propertyData.interestRate || 7,
        propertyData.loanTerm || 30,
        propertyData.monthlyRent,
        propertyData.propertyTax || 0,
        propertyData.insurance || 0,
        propertyData.hoaFees || 0,
        propertyData.maintenancePercent || 1,
        propertyData.vacancyPercent || 5,
        propertyData.propertyManagementPercent || 10,
        analysis.monthlyNumbers.cashFlow,
        analysis.metrics.roi,
        analysis.metrics.capRate,
        analysis.metrics.cashOnCashReturn,
      ]
    );

    res.json({
      success: true,
      message: 'Property saved successfully',
      propertyId: result.lastID,
    });
  } catch (error) {
    console.error('Save property error:', error);
    res.status(500).json({ error: 'Error saving property' });
  }
});

// Get user's saved properties
router.get('/my-deals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const properties = await allAsync(
      'SELECT * FROM properties WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      success: true,
      properties,
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Error fetching properties' });
  }
});

// Delete property
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user.id;

    const result = await runAsync(
      'DELETE FROM properties WHERE id = ? AND user_id = ?',
      [propertyId, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Error deleting property' });
  }
});

module.exports = router;
