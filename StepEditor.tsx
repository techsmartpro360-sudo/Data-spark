import { useState } from 'react';
import { CleaningStep, CleaningAction, ColumnInfo } from '../types';
import { PHONE_COUNTRY_PRESETS } from '../phoneUtils';
import {
  GripVertical, Trash2, ChevronDown, ToggleLeft, ToggleRight,
  Mail, Phone, Copy, Type, Calendar, Hash, Eraser, Filter, FileText, Zap
} from 'lucide-react';

interface Props {
  steps: CleaningStep[];
  columns: ColumnInfo[];
  onStepsChange: (steps: CleaningStep[]) => void;
}

const ACTION_META: Record<CleaningAction, { label: string; icon: typeof Mail; color: string; desc: string }> = {
  remove_duplicates: { label: 'Remove Duplicates', icon: Copy, color: 'text-rose-400 bg-rose-500/10', desc: 'Remove duplicate rows based on a selected column' },
  fill_missing: { label: 'Fill Missing Values', icon: FileText, color: 'text-amber-400 bg-amber-500/10', desc: 'Fill blank cells with a constant, mean, or mode value' },
  validate_email: { label: 'Validate Emails', icon: Mail, color: 'text-brand-400 bg-brand-500/10', desc: 'Fix email formatting problems and common typos' },
  validate_phone: { label: 'Validate Phones', icon: Phone, color: 'text-emerald-400 bg-emerald-500/10', desc: 'Format phone numbers with country-wise code presets' },
  text_transform: { label: 'Text Transform', icon: Type, color: 'text-violet-400 bg-violet-500/10', desc: 'Convert text to title case, uppercase, lowercase, or sentence case' },
  remove_whitespace: { label: 'Remove Whitespace', icon: Eraser, color: 'text-cyan-400 bg-cyan-500/10', desc: 'Trim extra spaces and normalize spacing' },
  filter_rows: { label: 'Filter Rows', icon: Filter, color: 'text-orange-400 bg-orange-500/10', desc: 'Remove rows using numeric filter conditions' },
  standardize_date: { label: 'Standardize Dates', icon: Calendar, color: 'text-purple-400 bg-purple-500/10', desc: 'Convert dates into YYYY-MM-DD format' },
  remove_empty_rows: { label: 'Remove Empty Rows', icon: Trash2, color: 'text-slate-400 bg-slate-500/10', desc: 'Delete completely empty rows' },
  fix_encoding: { label: 'Fix Encoding', icon: Zap, color: 'text-yellow-400 bg-yellow-500/10', desc: 'Fix common character encoding issues' },
  number_format: { label: 'Clean Numbers', icon: Hash, color: 'text-teal-400 bg-teal-500/10', desc: 'Remove currency symbols, commas, and spacing from numeric values' },
  remove_special_chars: { label: 'Remove Special Characters', icon: Eraser, color: 'text-pink-400 bg-pink-500/10', desc: 'Strip unsupported special characters from text' },
};

