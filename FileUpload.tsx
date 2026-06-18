import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DataRow } from '../types';
import { generateSampleCSV } from '../sampleData';
import {
  Upload, FileSpreadsheet, X, FileText, Download,
  Sparkles, ArrowLeft, AlertCircle
} from 'lucide-react';

interface Props {
  onDataLoaded: (data: DataRow[], fileName: string) => void;
  onBack: () => void;
}

export default function FileUpload({ onDataLoaded, onBack }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processCSV = useCallback((text: string, fileName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: false,
        dynamicTyping: false,
        transformHeader: (h: string) => h.trim(),
      });

      if (result.errors.length > 0 && result.data.length === 0) {
        setError('File parse error: ' + result.errors[0].message);
        setIsLoading(false);
        return;
      }

      const data = result.data as DataRow[];
      if (data.length === 0) {
        setError('File is empty or has no valid rows.');
        setIsLoading(false);
        return;
      }

      setTimeout(() => {
        onDataLoaded(data, fileName);
        setIsLoading(false);
      }, 500);
    } catch {
      setError('Failed to parse the file. Please check the format and try again.');
      setIsLoading(false);
    }
  }, [onDataLoaded]);

  const processExcel = useCallback((buffer: ArrayBuffer, fileName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as DataRow[];

      if (data.length === 0) {
        setError('Excel file is empty or has no valid rows.');
        setIsLoading(false);
        return;
      }

      setTimeout(() => {
        onDataLoaded(data, fileName);
        setIsLoading(false);
      }, 500);
    } catch {
      setError('Failed to parse the Excel file.');
      setIsLoading(false);
    }
  }, [onDataLoaded]);

  const handleFile = useCallback((file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        processCSV(text, file.name);
      };
      reader.readAsText(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        processExcel(buffer, file.name);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('Unsupported file format. Please upload CSV, TSV, XLS, or XLSX files.');
    }
  }, [processCSV, processExcel]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const loadSampleData = useCallback(() => {
    const csv = generateSampleCSV();
    processCSV(csv, 'sample_dirty_data.csv');
  }, [processCSV]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500/10 rounded-2xl mb-4">
            <Upload className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Upload Your Data File</h1>
          <p className="text-slate-400">
            Upload a CSV, Excel (XLS/XLSX), or TSV file and the app will automatically analyze it.
          </p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer
            ${isDragging
              ? 'border-brand-400 bg-brand-500/10 scale-[1.02]'
              : 'border-slate-700 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'
            }
            ${isLoading ? 'pointer-events-none opacity-60' : ''}
          `}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".csv,.tsv,.txt,.xls,.xlsx"
            onChange={handleInputChange}
            className="hidden"
          />

          {isLoading ? (
            <div className="animate-fadeIn">
              <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg text-white font-medium">Processing your file...</p>
              <p className="text-sm text-slate-400 mt-2">Analyzing columns and detecting issues</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-brand-400" />
                </div>
              </div>
              <p className="text-lg text-white font-medium mb-2">
                {isDragging ? 'Drop the file here' : 'Drag and drop your file here'}
              </p>
              <p className="text-sm text-slate-400 mb-4">or click to browse your local files</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['CSV', 'TSV', 'XLS', 'XLSX'].map((fmt) => (
                  <span key={fmt} className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-400">
                    .{fmt.toLowerCase()}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-rose-300 font-medium">Upload Error</p>
              <p className="text-rose-400/80 text-sm mt-1">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-slate-500 text-sm mb-4">
            <div className="w-8 h-px bg-slate-700" />
            or
            <div className="w-8 h-px bg-slate-700" />
          </div>
          <br />
          <button
            onClick={loadSampleData}
            className="inline-flex items-center gap-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Try the Sample Dirty Dataset
            <Download className="w-4 h-4 text-slate-400" />
          </button>
          <p className="text-xs text-slate-600 mt-3">20 rows with intentional issues — ideal for testing the workflow.</p>
        </div>

        <div className="mt-12 bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-lg">💡</span> Tips for Best Results
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Use the first row as column headers whenever possible.',
              'Recommended file size limit: 50MB for browser-based processing.',
              'Supported formats: CSV, TSV, XLS, and XLSX.',
              'Your file stays in your browser during processing.',
              'Structured tabular data produces the best cleaning results.',
              'Unicode and UTF-8 encoded content are supported.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="text-emerald-400 mt-0.5">✓</span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
