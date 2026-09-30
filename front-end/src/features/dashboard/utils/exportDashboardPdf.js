import { formatProductPrice } from "../../products/utils/productFormatters.js";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const GOLDEN = [190, 143, 42];
const SKY = [2, 132, 199];

const formatDateTime = (date) =>
  new Intl.DateTimeFormat("es-PE", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);

const createFilename = (date) => {
  const timestamp = date.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `reporte-ecommerce-${timestamp}.pdf`;
};

const ensureSpace = (doc, cursorY, requiredHeight) => {
  if (cursorY + requiredHeight <= PAGE_HEIGHT - MARGIN) return cursorY;
  doc.addPage();
  return MARGIN;
};

const drawSectionTitle = (doc, title, cursorY) => {
  const nextY = ensureSpace(doc, cursorY, 14);
  doc.setTextColor(28, 25, 23);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(title, MARGIN, nextY);
  doc.setDrawColor(...GOLDEN);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, nextY + 3, MARGIN + 38, nextY + 3);
  return nextY + 11;
};

const drawMetricCards = (doc, summary, cursorY) => {
  const metrics = [
    ["Productos", summary.products],
    ["Usuarios", summary.users],
    ["Pedidos", summary.orders],
    ["Monto de pedidos", formatProductPrice(summary.order_amount)],
    [
      "Stock bajo",
      `${summary.low_stock_products} (<= ${summary.low_stock_threshold})`,
    ],
  ];
  const cardWidth = (CONTENT_WIDTH - 5) / 2;
  const cardHeight = 20;
  let currentY = cursorY;

  metrics.forEach(([label, value], index) => {
    if (index > 0 && index % 2 === 0) currentY += cardHeight + 5;
    const column = index % 2;
    const x = MARGIN + column * (cardWidth + 5);

    doc.setFillColor(250, 250, 249);
    doc.setDrawColor(231, 229, 228);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 3, 3, "FD");
    doc.setTextColor(87, 83, 78);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(label, x + 5, currentY + 7);
    doc.setTextColor(28, 25, 23);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(String(value), x + 5, currentY + 15);
  });

  return currentY + cardHeight + 8;
};

const drawEmptyChart = (doc, message, cursorY) => {
  const nextY = ensureSpace(doc, cursorY, 22);
  doc.setFillColor(250, 250, 249);
  doc.roundedRect(MARGIN, nextY, CONTENT_WIDTH, 20, 3, 3, "F");
  doc.setTextColor(87, 83, 78);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(message, MARGIN + 6, nextY + 12);
  return nextY + 27;
};

const drawOrdersByMonthChart = (doc, data, cursorY) => {
  let currentY = drawSectionTitle(doc, "Monto de pedidos por mes", cursorY);

  if (data.length === 0) {
    return drawEmptyChart(doc, "No existen pedidos para mostrar en la gráfica.", currentY);
  }

  const chunks = Array.from({ length: Math.ceil(data.length / 12) }, (_, index) =>
    data.slice(index * 12, index * 12 + 12),
  );

  chunks.forEach((chunk, chunkIndex) => {
    currentY = ensureSpace(doc, currentY, 82);
    if (chunkIndex > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(28, 25, 23);
      doc.text("Continuación de monto de pedidos por mes", MARGIN, currentY);
      currentY += 7;
    }

    const chartTop = currentY + 4;
    const chartHeight = 50;
    const chartBottom = chartTop + chartHeight;
    const maximum = Math.max(...chunk.map((item) => Number(item.total)), 1);
    const barWidth = CONTENT_WIDTH / chunk.length;

    doc.setDrawColor(214, 211, 209);
    doc.line(MARGIN, chartBottom, MARGIN + CONTENT_WIDTH, chartBottom);

    chunk.forEach((item, index) => {
      const total = Number(item.total);
      const barHeight = Math.max((total / maximum) * chartHeight, 1);
      const x = MARGIN + index * barWidth + 2;
      const width = Math.max(barWidth - 4, 2);

      doc.setFillColor(...GOLDEN);
      doc.rect(x, chartBottom - barHeight, width, barHeight, "F");
      doc.setTextColor(87, 83, 78);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(formatProductPrice(item.total), x + width / 2, chartBottom - barHeight - 2, {
        align: "center",
      });
      doc.text(item.label.slice(0, 3), x + width / 2, chartBottom + 6, {
        align: "center",
      });
    });

    currentY = chartBottom + 14;
  });

  return currentY;
};

