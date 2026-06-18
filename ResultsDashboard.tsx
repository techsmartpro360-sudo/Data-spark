import { useState, useMemo } from 'react';
import { DataRow, CleaningResult, Issue } from '../types';
import { generateCSV } from '../cleaningEngine';
import {
  Download, CheckCircle, AlertTriangle, XCircle, Info,
  TrendingUp, Trash2, Mail, Edit3, ChevronLeft, ChevronRight,
  FileText, BarChart3, Table, Eye
} from 'lucide-react';

interface Props {
  result: CleaningResult;
  originalData: DataRow[];
  fileName: string;
}

type ResultTab = 'summary' | 'issues' | 'cleaned' | 'comparison';

const ISSUE_ICONS: Record<string, typeof CheckCircle> = {
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const ISSUE_COLORS: Record<string, string> = {
  error: 'text-rose-400 bg-rose-500/10',
  warning: 'text-amber-400 bg-amber-500/10',
  info: 'text-brand-400 bg-brand-500/10',
};

export default function ResultsDashboard({ result, originalData, fileName }: Props) {
  const [resultTab, setResultTab] = useState<ResultTab>('summary');
  const [issuePage, setIssuePage] = useState(0);
  const [cleanPage, setCleanPage] = useState(0);
  const [issueFilter, setIssueFilter] = useState<string>('all');
  const pageSize = 15;

  const filteredIssues = useMemo(() => {
    if (issueFilter === 'all') return result.issuesFound;
    return result.issuesFound.filter(i => i.type === issueFilter);
  }, [result.issuesFound, issueFilter]);

  const issueStats = useMemo(() => ({
    errors: result.issuesFound.filter(i => i.type === 'error').length,
    warnings: result.issuesFound.filter(i => i.type === 'warning').length,
    info: result.issuesFound.filter(i => i.type === 'info').length,
  }), [result.issuesFound]);

  const handleDownload = () => {
    const csv = generateCSV(result.cleanedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleaned_${fileName}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadReport = () => {
    const lines = [
      '# Data Cleaning Report',
      `File: ${fileName}`,
      `Date: ${new Date().toISOString()}`,
      '',
      '## Summary',
      `Original Rows: ${result.originalRows}`,
      `Cleaned Rows: ${result.cleanedRows}`,
      `Duplicates Removed: ${result.duplicatesRemoved}`,
      `Invalid Emails Fixed: ${result.invalidEmailsFixed}`,
      `Missing Values Filled: ${result.missingValuesFilled}`,
      `Formatting Fixed: ${result.formattingFixed}`,
      '',
      '## Issues Found',
      ...result.issuesFound.map(i =>
        `[${i.type.toUpperCase()}] Row ${i.row}, Column "${i.column}": ${i.message}${i.fixedValue ? ` (Fixed: "${i.fixedValue}")` : ''}`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${fileName.replace(/\.\w+$/, '.txt')}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = result.cleanedData.length > 0 ? Object.keys(result.cleanedData[0]) : [];

  const resultTabs: { id: ResultTab; label: string; icon: typeof BarChart3 }[] = [
    { id: 'summary', label: 'Summary', icon: BarChart3 },
    { id: 'issues', label: `Issues (${result.issuesFound.length})`, icon: AlertTriangle },
    { id: 'cleaned', label: 'Cleaned Data', icon: Table },
    { id: 'comparison', label: 'Before/After', icon: Eye },
  ];

  return (
    <div>
      {/* Download bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-emerald-300 font-semibold">Cleaning Complete!</p>
            <p className="text-emerald-400/70 text-sm">
              {result.cleanedRows} clean rows ready • {result.issuesFound.length} issues processed
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-white transition-colors"
          >
            <FileText className="w-4 h-4" />
            Download Report
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            Download Clean CSV
          </button>
        </div>
      </div>

      {/* Result Tabs */}
      <div className="flex gap-1 bg-slate-800/40 p-1 rounded-xl inline-flex mb-6">
        {resultTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setResultTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${resultTab === tab.id
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      {resultTab === 'summary' && (
        <div className="animate-fadeIn">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: 'Original Rows', value: result.originalRows, icon: Table, color: 'text-slate-400', bg: 'bg-slate-500/10' },
              { label: 'Cleaned Rows', value: result.cleanedRows, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Duplicates Removed', value: result.duplicatesRemoved, icon: Trash2, color: 'text-rose-400', bg: 'bg-rose-500/10' },
              { label: 'Emails Fixed', value: result.invalidEmailsFixed, icon: Mail, color: 'text-brand-400', bg: 'bg-brand-500/10' },
              { label: 'Missing Filled', value: result.missingValuesFilled, icon: Edit3, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Formatting Fixed', value: result.formattingFixed, icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg} mb-2`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quality Score */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-400" />
              Data Quality Improvement
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Before Cleaning</span>
                  <span className="text-rose-400 font-medium">
                    {Math.max(0, Math.round(100 - (result.issuesFound.length / Math.max(1, result.originalRows)) * 100))}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.max(10, 100 - (result.issuesFound.length / Math.max(1, result.originalRows)) * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">After Cleaning</span>
                  <span className="text-emerald-400 font-medium">
                    {Math.min(100, Math.round(100 - (issueStats.errors / Math.max(1, result.cleanedRows)) * 100))}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-brand-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, 100 - (issueStats.errors / Math.max(1, result.cleanedRows)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issues List */}
      {resultTab === 'issues' && (
        <div className="animate-fadeIn">
          {/* Filters */}
          <div className="flex gap-2 mb-4">
            {[
              { key: 'all', label: `All (${result.issuesFound.length})` },
              { key: 'error', label: `Errors (${issueStats.errors})` },
              { key: 'warning', label: `Warnings (${issueStats.warnings})` },
              { key: 'info', label: `Info (${issueStats.info})` },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => { setIssueFilter(f.key); setIssuePage(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${issueFilter === f.key ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'}
                `}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Row</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Column</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Issue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Original</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Fixed</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues
                    .slice(issuePage * pageSize, (issuePage + 1) * pageSize)
                    .map((issue: Issue, i: number) => {
                      const Icon = ISSUE_ICONS[issue.type] || Info;
                      const color = ISSUE_COLORS[issue.type] || ISSUE_COLORS.info;
                      return (
                        <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="px-4 py-2.5">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${color}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">
                            {issue.row || '—'}
                          </td>
                          <td className="px-4 py-2.5 text-brand-400 text-xs">{issue.column}</td>
                          <td className="px-4 py-2.5 text-slate-300 text-xs">{issue.message}</td>
                          <td className="px-4 py-2.5">
                            {issue.originalValue ? (
                              <code className="text-xs bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded">
                                {issue.originalValue}
                              </code>
                            ) : (
                              <span className="text-slate-600 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            {issue.fixedValue ? (
                              <code className="text-xs bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded">
                                {issue.fixedValue}
                              </code>
                            ) : (
                              <span className="text-slate-600 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {filteredIssues.length > pageSize && (
              <div className="flex items-center justify-between p-3 border-t border-slate-700/50">
                <button
                  onClick={() => setIssuePage(p => Math.max(0, p - 1))}
                  disabled={issuePage === 0}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400">
                  Page {issuePage + 1} of {Math.ceil(filteredIssues.length / pageSize)}
                </span>
                <button
                  onClick={() => setIssuePage(p => p + 1)}
                  disabled={(issuePage + 1) * pageSize >= filteredIssues.length}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cleaned Data */}
      {resultTab === 'cleaned' && (
        <div className="animate-fadeIn">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 w-12">#</th>
                    {columns.map(col => (
                      <th key={col} className="px-3 py-2.5 text-left text-xs font-medium text-slate-400 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.cleanedData
                    .slice(cleanPage * pageSize, (cleanPage + 1) * pageSize)
                    .map((row, i) => (
                      <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="px-3 py-2 text-xs text-slate-600">{cleanPage * pageSize + i + 1}</td>
                        {columns.map(col => (
                          <td key={col} className="px-3 py-2 text-slate-300 whitespace-nowrap max-w-[200px] truncate text-xs">
                            {String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {result.cleanedData.length > pageSize && (
              <div className="flex items-center justify-between p-3 border-t border-slate-700/50">
                <button
                  onClick={() => setCleanPage(p => Math.max(0, p - 1))}
                  disabled={cleanPage === 0}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400">
                  Page {cleanPage + 1} of {Math.ceil(result.cleanedData.length / pageSize)}
                </span>
                <button
                  onClick={() => setCleanPage(p => p + 1)}
                  disabled={(cleanPage + 1) * pageSize >= result.cleanedData.length}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Before/After Comparison */}
      {resultTab === 'comparison' && (
        <div className="animate-fadeIn grid md:grid-cols-2 gap-4">
          <div className="bg-slate-800/30 border border-rose-500/20 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50 bg-rose-500/5">
              <h3 className="text-rose-300 font-semibold text-sm flex items-center gap-2">
                ❌ Before ({originalData.length} rows)
              </h3>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-900">
                  <tr className="border-b border-slate-700/50">
                    <th className="px-2 py-2 text-left text-slate-500 w-8">#</th>
                    {columns.map(col => (
                      <th key={col} className="px-2 py-2 text-left text-slate-500 whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {originalData.slice(0, 30).map((row, i) => (
                    <tr key={i} className="border-b border-slate-800/30">
                      <td className="px-2 py-1.5 text-slate-600">{i + 1}</td>
                      {columns.map(col => (
                        <td key={col} className="px-2 py-1.5 text-slate-400 whitespace-nowrap max-w-[120px] truncate">
                          {String(row[col] ?? '') || <span className="text-rose-400/50 italic">empty</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-800/30 border border-emerald-500/20 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50 bg-emerald-500/5">
              <h3 className="text-emerald-300 font-semibold text-sm flex items-center gap-2">
                ✅ After ({result.cleanedData.length} rows)
              </h3>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-900">
                  <tr className="border-b border-slate-700/50">
                    <th className="px-2 py-2 text-left text-slate-500 w-8">#</th>
                    {columns.map(col => (
                      <th key={col} className="px-2 py-2 text-left text-slate-500 whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.cleanedData.slice(0, 30).map((row, i) => (
                    <tr key={i} className="border-b border-slate-800/30">
                      <td className="px-2 py-1.5 text-slate-600">{i + 1}</td>
                      {columns.map(col => (
                        <td key={col} className="px-2 py-1.5 text-emerald-300/80 whitespace-nowrap max-w-[120px] truncate">
                          {String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
