/**
 * Export table data to Excel (xlsx) or PDF from the frontend.
 * columns: [{ key: 'fieldName', label: 'Column Header' }]
 * rows: array of objects (e.g. filteredData)
 */
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

export function exportToExcel(rows, columns, filename = "export.xlsx") {
  if (!columns?.length || !Array.isArray(rows)) return;
  const headers = columns.map((c) => c.label);
  const data = rows.map((row) => columns.map((c) => row[c.key] ?? ""));
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

export function exportToPdf(rows, columns, filename = "export.pdf") {
  if (!columns?.length || !Array.isArray(rows)) return;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt" });
  const headers = columns.map((c) => c.label);
  const body = rows.map((row) => columns.map((c) => String(row[c.key] ?? "")));
  autoTable(doc, {
    head: [headers],
    body,
    styles: { fontSize: 8 },
    margin: { left: 20, right: 20 },
  });
  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