export default function StepEditor({ steps, columns, onStepsChange }: Props) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const toggleStep = (id: string) => {
    onStepsChange(steps.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const deleteStep = (id: string) => {
    onStepsChange(steps.filter((s) => s.id !== id));
  };

  const updateStep = (id: string, updates: Partial<CleaningStep>) => {
    onStepsChange(steps.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    const newSteps = [...steps];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= newSteps.length) return;
    [newSteps[idx], newSteps[newIdx]] = [newSteps[newIdx], newSteps[idx]];
    onStepsChange(newSteps);
  };

  if (steps.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
        <Zap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-lg font-medium">No cleaning steps added</p>
        <p className="text-slate-500 text-sm mt-2">Click “Auto-Detect” or “Add Step” to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {steps.map((step, idx) => {
        const meta = ACTION_META[step.action];
        const Icon = meta.icon;
        const isExpanded = expandedStep === step.id;

        return (
          <div
            key={step.id}
            className={`bg-slate-800/40 border rounded-xl transition-all duration-200 overflow-hidden
              ${step.enabled ? 'border-slate-700/50' : 'border-slate-800/50 opacity-60'}
              ${isExpanded ? 'ring-1 ring-brand-500/30' : ''}
            `}
          >
            <div className="flex items-center gap-3 p-3">
              <div className="flex items-center gap-1.5">
                <GripVertical className="w-4 h-4 text-slate-600 cursor-grab" />
                <span className="text-xs text-slate-600 font-mono w-5">{idx + 1}</span>
              </div>

              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium truncate">{step.description}</div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
                  <span>{meta.label}</span>
                  {step.column && (
                    <>
                      <span>•</span>
                      <span className="text-brand-400">Column: {step.column}</span>
                    </>
                  )}
                  {step.action === 'validate_phone' && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400">
                        {PHONE_COUNTRY_PRESETS.find((preset) => preset.key === (step.params?.country ?? 'auto'))?.label || 'Auto detect'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveStep(idx, -1)}
                  disabled={idx === 0}
                  className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30"
                  title="Move up"
                >
                  <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                </button>
                <button
                  onClick={() => moveStep(idx, 1)}
                  disabled={idx === steps.length - 1}
                  className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30"
                  title="Move down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                  className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  title="Edit"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={() => toggleStep(step.id)}
                  className="p-1 transition-colors"
                  title={step.enabled ? 'Disable' : 'Enable'}
                >
                  {step.enabled ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
                </button>
                <button
                  onClick={() => deleteStep(step.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="px-4 pb-4 pt-2 border-t border-slate-700/50 bg-slate-800/30 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Action Type</label>
                    <select
                      value={step.action}
                      onChange={(e) =>
                        updateStep(step.id, {
                          action: e.target.value as CleaningAction,
                          description: ACTION_META[e.target.value as CleaningAction]?.label + (step.column ? ` in "${step.column}"` : ''),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                    >
                      {Object.entries(ACTION_META).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">{meta.desc}</p>
                  </div>

                  {step.action !== 'remove_empty_rows' && step.action !== 'fix_encoding' && (
                    <div>
                      <label className="text-xs text-slate-400 font-medium mb-1.5 block">Column</label>
                      <select
                        value={step.column || ''}
                        onChange={(e) =>
                          updateStep(step.id, {
                            column: e.target.value,
                            description: ACTION_META[step.action]?.label + ` in "${e.target.value}"`,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select column...</option>
                        {columns.map((c) => (
                          <option key={c.name} value={c.name}>{c.name} ({c.type})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {step.action === 'fill_missing' && (
                    <>
                      <div>
                        <label className="text-xs text-slate-400 font-medium mb-1.5 block">Fill Method</label>
                        <select
                          value={step.params?.method || 'constant'}
                          onChange={(e) => updateStep(step.id, { params: { ...step.params, method: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                        >
                          <option value="constant">Constant Value</option>
                          <option value="mean">Mean (Average)</option>
                          <option value="mode">Mode (Most Frequent)</option>
                        </select>
                      </div>
                      {(step.params?.method === 'constant' || !step.params?.method) && (
                        <div>
                          <label className="text-xs text-slate-400 font-medium mb-1.5 block">Fill Value</label>
                          <input
                            type="text"
                            value={step.params?.value || ''}
                            onChange={(e) => updateStep(step.id, { params: { ...step.params, value: e.target.value } })}
                            placeholder="N/A"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {step.action === 'text_transform' && (
                    <div>
                      <label className="text-xs text-slate-400 font-medium mb-1.5 block">Transform Type</label>
                      <select
                        value={step.params?.transformation || 'title_case'}
                        onChange={(e) => updateStep(step.id, { params: { ...step.params, transformation: e.target.value } })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                      >
                        <option value="title_case">Title Case</option>
                        <option value="uppercase">UPPERCASE</option>
                        <option value="lowercase">lowercase</option>
                        <option value="sentence_case">Sentence case</option>
                      </select>
                    </div>
                  )}

                  {step.action === 'validate_phone' && (
                    <>
                      <div>
                        <label className="text-xs text-slate-400 font-medium mb-1.5 block">Country Preset</label>
                        <select
                          value={step.params?.country || 'auto'}
                          onChange={(e) => updateStep(step.id, { params: { ...step.params, country: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                        >
                          {PHONE_COUNTRY_PRESETS.map((preset) => (
                            <option key={preset.key} value={preset.key}>
                              {preset.label}{preset.dialCode ? ` (${preset.dialCode})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 mt-6 sm:mt-0">
                        <input
                          id={`country-code-${step.id}`}
                          type="checkbox"
                          checked={Boolean(step.params?.addCountryCode)}
                          onChange={(e) => updateStep(step.id, { params: { ...step.params, addCountryCode: e.target.checked } })}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-brand-500"
                        />
                        <label htmlFor={`country-code-${step.id}`} className="text-sm text-slate-300">
                          Add country code to local numbers
                        </label>
                      </div>
                    </>
                  )}

                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Description</label>
                    <input
                      type="text"
                      value={step.description}
                      onChange={(e) => updateStep(step.id, { description: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
