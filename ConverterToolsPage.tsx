import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
  ArrowLeft, FileSpreadsheet, FileText, RefreshCw, Download,
  CheckCircle2, Upload, Wand2, Table, Globe2
} from 'lucide-react';

GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url).toString();

interface Props {
  onBack: () => void;
}

type ConversionMode = 'pdf-to-excel' | 'excel-to-pdf';

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function normalizeTableRows(rows: string[][]): string[][] {
  const width = Math.max(...rows.map((row) => row.length), 1);
  return rows.map((row) => Array.from({ length: width }, (_, index) => row[index] ?? ''));
}

function parseTextTable(rawText: string): string[][] {
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const rows = lines.map((line) => {
    if (line.includes('\t')) return line.split('\t').map((cell) => cell.trim());
    const multiSpace = line.split(/\s{2,}/).map((cell) => cell.trim()).filter(Boolean);
    if (multiSpace.length > 1) return multiSpace;
    return [line];
  });

  return normalizeTableRows(rows);
}

async function extractPdfRows(file: File): Promise<string[][]> {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise;
  const allRows: string[][] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const lineMap = new Map<number, { text: string; x: number }[]>();

    textContent.items.forEach((item) => {
      if (!('str' in item)) return;
      const text = String(item.str || '').trim();
      if (!text) return;
      const x = Math.round(item.transform[4]);
      const y = Math.round(item.transform[5] / 4) * 4;
      const bucket = lineMap.get(y) || [];
      bucket.push({ text, x });
      lineMap.set(y, bucket);
    });

    const orderedRows = Array.from(lineMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([, items]) => {
        const cells: string[] = [];
        items
          .sort((a, b) => a.x - b.x)
          .forEach((item, index) => {
            const previous = items[index - 1];
            if (!previous) {
              cells.push(item.text);
              return;
            }
            const gap = item.x - previous.x;
            if (gap > 50) {
              cells.push(item.text);
            } else {
              cells[cells.length - 1] = `${cells[cells.length - 1]} ${item.text}`.trim();
            }
          });
        return cells;
      })
      .filter((row) => row.length > 0);

    if (orderedRows.length > 0) {
      allRows.push(...normalizeTableRows(orderedRows));
    }
  }

  if (allRows.length > 0) return allRows;

  const fallbackText = await pdf.getPage(1).then(async (page) => {
    const content = await page.getTextContent();
    return content.items
      .map((item) => ('str' in item ? String(item.str || '') : ''))
      .join('\n');
  });

  return parseTextTable(fallbackText);
}

