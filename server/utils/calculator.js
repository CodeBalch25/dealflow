/**
 * Real Estate Investment Calculator
 * Calculates ROI, Cash Flow, Cap Rate, and Cash-on-Cash Return
 */

class PropertyCalculator {
  constructor(propertyData) {
    this.purchasePrice = parseFloat(propertyData.purchasePrice) || 0;
    this.downPaymentPercent = parseFloat(propertyData.downPaymentPercent) || 20;
    this.interestRate = parseFloat(propertyData.interestRate) || 7;
    this.loanTerm = parseInt(propertyData.loanTerm) || 30;
    this.monthlyRent = parseFloat(propertyData.monthlyRent) || 0;
    this.propertyTax = parseFloat(propertyData.propertyTax) || 0;
    this.insurance = parseFloat(propertyData.insurance) || 0;
    this.hoaFees = parseFloat(propertyData.hoaFees) || 0;
    this.maintenancePercent = parseFloat(propertyData.maintenancePercent) || 1;
    this.vacancyPercent = parseFloat(propertyData.vacancyPercent) || 5;
    this.propertyManagementPercent = parseFloat(propertyData.propertyManagementPercent) || 10;
  }

  // Calculate down payment amount
  getDownPayment() {
    return (this.purchasePrice * this.downPaymentPercent) / 100;
  }

  // Calculate loan amount
  getLoanAmount() {
    return this.purchasePrice - this.getDownPayment();
  }

  // Calculate monthly mortgage payment (Principal + Interest)
  getMonthlyMortgage() {
    const loanAmount = this.getLoanAmount();
    const monthlyRate = this.interestRate / 100 / 12;
    const numPayments = this.loanTerm * 12;

    if (monthlyRate === 0) return loanAmount / numPayments;

    const mortgage =
      loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    return mortgage;
  }

  // Calculate total monthly expenses
  getMonthlyExpenses() {
    const monthlyMortgage = this.getMonthlyMortgage();
    const monthlyPropertyTax = this.propertyTax / 12;
    const monthlyInsurance = this.insurance / 12;
    const monthlyHOA = this.hoaFees;
    const monthlyMaintenance = (this.monthlyRent * this.maintenancePercent) / 100;
    const monthlyVacancy = (this.monthlyRent * this.vacancyPercent) / 100;
    const monthlyManagement = (this.monthlyRent * this.propertyManagementPercent) / 100;

    return {
      mortgage: monthlyMortgage,
      propertyTax: monthlyPropertyTax,
      insurance: monthlyInsurance,
      hoa: monthlyHOA,
      maintenance: monthlyMaintenance,
      vacancy: monthlyVacancy,
      management: monthlyManagement,
      total:
        monthlyMortgage +
        monthlyPropertyTax +
        monthlyInsurance +
        monthlyHOA +
        monthlyMaintenance +
        monthlyVacancy +
        monthlyManagement,
    };
  }

  // Calculate monthly cash flow
  getMonthlyCashFlow() {
    const expenses = this.getMonthlyExpenses();
    return this.monthlyRent - expenses.total;
  }

  // Calculate annual cash flow
  getAnnualCashFlow() {
    return this.getMonthlyCashFlow() * 12;
  }

  // Calculate Net Operating Income (NOI)
  getNOI() {
    const annualRent = this.monthlyRent * 12;
    const annualExpenses =
      this.propertyTax +
      this.insurance +
      this.hoaFees * 12 +
      (annualRent * this.maintenancePercent) / 100 +
      (annualRent * this.vacancyPercent) / 100 +
      (annualRent * this.propertyManagementPercent) / 100;

    return annualRent - annualExpenses;
  }

  // Calculate Cap Rate (Capitalization Rate)
  getCapRate() {
    const noi = this.getNOI();
    return ((noi / this.purchasePrice) * 100).toFixed(2);
  }

  // Calculate Cash-on-Cash Return
  getCashOnCashReturn() {
    const annualCashFlow = this.getAnnualCashFlow();
    const totalInvestment = this.getDownPayment();
    return ((annualCashFlow / totalInvestment) * 100).toFixed(2);
  }

  // Calculate overall ROI
  getROI() {
    const annualCashFlow = this.getAnnualCashFlow();
    const totalInvestment = this.getDownPayment();
    return ((annualCashFlow / totalInvestment) * 100).toFixed(2);
  }

  // Get comprehensive analysis
  getFullAnalysis() {
    const expenses = this.getMonthlyExpenses();
    const monthlyCashFlow = this.getMonthlyCashFlow();
    const annualCashFlow = this.getAnnualCashFlow();

    return {
      purchaseInfo: {
        purchasePrice: this.purchasePrice,
        downPayment: this.getDownPayment(),
        downPaymentPercent: this.downPaymentPercent,
        loanAmount: this.getLoanAmount(),
        interestRate: this.interestRate,
        loanTerm: this.loanTerm,
      },
      monthlyNumbers: {
        rent: this.monthlyRent,
        mortgage: expenses.mortgage,
        propertyTax: expenses.propertyTax,
        insurance: expenses.insurance,
        hoa: expenses.hoa,
        maintenance: expenses.maintenance,
        vacancy: expenses.vacancy,
        management: expenses.management,
        totalExpenses: expenses.total,
        cashFlow: monthlyCashFlow,
      },
      annualNumbers: {
        rent: this.monthlyRent * 12,
        cashFlow: annualCashFlow,
        noi: this.getNOI(),
      },
      metrics: {
        capRate: parseFloat(this.getCapRate()),
        cashOnCashReturn: parseFloat(this.getCashOnCashReturn()),
        roi: parseFloat(this.getROI()),
      },
      recommendation: this.getRecommendation(monthlyCashFlow, parseFloat(this.getROI())),
    };
  }

  // Get investment recommendation
  getRecommendation(monthlyCashFlow, roi) {
    if (monthlyCashFlow < 0) {
      return {
        verdict: 'AVOID',
        reason: 'Negative cash flow - This property will cost you money every month.',
        color: 'red',
      };
    } else if (monthlyCashFlow < 100 || roi < 5) {
      return {
        verdict: 'MARGINAL',
        reason: 'Low returns - Consider negotiating a better price or finding higher rent.',
        color: 'yellow',
      };
    } else if (roi >= 10 && monthlyCashFlow >= 200) {
      return {
        verdict: 'EXCELLENT',
        reason: 'Strong deal! This meets the 1% rule and provides solid cash flow.',
        color: 'green',
      };
    } else {
      return {
        verdict: 'GOOD',
        reason: 'Decent investment with positive cash flow.',
        color: 'blue',
      };
    }
  }
}

module.exports = PropertyCalculator;
