const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
  const payload = new Date(date);
  payload.setHours(0, 0, 0, 0);
  return payload;
}

function endOfDay(date) {
  const payload = new Date(date);
  payload.setHours(23, 59, 59, 999);
  return payload;
}

function startOfMonth(date) {
  const payload = new Date(date);
  payload.setDate(1);
  payload.setHours(0, 0, 0, 0);
  return payload;
}

function endOfMonth(date) {
  const payload = new Date(date);
  payload.setMonth(payload.getMonth() + 1, 0);
  payload.setHours(23, 59, 59, 999);
  return payload;
}

function startOfYear(date) {
  const payload = new Date(date);
  payload.setMonth(0, 1);
  payload.setHours(0, 0, 0, 0);
  return payload;
}

function endOfYear(date) {
  const payload = new Date(date);
  payload.setMonth(11, 31);
  payload.setHours(23, 59, 59, 999);
  return payload;
}

function cloneDate(value) {
  return new Date(value);
}

function addDays(date, amount) {
  const payload = cloneDate(date);
  payload.setDate(payload.getDate() + amount);
  return payload;
}

function addMonths(date, amount) {
  const payload = cloneDate(date);
  payload.setMonth(payload.getMonth() + amount);
  return payload;
}

function addYears(date, amount) {
  const payload = cloneDate(date);
  payload.setFullYear(payload.getFullYear() + amount);
  return payload;
}

