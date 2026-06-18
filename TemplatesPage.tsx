import { useState, useMemo } from 'react';
import { Template, AppView } from '../types';
import { builtInTemplates, templateCategories } from '../templates';
import {
  Search, Star, ArrowLeft, LayoutTemplate, Lock, ChevronRight,
  Users, Clock, Sparkles, Crown, Eye, Play
} from 'lucide-react';

interface Props {
  onSelectTemplate: (template: Template) => void;
  onBack: () => void;
  setView: (view: AppView) => void;
  hasData: boolean;
}

export default function TemplatesPage({ onSelectTemplate, onBack, setView, hasData }: Props) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const filtered = useMemo(() => {
    return builtInTemplates.filter(t => {
      const matchesSearch = !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const handleUseTemplate = (template: Template) => {
    if (template.isPremium) {
      setView('pricing');
      return;
    }
    onSelectTemplate(template);
    if (!hasData) {
      setView('upload');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <LayoutTemplate className="w-8 h-8 text-brand-400" />
              Smart Templates
            </h1>
            <p className="text-slate-400 mt-2">Pre-built cleaning workflows — select, apply, done! ✨</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {templateCategories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
                ${selectedCategory === cat.name
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-200'
                }
              `}
            >
              <span>{cat.icon}</span>
              {cat.name}
              <span className="text-xs opacity-60">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(template => (
            <div
              key={template.id}
              className={`group bg-slate-800/40 hover:bg-slate-800/60 border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer
                ${template.isPremium ? 'border-amber-500/20 hover:border-amber-500/30' : 'border-slate-700/50 hover:border-slate-600/50'}
              `}
              onClick={() => setPreviewTemplate(template)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <h3 className="text-white font-semibold text-sm group-hover:text-brand-300 transition-colors line-clamp-1">
                      {template.name}
                    </h3>
                    <span className="text-xs text-slate-500">{template.category}</span>
                  </div>
                </div>
                {template.isPremium && (
                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-400 font-medium">PRO</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">
                {template.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {template.tags.slice(0, 4).map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-700/50 rounded-md text-xs text-slate-400">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {template.usageCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400" />
                    {template.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {template.steps.length} steps
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUseTemplate(template);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${template.isPremium
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20'
                      : 'bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/20'
                    }
                  `}
                >
                  {template.isPremium ? (
                    <>
                      <Lock className="w-3 h-3" />
                      Unlock
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      Use
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No templates found</p>
            <p className="text-slate-500 text-sm mt-2">Try a different search or category</p>
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <span className="text-4xl">{previewTemplate.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-white">{previewTemplate.name}</h2>
                    {previewTemplate.isPremium && (
                      <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                        <Crown className="w-3 h-3 text-amber-400" />
                        <span className="text-xs text-amber-400 font-medium">PRO</span>
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm">{previewTemplate.description}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <Users className="w-4 h-4 text-brand-400 mx-auto mb-1" />
                  <div className="text-white font-semibold">{previewTemplate.usageCount.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">Uses</div>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="text-white font-semibold">{previewTemplate.rating}/5</div>
                  <div className="text-xs text-slate-500">Rating</div>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <Sparkles className="w-4 h-4 text-violet-400 mx-auto mb-1" />
                  <div className="text-white font-semibold">{previewTemplate.steps.length}</div>
                  <div className="text-xs text-slate-500">Steps</div>
                </div>
              </div>

              {/* Steps */}
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-400" />
                Cleaning Steps Preview
              </h3>
              <div className="space-y-2 mb-6">
                {previewTemplate.steps.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-3 bg-slate-700/20 rounded-lg p-3">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-xs text-brand-300 font-bold shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-sm text-slate-300">{step.description}</span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {previewTemplate.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-slate-700/50 rounded-lg text-xs text-slate-400">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium text-sm transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleUseTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all
                    ${previewTemplate.isPremium
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white'
                      : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white'
                    }
                  `}
                >
                  {previewTemplate.isPremium ? (
                    <>
                      <Crown className="w-4 h-4" />
                      Unlock with Pro
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      Use This Template
                    </>
                  )}
                </button>
              </div>

              {/* Created by */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Created by: {previewTemplate.createdBy}</span>
                <span>{previewTemplate.createdAt}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
