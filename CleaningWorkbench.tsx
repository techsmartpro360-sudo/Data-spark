import { useState, useMemo, useCallback } from 'react';
import { DataRow, CleaningStep, CleaningResult, Template } from '../types';
import { analyzeColumns, applyCleaningSteps, autoDetectCleaningSteps } from '../cleaningEngine';
import DataPreview from './DataPreview';
import StepEditor from './StepEditor';
import ResultsDashboard from './ResultsDashboard';
import PhoneToolsPanel from './PhoneToolsPanel';
import {
  ArrowLeft, Sparkles, Play, Save, ChevronRight,
  Wand2, FileSpreadsheet, LayoutTemplate, Settings2
} from 'lucide-react';

interface Props {
  data: DataRow[];
  fileName: string;
  selectedTemplate: Template | null;
  onBack: () => void;
  onGoToTemplates: () => void;
}

type Tab = 'preview' | 'steps' | 'results';

export default function CleaningWorkbench({
  data,
  fileName,
  selectedTemplate,
  onBack,
  onGoToTemplates,
}: Props) {
  const columns = useMemo(() => analyzeColumns(data), [data]);

  const [steps, setSteps] = useState<CleaningStep[]>(() => {
    if (selectedTemplate) {
      return selectedTemplate.steps.map((s, i) => ({
        ...s,
        id: `step-${i + 1}`,
      }));
    }
    return autoDetectCleaningSteps(columns);
  });

  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [result, setResult] = useState<CleaningResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRunCleaning = useCallback(() => {
    setIsProcessing(true);
    setTimeout(() => {
      const r = applyCleaningSteps(data, steps, columns);
      setResult(r);
      setActiveTab('results');
      setIsProcessing(false);
    }, 800);
  }, [data, steps, columns]);

  const handleAutoDetect = useCallback(() => {
    setSteps(autoDetectCleaningSteps(columns));
  }, [columns]);

  const totalIssues = useMemo(() => {
    let issues = 0;
    columns.forEach((col) => {
      issues += col.nullCount;
      if (col.uniqueCount < col.totalCount - col.nullCount) {
        issues += col.totalCount - col.nullCount - col.uniqueCount;
      }
    });
    return issues;
  }, [columns]);

  const tabs: { id: Tab; label: string; icon: typeof FileSpreadsheet }[] = [
    { id: 'preview', label: 'Data Preview', icon: FileSpreadsheet },
    { id: 'steps', label: 'Cleaning Steps', icon: Settings2 },
    { id: 'results', label: 'Results', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="h-5 w-px bg-slate-700" />
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-brand-400" />
                <span className="text-white font-medium text-sm truncate max-w-[200px]">{fileName}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-slate-800 rounded-lg text-slate-400">
                  {data.length} rows
                </span>
                <span className="px-2 py-1 bg-slate-800 rounded-lg text-slate-400">
                  {columns.length} columns
                </span>
                {totalIssues > 0 && (
                  <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
                    {totalIssues} potential issues
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onGoToTemplates}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
              >
                <LayoutTemplate className="w-4 h-4" />
                Templates
              </button>
              <button
                onClick={handleRunCleaning}
                disabled={isProcessing || steps.filter((s) => s.enabled).length === 0}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:from-slate-700 disabled:to-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-all duration-300 shadow-lg shadow-brand-500/20"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Cleaning
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1 mt-4 bg-slate-800/40 p-1 rounded-xl inline-flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }
                ${tab.id === 'results' && !result ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              disabled={tab.id === 'results' && !result}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'results' && result && (
                <span className="ml-1 w-2 h-2 bg-emerald-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {selectedTemplate && (
          <div className="mt-4 inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-2">
            <LayoutTemplate className="w-4 h-4 text-violet-400" />
            <span className="text-violet-300 text-sm font-medium">
              Template: {selectedTemplate.name}
            </span>
          </div>
        )}

        <div className="mt-6 pb-12">
          {activeTab === 'preview' && (
            <div className="animate-fadeIn">
              <DataPreview data={data} columns={columns} />
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="animate-fadeIn">
              <PhoneToolsPanel columns={columns} steps={steps} onStepsChange={setSteps} />

              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-brand-400" />
                    Cleaning Steps
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {steps.filter((s) => s.enabled).length} steps enabled — toggle, reorder, or add new steps.
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleAutoDetect}
                    className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-amber-300 text-sm transition-colors"
                  >
                    <Wand2 className="w-4 h-4" />
                    Auto-Detect
                  </button>
                  <button
                    onClick={() => {
                      const newStep: CleaningStep = {
                        id: `step-${Date.now()}`,
                        action: 'remove_whitespace',
                        column: columns[0]?.name,
                        description: 'New cleaning step',
                        enabled: true,
                      };
                      setSteps([...steps, newStep]);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 rounded-lg text-brand-300 text-sm transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Add Step
                  </button>
                </div>
              </div>

              <StepEditor
                steps={steps}
                columns={columns}
                onStepsChange={setSteps}
              />
            </div>
          )}

          {activeTab === 'results' && result && (
            <div className="animate-fadeIn">
              <ResultsDashboard
                result={result}
                originalData={data}
                fileName={fileName}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