const drawProductsByCategoryChart = (doc, data, cursorY) => {
  let currentY = drawSectionTitle(doc, "Productos por categoría", cursorY);

  if (data.length === 0) {
    return drawEmptyChart(doc, "No existen categorías o productos para mostrar.", currentY);
  }

  const maximum = Math.max(...data.map((item) => item.count), 1);
  data.forEach((item) => {
    currentY = ensureSpace(doc, currentY, 14);
    const barWidth = ((CONTENT_WIDTH - 48) * item.count) / maximum;
    const category = doc.splitTextToSize(item.category, 43)[0];

    doc.setTextColor(68, 64, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(category, MARGIN, currentY + 4);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(MARGIN + 48, currentY, CONTENT_WIDTH - 58, 6, 2, 2, "F");
    if (item.count > 0) {
      doc.setFillColor(...SKY);
      doc.roundedRect(MARGIN + 48, currentY, Math.max(barWidth, 1), 6, 2, 2, "F");
    }
    doc.setTextColor(68, 64, 60);
    doc.text(`${item.count}`, PAGE_WIDTH - MARGIN, currentY + 4, { align: "right" });
    currentY += 11;
  });

  return currentY + 4;
};

const drawLowStockTable = (doc, items, cursorY) => {
  let currentY = drawSectionTitle(doc, "Productos con bajo stock", cursorY);

  if (items.length === 0) {
    return drawEmptyChart(doc, "No existen productos con bajo stock.", currentY);
  }

  const columns = [
    { label: "Producto", x: MARGIN, width: 70 },
    { label: "Categoría", x: MARGIN + 72, width: 65 },
    { label: "Stock", x: MARGIN + 139, width: 26 },
  ];
  const drawHeader = () => {
    doc.setFillColor(28, 25, 23);
    doc.rect(MARGIN, currentY, CONTENT_WIDTH, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    columns.forEach((column) => doc.text(column.label, column.x + 3, currentY + 5));
    currentY += 8;
  };

  currentY = ensureSpace(doc, currentY, 17);
  drawHeader();
  items.forEach((item, index) => {
    if (currentY + 9 > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      currentY = MARGIN;
      drawHeader();
    }

    doc.setFillColor(index % 2 === 0 ? 250 : 245, index % 2 === 0 ? 250 : 245, index % 2 === 0 ? 249 : 244);
    doc.rect(MARGIN, currentY, CONTENT_WIDTH, 9, "F");
    doc.setTextColor(68, 64, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(doc.splitTextToSize(item.product, 64)[0], columns[0].x + 3, currentY + 6);
    doc.text(doc.splitTextToSize(item.category, 59)[0], columns[1].x + 3, currentY + 6);
    doc.text(String(item.stock), columns[2].x + 3, currentY + 6);
    currentY += 9;
  });

  return currentY + 4;
};

const addFooters = (doc) => {
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(231, 229, 228);
    doc.line(MARGIN, PAGE_HEIGHT - 10, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 113, 108);
    doc.text("E-commerce · Reporte administrativo", MARGIN, PAGE_HEIGHT - 5);
    doc.text(`Página ${page} de ${totalPages}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 5, {
      align: "right",
    });
  }
};

export const buildDashboardPdf = async (
  dashboardData,
  generatedAt = new Date(),
) => {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const { summary, orders_by_month, products_by_category, low_stock_items } =
    dashboardData;

  doc.setFillColor(28, 25, 23);
  doc.rect(0, 0, PAGE_WIDTH, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("E-commerce", MARGIN, 16);
  doc.setFontSize(13);
  doc.text("Reporte general del E-commerce", MARGIN, 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generado: ${formatDateTime(generatedAt)}`, MARGIN, 30);

  let cursorY = 46;
  cursorY = drawSectionTitle(doc, "Resumen", cursorY);
  cursorY = drawMetricCards(doc, summary, cursorY);
  cursorY = drawOrdersByMonthChart(doc, orders_by_month, cursorY);
  cursorY = drawProductsByCategoryChart(doc, products_by_category, cursorY);
  drawLowStockTable(doc, low_stock_items, cursorY);
  addFooters(doc);

  return { doc, filename: createFilename(generatedAt) };
};

export const exportDashboardPdf = async (dashboardData) => {
  const report = await buildDashboardPdf(dashboardData);
  report.doc.save(report.filename);
  return report.filename;
};
