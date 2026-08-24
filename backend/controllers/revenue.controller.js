import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import orderModel from '../model/order.model.js';
import { buildMonthlyRevenueRows, buildRevenueDashboardData, formatCurrency } from '../services/revenue.service.js';

const getFiltersFromRequest = (req) => ({
  range: req.query.range || 'last-30-days',
  startDate: req.query.startDate || undefined,
  endDate: req.query.endDate || undefined,
  paymentMethod: req.query.paymentMethod || 'all',
  status: req.query.status || 'all',
  orderType: req.query.orderType || 'all',
  page: Number(req.query.page || 1),
  limit: Number(req.query.limit || 8),
});

const getOrders = async () => {
  return orderModel.find({}).sort({ createdAt: -1 }).lean();
};

export const getRevenueOverview = async (req, res) => {
  try {
    const orders = await getOrders();
    const dashboard = buildRevenueDashboardData(orders, getFiltersFromRequest(req));
    res.status(200).json(dashboard);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load revenue data' });
  }
};

export const getRevenuePaymentBreakdown = async (req, res) => {
  try {
    const orders = await getOrders();
    const dashboard = buildRevenueDashboardData(orders, getFiltersFromRequest(req));
    res.status(200).json(dashboard.paymentBreakdown);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load payment breakdown' });
  }
};

export const getRevenueTaxSummary = async (req, res) => {
  try {
    const orders = await getOrders();
    const dashboard = buildRevenueDashboardData(orders, getFiltersFromRequest(req));
    res.status(200).json(dashboard.taxSummary);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load tax summary' });
  }
};

export const getRevenueDaily = async (req, res) => {
  try {
    const orders = await getOrders();
    const dashboard = buildRevenueDashboardData(orders, getFiltersFromRequest(req));
    res.status(200).json(dashboard.dailyRevenue);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load daily revenue' });
  }
};

export const getBestPerformingDays = async (req, res) => {
  try {
    const orders = await getOrders();
    const dashboard = buildRevenueDashboardData(orders, getFiltersFromRequest(req));
    res.status(200).json(dashboard.bestPerformingDays);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load best-performing days' });
  }
};

export const exportRevenueReportPdf = async (req, res) => {
  try {
    const orders = await getOrders();
    const dashboard = buildRevenueDashboardData(orders, getFiltersFromRequest(req));
    const doc = new PDFDocument({ margin: 36, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="restaurant-revenue-report.pdf"');

    doc.pipe(res);
    doc.fontSize(20).text('Restaurant Revenue Report', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown(0.5);

    doc.fontSize(14).text('Revenue Overview');
    dashboard.overview.metrics.forEach((metric) => {
      doc.fontSize(11).text(`${metric.label}: ${formatCurrency(metric.value)} (${Number(metric.changePercent || 0).toFixed(1)}%)`);
    });

    doc.moveDown();
    doc.fontSize(14).text('Tax Summary');
    doc.fontSize(11).text(`Subtotal: ${formatCurrency(dashboard.taxSummary.subtotal)}`);
    doc.text(`GST/VAT: ${formatCurrency(dashboard.taxSummary.gstVat)}`);
    doc.text(`Service Charge: ${formatCurrency(dashboard.taxSummary.serviceCharge)}`);
    doc.text(`Total Tax Collected: ${formatCurrency(dashboard.taxSummary.totalTaxCollected)}`);
    doc.text(`Final Revenue: ${formatCurrency(dashboard.taxSummary.finalRevenue)}`);

    doc.moveDown();
    doc.fontSize(14).text('Best Performing Days');
    dashboard.bestPerformingDays.topDays.forEach((day) => {
      doc.fontSize(11).text(`${day.date}: ${formatCurrency(day.revenue)} (${day.orders} orders)`);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to generate PDF export' });
  }
};

export const exportRevenueReportExcel = async (req, res) => {
  try {
    const orders = await getOrders();
    const filters = getFiltersFromRequest(req);
    const monthlyRows = buildMonthlyRevenueRows(orders, filters);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Revenue Report');

    worksheet.columns = [
      { header: 'Month', key: 'month', width: 20 },
      { header: 'Total Revenue', key: 'totalRevenue', width: 18 },
      { header: 'Revenue Growth %', key: 'revenueGrowth', width: 18 },
      { header: 'Total Orders', key: 'totalOrders', width: 16 },
      { header: 'Total Tax Collected', key: 'totalTaxCollected', width: 20 },
      { header: 'Average Daily Revenue', key: 'averageDailyRevenue', width: 22 },
      { header: 'Average Order Value', key: 'averageOrderValue', width: 20 },
    ];

    monthlyRows.forEach((row) => worksheet.addRow(row));
    worksheet.getRow(1).font = { bold: true };
    worksheet.getColumn('totalRevenue').numFmt = '₹#,##0.00';
    worksheet.getColumn('revenueGrowth').numFmt = '0.0"%"';
    worksheet.getColumn('totalTaxCollected').numFmt = '₹#,##0.00';
    worksheet.getColumn('averageDailyRevenue').numFmt = '₹#,##0.00';
    worksheet.getColumn('averageOrderValue').numFmt = '₹#,##0.00';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="restaurant-revenue-report.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to generate Excel export' });
  }
};
