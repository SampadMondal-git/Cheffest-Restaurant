import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMonthlyRevenueRows, buildRevenueDashboardData, normalizePaymentMethod } from './revenue.service.js';

const createOrder = (overrides = {}) => ({
  _id: 'order-1',
  status: 'served',
  totalAmount: 1200,
  cGst: 60,
  sGst: 60,
  serviceCharge: 80,
  createdAt: new Date('2026-08-01T12:00:00.000Z'),
  payment: [{ method: 'card' }],
  orderType: 'dine-in',
  ...overrides,
});

test('normalizes payment methods to the supported labels', () => {
  assert.equal(normalizePaymentMethod('upi'), 'UPI');
  assert.equal(normalizePaymentMethod('wallet'), 'Wallet');
  assert.equal(normalizePaymentMethod('online payment'), 'Online Payment');
});

test('builds a dashboard payload with revenue, tax, and best-performing day data', () => {
  const orders = [
    createOrder({ totalAmount: 1200, createdAt: new Date('2026-08-01T12:00:00.000Z') }),
    createOrder({ totalAmount: 900, createdAt: new Date('2026-08-02T12:00:00.000Z'), payment: [{ method: 'cash' }], orderType: 'delivery' }),
  ];

  const result = buildRevenueDashboardData(orders, { range: 'custom', startDate: '2026-08-01', endDate: '2026-08-02' });

  assert.equal(result.overview.totalRevenue, 2100);
  assert.equal(result.taxSummary.subtotal, 1700);
  assert.equal(result.taxSummary.totalTaxCollected, 400);
  assert.equal(result.paymentBreakdown.length, 2);
  assert.equal(result.bestPerformingDays.topDays[0].date, '2026-08-01');
});

test('builds monthly export rows with served and cancelled order counts', () => {
  const orders = [
    createOrder({ totalAmount: 1200, createdAt: new Date('2026-08-01T12:00:00.000Z') }),
    createOrder({ status: 'cancelled', totalAmount: 900, createdAt: new Date('2026-08-02T12:00:00.000Z') }),
    createOrder({ status: 'pending', totalAmount: 700, createdAt: new Date('2026-08-03T12:00:00.000Z') }),
  ];

  const [row] = buildMonthlyRevenueRows(orders, { range: 'custom', startDate: '2026-08-01', endDate: '2026-08-31' });

  assert.equal(row.totalRevenue, 1200);
  assert.equal(row.totalOrders, 3);
  assert.equal(row.servedOrders, 1);
  assert.equal(row.cancelledOrders, 1);
  assert.equal(row.averageOrderValue, 1200);
});