function toDateKey(date) {
  const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const year = localDate.getFullYear();
  const month = `${localDate.getMonth() + 1}`.padStart(2, "0");
  const day = `${localDate.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDaysBetween(startDate, endDate) {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  const diff = Math.round((end.getTime() - start.getTime()) / DAY_IN_MS) + 1;
  return diff > 0 ? diff : 1;
}

function getDateLabel(date) {
  return `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`;
}

export function normalizePaymentMethod(method) {
  const value = (method ?? "").toString().trim().toLowerCase();

  if (["cash", "cash payment", "paid cash"].includes(value)) {
    return "Cash";
  }

  if (["card", "credit card", "debit card", "card payment"].includes(value)) {
    return "Card";
  }

  if (["upi", "phonepe", "google pay", "paytm", "bharat qr"].includes(value)) {
    return "UPI";
  }

  if (["online", "online payment", "internet banking", "razorpay", "stripe"].includes(value)) {
    return "Online Payment";
  }

  if (["wallet", "digital wallet", "paytm wallet"].includes(value)) {
    return "Wallet";
  }

  if (!value || value === "not selected") {
    return "Cash";
  }

  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getPrimaryPaymentMethod(order) {
  const payment = Array.isArray(order.payment) && order.payment.length > 0 ? order.payment[0] : null;
  const method = payment?.method ?? order.paymentMethod ?? "";
  return normalizePaymentMethod(method);
}

function isCompletedOrder(order) {
  return order.status === "served";
}

function getRevenueAmount(order) {
  return isCompletedOrder(order) ? Number(order.totalAmount || 0) : 0;
}

function getTaxAmount(order) {
  const cGst = Number(order.cGst || 0);
  const sGst = Number(order.sGst || 0);
  const serviceCharge = Number(order.serviceCharge || 0);
  return cGst + sGst + serviceCharge;
}

function getSubtotal(order) {
  return Math.max(0, Number(order.totalAmount || 0) - getTaxAmount(order));
}

function isWithinRange(orderDate, startDate, endDate) {
  if (!startDate || !endDate) {
    return true;
  }

  const date = toDate(orderDate);
  if (!date) {
    return false;
  }

  return date >= startDate && date <= endDate;
}

function getRangeBounds(range, customStartDate, customEndDate) {
  const today = startOfDay(new Date());
  const yesterday = addDays(today, -1);

  switch (range) {
    case "today":
      return { startDate: today, endDate: endOfDay(today) };
    case "yesterday":
      return { startDate: startOfDay(yesterday), endDate: endOfDay(yesterday) };
    case "last-7-days": {
      const startDate = addDays(today, -6);
      return { startDate: startOfDay(startDate), endDate: endOfDay(today) };
    }
    case "last-30-days": {
      const startDate = addDays(today, -29);
      return { startDate: startOfDay(startDate), endDate: endOfDay(today) };
    }
    case "this-month":
      return { startDate: startOfMonth(today), endDate: endOfMonth(today) };
    case "this-year":
      return { startDate: startOfYear(today), endDate: endOfYear(today) };
    case "custom": {
      const start = customStartDate ? startOfDay(toDate(customStartDate)) : today;
      const end = customEndDate ? endOfDay(toDate(customEndDate)) : today;
      return { startDate: start, endDate: end };
    }
    default:
      return { startDate: startOfDay(addDays(today, -29)), endDate: endOfDay(today) };
  }
}

function getPreviousBounds(range, customStartDate, customEndDate) {
  const currentBounds = getRangeBounds(range, customStartDate, customEndDate);
  const startDate = currentBounds.startDate;
  const endDate = currentBounds.endDate;
  const diff = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / DAY_IN_MS) + 1);

  switch (range) {
    case "today": {
      const previousStart = addDays(startDate, -1);
      return { startDate: startOfDay(previousStart), endDate: endOfDay(previousStart) };
    }
    case "yesterday": {
      const previousStart = addDays(startDate, -1);
      return { startDate: startOfDay(previousStart), endDate: endOfDay(previousStart) };
    }
    case "last-7-days": {
      const previousStart = addDays(startDate, -diff);
      return { startDate: startOfDay(previousStart), endDate: endOfDay(addDays(startDate, -1)) };
    }
    case "last-30-days": {
      const previousStart = addDays(startDate, -diff);
      return { startDate: startOfDay(previousStart), endDate: endOfDay(addDays(startDate, -1)) };
    }
    case "this-month": {
      const previousStart = startOfMonth(addMonths(startDate, -1));
      const previousEnd = endOfMonth(addMonths(startDate, -1));
      return { startDate: previousStart, endDate: previousEnd };
    }
    case "this-year": {
      const previousStart = startOfYear(addYears(startDate, -1));
      const previousEnd = endOfYear(addYears(startDate, -1));
      return { startDate: previousStart, endDate: previousEnd };
    }
    case "custom": {
      const previousStart = addDays(startDate, -diff);
      return { startDate: startOfDay(previousStart), endDate: endOfDay(addDays(startDate, -1)) };
    }
    default: {
      const previousStart = addDays(startDate, -diff);
      return { startDate: startOfDay(previousStart), endDate: endOfDay(addDays(startDate, -1)) };
    }
  }
}

function calculateChange(currentValue, previousValue) {
  if (!previousValue) {
    return currentValue ? 100 : 0;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
}

function buildMetrics(orders, range, customStartDate, customEndDate) {
  const currentBounds = getRangeBounds(range, customStartDate, customEndDate);
  const previousBounds = getPreviousBounds(range, customStartDate, customEndDate);
  const currentOrders = orders.filter((order) => isWithinRange(order.createdAt, currentBounds.startDate, currentBounds.endDate));
  const previousOrders = orders.filter((order) => isWithinRange(order.createdAt, previousBounds.startDate, previousBounds.endDate));

  const currentRevenue = currentOrders.reduce((sum, order) => sum + getRevenueAmount(order), 0);
  const previousRevenue = previousOrders.reduce((sum, order) => sum + getRevenueAmount(order), 0);

  const currentOrdersCount = currentOrders.length;
  const previousOrdersCount = previousOrders.length;
  const currentTodayRevenue = currentOrders.filter((order) => toDateKey(startOfDay(toDate(order.createdAt))) === toDateKey(startOfDay(new Date()))).reduce((sum, order) => sum + getRevenueAmount(order), 0);
  const previousTodayRevenue = previousOrders.filter((order) => toDateKey(startOfDay(toDate(order.createdAt))) === toDateKey(startOfDay(addDays(new Date(), -1)))).reduce((sum, order) => sum + getRevenueAmount(order), 0);
  const currentWeekRevenue = currentOrders.filter((order) => {
    const createdAt = toDate(order.createdAt);
    if (!createdAt) {
      return false;
    }

    const now = new Date();
    const startOfWeekDate = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()));
    const endOfWeekDate = endOfDay(addDays(startOfWeekDate, 6));
    return createdAt >= startOfWeekDate && createdAt <= endOfWeekDate;
  }).reduce((sum, order) => sum + getRevenueAmount(order), 0);
  const previousWeekRevenue = previousOrders.filter((order) => {
    const createdAt = toDate(order.createdAt);
    if (!createdAt) {
      return false;
    }

    const now = addDays(new Date(), -7);
    const startOfWeekDate = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()));
    const endOfWeekDate = endOfDay(addDays(startOfWeekDate, 6));
    return createdAt >= startOfWeekDate && createdAt <= endOfWeekDate;
  }).reduce((sum, order) => sum + getRevenueAmount(order), 0);
  const currentMonthRevenue = currentOrders.filter((order) => {
    const createdAt = toDate(order.createdAt);
    if (!createdAt) {
      return false;
    }

    const now = new Date();
    return createdAt >= startOfMonth(now) && createdAt <= endOfMonth(now);
  }).reduce((sum, order) => sum + getRevenueAmount(order), 0);
  const previousMonthRevenue = previousOrders.filter((order) => {
    const createdAt = toDate(order.createdAt);
    if (!createdAt) {
      return false;
    }

    const previousMonthDate = addMonths(new Date(), -1);
    return createdAt >= startOfMonth(previousMonthDate) && createdAt <= endOfMonth(previousMonthDate);
  }).reduce((sum, order) => sum + getRevenueAmount(order), 0);
  const daysInRange = getDaysBetween(currentBounds.startDate, currentBounds.endDate);
  const averageDailyRevenue = currentRevenue / daysInRange;
  const previousAverageDailyRevenue = previousRevenue / getDaysBetween(previousBounds.startDate, previousBounds.endDate);
  const averageOrderValue = currentOrdersCount ? currentRevenue / currentOrdersCount : 0;
  const previousAverageOrderValue = previousOrdersCount ? previousRevenue / previousOrdersCount : 0;

  return [
    {
      key: "totalRevenue",
      label: "Total Revenue",
      value: currentRevenue,
      previousValue: previousRevenue,
      changePercent: Number(calculateChange(currentRevenue, previousRevenue).toFixed(1)),
      trend: currentRevenue >= previousRevenue ? "up" : "down",
    },
    {
      key: "todayRevenue",
      label: "Today's Revenue",
      value: currentTodayRevenue,
      previousValue: previousTodayRevenue,
      changePercent: Number(calculateChange(currentTodayRevenue, previousTodayRevenue).toFixed(1)),
      trend: currentTodayRevenue >= previousTodayRevenue ? "up" : "down",
    },
    {
      key: "weekRevenue",
      label: "This Week's Revenue",
      value: currentWeekRevenue,
      previousValue: previousWeekRevenue,
      changePercent: Number(calculateChange(currentWeekRevenue, previousWeekRevenue).toFixed(1)),
      trend: currentWeekRevenue >= previousWeekRevenue ? "up" : "down",
    },
    {
      key: "monthRevenue",
      label: "This Month's Revenue",
      value: currentMonthRevenue,
      previousValue: previousMonthRevenue,
      changePercent: Number(calculateChange(currentMonthRevenue, previousMonthRevenue).toFixed(1)),
      trend: currentMonthRevenue >= previousMonthRevenue ? "up" : "down",
    },
    {
      key: "averageDailyRevenue",
      label: "Average Daily Revenue",
      value: averageDailyRevenue,
      previousValue: previousAverageDailyRevenue,
      changePercent: Number(calculateChange(averageDailyRevenue, previousAverageDailyRevenue).toFixed(1)),
      trend: averageDailyRevenue >= previousAverageDailyRevenue ? "up" : "down",
    },
    {
      key: "totalOrders",
      label: "Total Orders",
      value: currentOrdersCount,
      previousValue: previousOrdersCount,
      changePercent: Number(calculateChange(currentOrdersCount, previousOrdersCount).toFixed(1)),
      trend: currentOrdersCount >= previousOrdersCount ? "up" : "down",
    },
    {
      key: "averageOrderValue",
      label: "Average Order Value",
      value: averageOrderValue,
      previousValue: previousAverageOrderValue,
      changePercent: Number(calculateChange(averageOrderValue, previousAverageOrderValue).toFixed(1)),
      trend: averageOrderValue >= previousAverageOrderValue ? "up" : "down",
    },
  ];
}

function buildTrendSeries(orders, range, customStartDate, customEndDate) {
  const bounds = getRangeBounds(range, customStartDate, customEndDate);
  const activeOrders = orders.filter((order) => isWithinRange(order.createdAt, bounds.startDate, bounds.endDate));
  const now = new Date();

  if (range === "today" || range === "yesterday") {
    return [{ label: getDateLabel(bounds.startDate), value: activeOrders.reduce((sum, order) => sum + getRevenueAmount(order), 0) }];
  }

  if (range === "last-7-days" || range === "last-30-days") {
    const labels = [];
    const values = [];
    for (let index = 0; index < Math.max(7, getDaysBetween(bounds.startDate, bounds.endDate)); index += 1) {
      const date = addDays(bounds.startDate, index);
      const dayOrders = activeOrders.filter((order) => toDateKey(startOfDay(toDate(order.createdAt))) === toDateKey(startOfDay(date)));
      labels.push(getDateLabel(date));
      values.push(dayOrders.reduce((sum, order) => sum + getRevenueAmount(order), 0));
    }
    return labels.map((label, index) => ({ label, value: values[index] }));
  }

  if (range === "this-month") {
    const labels = [];
    const values = [];
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let index = 1; index <= daysInMonth; index += 1) {
      const date = new Date(now.getFullYear(), now.getMonth(), index);
      const dayOrders = activeOrders.filter((order) => toDateKey(startOfDay(toDate(order.createdAt))) === toDateKey(startOfDay(date)));
      labels.push(String(index));
      values.push(dayOrders.reduce((sum, order) => sum + getRevenueAmount(order), 0));
    }
    return labels.map((label, index) => ({ label, value: values[index] }));
  }

  if (range === "this-year") {
    const labels = [];
    const values = [];
    for (let index = 0; index < 12; index += 1) {
      const monthDate = new Date(now.getFullYear(), index, 1);
      const monthOrders = activeOrders.filter((order) => {
        const createdAt = toDate(order.createdAt);
        return createdAt && createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === index;
      });
      labels.push(monthDate.toLocaleString("default", { month: "short" }));
      values.push(monthOrders.reduce((sum, order) => sum + getRevenueAmount(order), 0));
    }
    return labels.map((label, index) => ({ label, value: values[index] }));
  }

  const labels = [];
  const values = [];
  const totalDays = Math.max(1, getDaysBetween(bounds.startDate, bounds.endDate));
  for (let index = 0; index < totalDays; index += 1) {
    const date = addDays(bounds.startDate, index);
    const dayOrders = activeOrders.filter((order) => toDateKey(startOfDay(toDate(order.createdAt))) === toDateKey(startOfDay(date)));
    labels.push(getDateLabel(date));
    values.push(dayOrders.reduce((sum, order) => sum + getRevenueAmount(order), 0));
  }
  return labels.map((label, index) => ({ label, value: values[index] }));
}

function buildPaymentBreakdown(orders) {
  const paymentMap = new Map();
  const filteredOrders = orders.filter((order) => isCompletedOrder(order));

  filteredOrders.forEach((order) => {
    const paymentMethod = getPrimaryPaymentMethod(order);
    const amount = getRevenueAmount(order);
    const current = paymentMap.get(paymentMethod) || { label: paymentMethod, amount: 0, orders: 0 };
    current.amount += amount;
    current.orders += 1;
    paymentMap.set(paymentMethod, current);
  });

  const data = Array.from(paymentMap.values());
  const totalRevenue = data.reduce((sum, item) => sum + item.amount, 0);

  return data
    .map((item) => ({
      ...item,
      percentage: totalRevenue ? (item.amount / totalRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function buildTaxSummary(orders) {
  const completedOrders = orders.filter((order) => isCompletedOrder(order));
  const subtotal = completedOrders.reduce((sum, order) => sum + getSubtotal(order), 0);
  const totalTaxCollected = completedOrders.reduce((sum, order) => sum + getTaxAmount(order), 0);
  const finalRevenue = completedOrders.reduce((sum, order) => sum + getRevenueAmount(order), 0);

  return {
    subtotal,
    gstVat: completedOrders.reduce((sum, order) => sum + (Number(order.cGst || 0) + Number(order.sGst || 0)), 0),
    serviceCharge: completedOrders.reduce((sum, order) => sum + Number(order.serviceCharge || 0), 0),
    totalTaxCollected,
    finalRevenue,
  };
}

function buildBestPerformingDays(orders) {
  const completedOrders = orders.filter((order) => isCompletedOrder(order));
  const grouped = new Map();

  completedOrders.forEach((order) => {
    const date = toDateKey(startOfDay(toDate(order.createdAt)) || new Date());
    const current = grouped.get(date) || { date, revenue: 0, orders: 0 };
    current.revenue += getRevenueAmount(order);
    current.orders += 1;
    grouped.set(date, current);
  });

  const rows = Array.from(grouped.values()).sort((a, b) => b.revenue - a.revenue);
  const highest = rows[0] || null;

  return {
    highest,
    topDays: rows.slice(0, 5),
  };
}

function buildDailyRevenueRows(orders, page = 1, limit = 8) {
  const completedOrders = orders.filter((order) => isCompletedOrder(order));
  const grouped = new Map();

  completedOrders.forEach((order) => {
    const date = toDateKey(startOfDay(toDate(order.createdAt)) || new Date());
    const current = grouped.get(date) || { date, orders: 0, grossRevenue: 0, discount: 0, tax: 0, netRevenue: 0, paymentSummary: new Map() };
    current.orders += 1;
    current.grossRevenue += getSubtotal(order);
    current.tax += getTaxAmount(order);
    current.netRevenue += getRevenueAmount(order);

    const paymentMethod = getPrimaryPaymentMethod(order);
    const paymentValue = current.paymentSummary.get(paymentMethod) || { label: paymentMethod, amount: 0, orders: 0 };
    paymentValue.amount += getRevenueAmount(order);
    paymentValue.orders += 1;
    current.paymentSummary.set(paymentMethod, paymentValue);
    grouped.set(date, current);
  });

  const rows = Array.from(grouped.values()).sort((a, b) => b.netRevenue - a.netRevenue);
  const totalItems = rows.length;
  const start = (page - 1) * limit;
  const paginatedRows = rows.slice(start, start + limit).map((row) => ({
    ...row,
    paymentSummary: Array.from(row.paymentSummary.values()).map((item) => `${item.label}: ₹${item.amount.toLocaleString("en-IN")}`).join(" | "),
  }));

  return {
    rows: paginatedRows,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    },
  };
}

function applyFilters(orders, filters = {}) {
  const { range = "last-30-days", startDate, endDate, paymentMethod = "all", status = "all", orderType = "all" } = filters;
  const bounds = getRangeBounds(range, startDate, endDate);

  return orders.filter((order) => {
    const createdAt = toDate(order.createdAt);
    const inRange = createdAt && isWithinRange(order.createdAt, bounds.startDate, bounds.endDate);

    if (!inRange) {
      return false;
    }

    if (paymentMethod !== "all") {
      const normalizedPayment = getPrimaryPaymentMethod(order);
      if (normalizedPayment !== paymentMethod) {
        return false;
      }
    }

    if (status !== "all" && order.status !== status) {
      return false;
    }

    if (orderType !== "all") {
      const normalizedOrderType = String(order.orderType || "dine-in").toLowerCase();
      if (normalizedOrderType !== orderType.toLowerCase()) {
        return false;
      }
    }

    return true;
  });
}

export function buildMonthlyRevenueRows(orders, filters = {}) {
  const normalizedOrders = orders.map((order) => ({
    ...order,
    createdAt: order.createdAt ?? order.createdAtDate ?? new Date(),
  }));
  const filteredOrders = applyFilters(normalizedOrders, filters);
  const monthlyData = new Map();

  filteredOrders.forEach((order) => {
    const createdAt = toDate(order.createdAt);
    if (!createdAt) return;

    const year = createdAt.getFullYear();
    const month = createdAt.getMonth();
    const key = `${year}-${month}`;
    const current = monthlyData.get(key) || {
      year,
      month,
      revenue: 0,
      orders: 0,
      tax: 0,
      servedOrders: 0,
    };

    current.orders += 1;
    if (isCompletedOrder(order)) {
      current.revenue += getRevenueAmount(order);
      current.tax += getTaxAmount(order);
      current.servedOrders += 1;
    }
    monthlyData.set(key, current);
  });

  return Array.from(monthlyData.values())
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map((monthData, index, rows) => {
      const previous = rows[index - 1];
      const previousRevenue = previous?.revenue || 0;
      const monthStart = new Date(monthData.year, monthData.month, 1);
      const isCurrentMonth = monthData.year === new Date().getFullYear() && monthData.month === new Date().getMonth();
      const monthEnd = isCurrentMonth
        ? new Date()
        : new Date(monthData.year, monthData.month + 1, 0);
      const daysInPeriod = Math.max(1, Math.floor((monthEnd - monthStart) / DAY_IN_MS) + 1);

      return {
        month: monthStart.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
        totalRevenue: monthData.revenue,
        revenueGrowth: previousRevenue ? ((monthData.revenue - previousRevenue) / previousRevenue) * 100 : 0,
        totalOrders: monthData.orders,
        totalTaxCollected: monthData.tax,
        averageDailyRevenue: monthData.revenue / daysInPeriod,
        averageOrderValue: monthData.servedOrders ? monthData.revenue / monthData.servedOrders : 0,
      };
    });
}

export function buildRevenueDashboardData(orders, filters = {}) {
  const normalizedOrders = orders.map((order) => ({
    ...order,
    createdAt: order.createdAt ?? order.createdAtDate ?? new Date(),
  }));
  const filteredOrders = applyFilters(normalizedOrders, filters);

  const metrics = buildMetrics(filteredOrders, filters.range || "last-30-days", filters.startDate, filters.endDate);
  const trendSeries = buildTrendSeries(filteredOrders, filters.range || "last-30-days", filters.startDate, filters.endDate);
  const paymentBreakdown = buildPaymentBreakdown(filteredOrders);
  const taxSummary = buildTaxSummary(filteredOrders);
  const bestPerformingDays = buildBestPerformingDays(filteredOrders);
  const dailyRevenue = buildDailyRevenueRows(filteredOrders, filters.page || 1, filters.limit || 8);

  const totalRevenue = metrics.find((metric) => metric.key === "totalRevenue")?.value || 0;
  const highestRevenueDay = bestPerformingDays.highest;

  const dayMap = new Map();
  filteredOrders.filter((order) => isCompletedOrder(order)).forEach((order) => {
    const date = toDateKey(startOfDay(toDate(order.createdAt)) || new Date());
    const current = dayMap.get(date) || { date, revenue: 0, orders: 0 };
    current.revenue += getRevenueAmount(order);
    current.orders += 1;
    dayMap.set(date, current);
  });

  const dayRows = Array.from(dayMap.values()).sort((a, b) => a.revenue - b.revenue);
  const lowestRevenueDay = dayRows[0] || null;
  const mostUsedPaymentMethod = paymentBreakdown[0]?.label || "N/A";
  const revenueGrowthPercentage = metrics.find((metric) => metric.key === "totalRevenue")?.changePercent || 0;
  const averageDailyRevenue = metrics.find((metric) => metric.key === "averageDailyRevenue")?.value || 0;
  const averageOrderValue = metrics.find((metric) => metric.key === "averageOrderValue")?.value || 0;

  return {
    overview: {
      metrics,
      totalRevenue,
      revenueGrowthPercentage,
      averageDailyRevenue,
      averageOrderValue,
    },
    trend: {
      series: trendSeries,
    },
    paymentBreakdown,
    taxSummary,
    bestPerformingDays,
    dailyRevenue,
    insights: {
      highestRevenueDay,
      lowestRevenueDay,
      totalTaxesCollected: taxSummary.totalTaxCollected,
      mostUsedPaymentMethod,
      revenueGrowthPercentage,
      averageDailyRevenue,
      averageOrderValue,
    },
  };
}

export function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}
