import { useState } from 'react';
import { DataRow, ColumnInfo } from '../types';
import {
  Table, ChevronLeft, ChevronRight, AlertTriangle,
  Mail, Phone, Calendar, Hash, Type, HelpCircle
} from 'lucide-react';

interface Props {
  data: DataRow[];
  columns: ColumnInfo[];
}

const TYPE_ICONS: Record<string, typeof Mail> = {
  email: Mail,
  phone: Phone,
  date: Calendar,
  number: Hash,
  string: Type,
  boolean: HelpCircle,
  unknown: HelpCircle,
};

const TYPE_COLORS: Record<string, string> = {
  email: 'text-brand-400 bg-brand-500/10',
  phone: 'text-emerald-400 bg-emerald-500/10',
  date: 'text-violet-400 bg-violet-500/10',
  number: 'text-amber-400 bg-amber-500/10',
  string: 'text-slate-400 bg-slate-500/10',
  boolean: 'text-cyan-400 bg-cyan-500/10',
  unknown: 'text-slate-500 bg-slate-500/10',
};

export default function DataPreview({ data, columns }: Props) {
  const [page, setPage] = useState(0);
  const pageSize = 15;
  const totalPages = Math.ceil(data.length / pageSize);
  const pageData = data.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div>
      {/* Column Analysis */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Table className="w-5 h-5 text-brand-400" />
          Column Analysis
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {columns.map((col) => {
            const Icon = TYPE_ICONS[col.type] || HelpCircle;
            const color = TYPE_COLORS[col.type] || TYPE_COLORS.unknown;
            const completeness = ((col.totalCount - col.nullCount) / col.totalCount * 100).toFixed(0);

            return (
              <div
                key={col.name}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-white text-sm font-medium truncate flex-1" title={col.name}>
                    {col.name}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Type</span>
                    <span className="text-slate-300 capitalize">{col.type}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Unique</span>
                    <span className="text-slate-300">{col.uniqueCount}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Complete</span>
                    <span className={`font-medium ${parseInt(completeness) >= 90 ? 'text-emerald-400' : parseInt(completeness) >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {completeness}%
                    </span>
                  </div>
                  {col.nullCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      {col.nullCount} missing
                    </div>
                  )}
                  {/* Completeness bar */}
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${parseInt(completeness) >= 90 ? 'bg-emerald-500' : parseInt(completeness) >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Table className="w-4 h-4 text-brand-400" />
            Data Preview
            <span className="text-xs text-slate-500 font-normal">
              ({data.length} rows × {columns.length} columns)
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 min-w-[80px] text-center">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 w-12">#</th>
                {columns.map(col => (
                  <th key={col.name} className="px-3 py-2.5 text-left text-xs font-medium text-slate-400 whitespace-nowrap">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((row, i) => {
                const rowIdx = page * pageSize + i;
                const isEmptyRow = Object.values(row).every(v => !v || String(v).trim() === '');

                return (
                  <tr
                    key={rowIdx}
                    className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors
                      ${isEmptyRow ? 'bg-rose-500/5' : ''}
                    `}
                  >
                    <td className="px-3 py-2 text-xs text-slate-600">{rowIdx + 1}</td>
                    {columns.map(col => {
                      const val = row[col.name];
                      const isEmpty = val === null || val === undefined || String(val).trim() === '';
                      const hasExtraSpaces = !isEmpty && String(val) !== String(val).trim();

                      return (
                        <td key={col.name} className="px-3 py-2 whitespace-nowrap max-w-[200px] truncate">
                          {isEmpty ? (
                            <span className="text-rose-400/60 text-xs italic">empty</span>
                          ) : (
                            <span className={`text-slate-300 ${hasExtraSpaces ? 'bg-amber-500/10 px-1 rounded' : ''}`}>
                              {String(val)}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
