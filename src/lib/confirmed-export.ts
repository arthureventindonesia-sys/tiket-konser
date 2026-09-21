import { formatRupiah } from "@/lib/format";

export type ConfirmedExportRow = {
  fullName: string;
  email: string;
  whatsapp: string;
  address: string;
  qtyVvip: number;
  qtyVip: number;
  qtyFestival: number;
  ticketCodes: string;
  baseAmount: number;
  uniqueCode: number;
  totalAmount: number;
  referralCode: string;
  confirmedAt: string;
  createdAt: string;
};

const HEADERS = [
  "Nama",
  "Email",
  "WhatsApp",
  "Alamat",
  "VVIP",
  "VIP",
  "Festival",
  "Kode tiket",
  "Nominal tiket",
  "Kode unik",
  "Total bayar",
  "Referal",
  "Dikonfirmasi",
] as const;

function fileDay() {
  return new Date().toISOString().slice(0, 10);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function confirmedLabel(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("id-ID");
}

function xmlEscape(value: string) {
  return value.replace(/[&<>"]/g, (ch) => {
    if (ch === "&") return "&" + "amp;";
    if (ch === "<") return "&" + "lt;";
    if (ch === ">") return "&" + "gt;";
    return "&" + "quot;";
  });
}

function rowValues(r: ConfirmedExportRow): (string | number)[] {
  return [
    r.fullName,
    r.email,
    r.whatsapp,
    r.address,
    r.qtyVvip,
    r.qtyVip,
    r.qtyFestival,
    r.ticketCodes,
    r.baseAmount,
    r.uniqueCode.toString().padStart(3, "0"),
    r.totalAmount,
    r.referralCode,
    confirmedLabel(r.confirmedAt),
  ];
}

export function downloadConfirmedCsv(rows: ConfirmedExportRow[]) {
  const csvCell = (value: string | number) => {
    const s = String(value ?? "");
    if (/[;"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [HEADERS.join(";"), ...rows.map((r) => rowValues(r).map(csvCell).join(";"))];
  triggerDownload(
    new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" }),
    `gsf-terkonfirmasi-${fileDay()}.csv`,
  );
}

export function downloadConfirmedExcel(rows: ConfirmedExportRow[]) {
  const numberIdx = new Set([4, 5, 6, 8, 10]);
  const cells = (values: (string | number)[], header = false) =>
    values
      .map((v, i) => {
        const isNum = !header && numberIdx.has(i) && typeof v === "number";
        return `<Cell><Data ss:Type="${isNum ? "Number" : "String"}">${xmlEscape(String(v ?? ""))}</Data></Cell>`;
      })
      .join("");
  const body = rows
    .map((r) => `<Row>${cells(rowValues(r))}</Row>`)
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Terkonfirmasi">
<Table>
<Row>${cells([...HEADERS], true)}</Row>
${body}
</Table>
</Worksheet>
</Workbook>`;
  triggerDownload(
    new Blob(["\uFEFF" + xml], { type: "application/vnd.ms-excel" }),
    `gsf-terkonfirmasi-${fileDay()}.xls`,
  );
}

export async function downloadConfirmedPdf(rows: ConfirmedExportRow[]) {
  const { jsPDF } = await import("jspdf");
  const { autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setFontSize(14);
  doc.text("Golden Satya Fair - Data terkonfirmasi", 14, 14);
  doc.setFontSize(9);
  doc.text(`Diunduh ${new Date().toLocaleString("id-ID")} · ${rows.length} pesanan`, 14, 20);
  autoTable(doc, {
    startY: 24,
    head: [HEADERS as unknown as string[]],
    body: rows.map((r) => [
      r.fullName,
      r.email,
      r.whatsapp,
      r.address,
      String(r.qtyVvip),
      String(r.qtyVip),
      String(r.qtyFestival),
      r.ticketCodes,
      formatRupiah(r.baseAmount),
      r.uniqueCode.toString().padStart(3, "0"),
      formatRupiah(r.totalAmount),
      r.referralCode,
      confirmedLabel(r.confirmedAt),
    ]),
    styles: { fontSize: 7, cellPadding: 1.2, overflow: "linebreak" },
    headStyles: { fillColor: [201, 166, 107], textColor: [12, 10, 8], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 244, 236] },
    margin: { left: 10, right: 10 },
  });
  doc.save(`gsf-terkonfirmasi-${fileDay()}.pdf`);
}
