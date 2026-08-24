import express from 'express';
import verifyJWT from '../middleware/verifyJWT.middleware.js';
import isAdmin from '../middleware/isAdmin.middleware.js';
import {
  getRevenueOverview,
  getRevenuePaymentBreakdown,
  getRevenueTaxSummary,
  getRevenueDaily,
  getBestPerformingDays,
  exportRevenueReportPdf,
  exportRevenueReportExcel,
} from '../controllers/revenue.controller.js';

const router = express.Router();

router.get('/overview', verifyJWT, isAdmin, getRevenueOverview);
router.get('/payment-methods', verifyJWT, isAdmin, getRevenuePaymentBreakdown);
router.get('/tax-summary', verifyJWT, isAdmin, getRevenueTaxSummary);
router.get('/daily', verifyJWT, isAdmin, getRevenueDaily);
router.get('/best-days', verifyJWT, isAdmin, getBestPerformingDays);
router.get('/export/pdf', verifyJWT, isAdmin, exportRevenueReportPdf);
router.get('/export/xlsx', verifyJWT, isAdmin, exportRevenueReportExcel);

export default router;
