import { useMemo, useState } from 'react';
import { CleaningStep, ColumnInfo } from '../types';
import { PHONE_COUNTRY_PRESETS } from '../phoneUtils';
import { Phone, Globe2, CheckCircle2 } from 'lucide-react';

interface Props {
  columns: ColumnInfo[];
  steps: CleaningStep[];
  onStepsChange: (steps: CleaningStep[]) => void;
}

export default function PhoneToolsPanel({ columns, steps, onStepsChange }: Props) {
  const phoneColumns = useMemo(() => columns.filter((column) => column.type === 'phone'), [columns]);
  const phoneSteps = useMemo(() => steps.filter((step) => step.action === 'validate_phone'), [steps]);
  const [country, setCountry] = useState('auto');
  const [addCountryCode, setAddCountryCode] = useState(false);

  if (phoneColumns.length === 0) return null;

  const applyPresetToPhoneSteps = () => {
    onStepsChange(
      steps.map((step) =>
        step.action === 'validate_phone'
          ? {
              ...step,
              params: {
                ...step.params,
                country,
                addCountryCode,
              },
              description: `Validate & format phone numbers in "${step.column}" with ${PHONE_COUNTRY_PRESETS.find((preset) => preset.key === country)?.label || 'Auto detect'} rules`,
            }
          : step
      )
    );
  };

  const addPhoneStepsIfMissing = () => {
    const existingColumns = new Set(phoneSteps.map((step) => step.column));
    const newSteps = phoneColumns
      .filter((column) => !existingColumns.has(column.name))
      .map((column, index) => ({
        id: `step-phone-${Date.now()}-${index}`,
        action: 'validate_phone' as const,
        column: column.name,
        params: { country, addCountryCode },
        description: `Validate & format phone numbers in "${column.name}" with ${PHONE_COUNTRY_PRESETS.find((preset) => preset.key === country)?.label || 'Auto detect'} rules`,
        enabled: true,
      }));

    if (newSteps.length > 0) {
      onStepsChange([...steps, ...newSteps]);
    }
  };

  return (
    <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Phone className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Country Phone Code Tools</h3>
              <p className="text-sm text-emerald-200/80">
                {phoneColumns.length} phone column{phoneColumns.length > 1 ? 's' : ''} detected. Apply country-wise validation and formatting presets.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {phoneColumns.map((column) => (
              <span key={column.name} className="px-2.5 py-1 bg-slate-900/50 border border-slate-700 rounded-full text-xs text-slate-300">
                {column.name}
              </span>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end w-full lg:w-auto lg:min-w-[420px]">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-medium mb-1.5 block">Country preset</label>
              <div className="relative">
                <Globe2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  {PHONE_COUNTRY_PRESETS.map((preset) => (
                    <option key={preset.key} value={preset.key}>
                      {preset.label}{preset.dialCode ? ` (${preset.dialCode})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={addCountryCode}
                onChange={(e) => setAddCountryCode(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-emerald-500"
              />
              Add country code to local numbers
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={addPhoneStepsIfMissing}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-sm text-white transition-colors"
            >
              Add Phone Steps
            </button>
            <button
              onClick={applyPresetToPhoneSteps}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-medium text-white transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Apply Preset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