export default function ConverterToolsPage({ onBack }: Props) {
  const [mode, setMode] = useState<ConversionMode>('pdf-to-excel');
  const [isWorking, setIsWorking] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [lastFileName, setLastFileName] = useState<string>('');

  const previewColumns = useMemo(
    () => Math.max(0, ...previewRows.map((row) => row.length)),
    [previewRows]
  );

  const handleExcelToPdf = async (file: File) => {
    setIsWorking(true);
    setError('');
    setStatus('Reading spreadsheet...');
    setLastFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json<string[]>(workbook.Sheets[firstSheetName], {
        header: 1,
        defval: '',
      });

      const normalizedRows = normalizeTableRows(rows.filter((row) => row.some((cell) => String(cell).trim() !== '')));
      setPreviewRows(normalizedRows.slice(0, 20));
      setStatus('Generating PDF...');

      const pdf = new jsPDF({ orientation: normalizedRows[0]?.length > 6 ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' });
      pdf.setFontSize(16);
      pdf.text('Spreadsheet to PDF Export', 40, 40);
      pdf.setFontSize(10);
      pdf.text(`Source file: ${file.name}`, 40, 58);
      pdf.text(`Rows exported: ${Math.max(0, normalizedRows.length - 1)}`, 40, 72);

      autoTable(pdf, {
        startY: 90,
        head: normalizedRows.length > 0 ? [normalizedRows[0]] : [['No Data']],
        body: normalizedRows.length > 1 ? normalizedRows.slice(1) : [],
        styles: {
          fontSize: 8,
          cellPadding: 4,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { left: 32, right: 32 },
      });

      const blob = pdf.output('blob');
      downloadBlob(blob, `${file.name.replace(/\.[^.]+$/, '')}.pdf`);
      setStatus('Done! Your PDF download has started.');
    } catch (conversionError) {
      setError('Could not convert this spreadsheet to PDF. Please check the file structure and try again.');
      setStatus('');
    } finally {
      setIsWorking(false);
    }
  };

  const handlePdfToExcel = async (file: File) => {
    setIsWorking(true);
    setError('');
    setStatus('Extracting text and table structure from PDF...');
    setLastFileName(file.name);

    try {
      const rows = await extractPdfRows(file);
      const normalizedRows = normalizeTableRows(rows.filter((row) => row.some((cell) => String(cell).trim() !== '')));
      setPreviewRows(normalizedRows.slice(0, 20));
      setStatus('Creating Excel workbook...');

      const worksheet = XLSX.utils.aoa_to_sheet(normalizedRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Extracted Data');
      const output = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      downloadBlob(
        new Blob([output], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `${file.name.replace(/\.[^.]+$/, '')}.xlsx`
      );
      setStatus('Done! Your Excel download has started.');
    } catch (conversionError) {
      setError('Could not extract a readable table from this PDF. Text-based PDFs work best for PDF to Excel conversion.');
      setStatus('');
    } finally {
      setIsWorking(false);
    }
  };

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (mode === 'excel-to-pdf') {
      await handleExcelToPdf(file);
    } else {
      await handlePdfToExcel(file);
    }

    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-2 mb-5">
              <Wand2 className="w-4 h-4 text-brand-400" />
              <span className="text-brand-300 text-sm font-medium">Conversion Tools</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              PDF to Excel and Excel to PDF
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
              Convert spreadsheets into polished PDF reports or extract table-like data from text-based PDFs into Excel — all directly in your browser.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <button
                onClick={() => {
                  setMode('pdf-to-excel');
                  setPreviewRows([]);
                  setError('');
                  setStatus('');
                }}
                className={`text-left rounded-2xl border p-5 transition-all duration-200 ${
                  mode === 'pdf-to-excel'
                    ? 'bg-brand-500/10 border-brand-500/30 ring-1 ring-brand-500/30'
                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/70'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-brand-400" />
                </div>
                <h2 className="text-white font-semibold mb-1">PDF to Excel</h2>
                <p className="text-sm text-slate-400">
                  Best for invoices, reports, and text-based table PDFs. Extracted rows are exported as an .xlsx file.
                </p>
              </button>

              <button
                onClick={() => {
                  setMode('excel-to-pdf');
                  setPreviewRows([]);
                  setError('');
                  setStatus('');
                }}
                className={`text-left rounded-2xl border p-5 transition-all duration-200 ${
                  mode === 'excel-to-pdf'
                    ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/30'
                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/70'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-white font-semibold mb-1">Excel to PDF</h2>
                <p className="text-sm text-slate-400">
                  Turn XLS, XLSX, or CSV files into clean downloadable PDF tables for sharing, printing, or reporting.
                </p>
              </button>
            </div>

            <div className="mt-8 bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {mode === 'pdf-to-excel' ? 'Convert a PDF into Excel' : 'Export Excel as PDF'}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {mode === 'pdf-to-excel'
                      ? 'Upload a PDF and extract structured text into an Excel workbook.'
                      : 'Upload a spreadsheet and generate a downloadable PDF table.'}
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white font-medium cursor-pointer transition-all duration-300 shadow-lg shadow-brand-500/20">
                  {isWorking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {mode === 'pdf-to-excel' ? 'Upload PDF' : 'Upload Spreadsheet'}
                  <input
                    type="file"
                    accept={mode === 'pdf-to-excel' ? '.pdf' : '.xlsx,.xls,.csv'}
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={isWorking}
                  />
                </label>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                {[
                  {
                    icon: Table,
                    title: 'Structured output',
                    desc: mode === 'pdf-to-excel' ? 'Extract rows and columns when table-like text is available.' : 'Keep spreadsheet rows in a printable PDF layout.',
                  },
                  {
                    icon: Download,
                    title: 'One-click download',
                    desc: 'Converted files are downloaded instantly after processing finishes.',
                  },
                  {
                    icon: Globe2,
                    title: 'Browser-only processing',
                    desc: 'Files stay in your browser for faster, private conversion.',
                  },
                ].map((item) => (
                  <div key={item.title} className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4">
                    <item.icon className="w-5 h-5 text-brand-400 mb-3" />
                    <h4 className="text-white text-sm font-semibold mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {status && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-300">{status}</span>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 mb-4">
                  <span className="text-sm text-rose-300">{error}</span>
                </div>
              )}

              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-5 text-sm text-slate-400">
                {lastFileName ? (
                  <div className="space-y-1">
                    <div className="text-white font-medium">Last file: {lastFileName}</div>
                    <div>Preview rows: {previewRows.length}</div>
                    <div>Preview columns: {previewColumns}</div>
                  </div>
                ) : (
                  <div>
                    Upload a file to start converting. CSV, XLS, and XLSX are supported for Excel to PDF. Text-based PDFs work best for PDF to Excel.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 sticky top-24">
            <h3 className="text-white font-semibold mb-4">Conversion Preview</h3>
            <p className="text-sm text-slate-400 mb-4">
              After conversion, the first extracted rows appear here so you can verify the output structure.
            </p>

            {previewRows.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-700/50">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-900/80">
                      {Array.from({ length: previewColumns }).map((_, index) => (
                        <th key={index} className="px-3 py-2 text-left text-slate-400 whitespace-nowrap">
                          Column {index + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-slate-800/50">
                        {Array.from({ length: previewColumns }).map((_, columnIndex) => (
                          <td key={columnIndex} className="px-3 py-2 text-slate-300 whitespace-nowrap max-w-[180px] truncate">
                            {row[columnIndex] || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-8 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
                  {mode === 'pdf-to-excel' ? (
                    <FileText className="w-7 h-7 text-brand-400" />
                  ) : (
                    <FileSpreadsheet className="w-7 h-7 text-emerald-400" />
                  )}
                </div>
                <h4 className="text-white font-medium mb-2">No preview yet</h4>
                <p className="text-sm text-slate-500">
                  Upload a file to generate a preview and download the converted output.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
