import { AppView } from '../types';
import {
  Sparkles, Upload, LayoutTemplate, Crown, Home, Menu, X, Wrench
} from 'lucide-react';
import { useState } from 'react';

interface Props {
  view: AppView;
  setView: (view: AppView) => void;
}

export default function Navbar({ view, setView }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { id: AppView; label: string; icon: typeof Home }[] = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'pricing', label: 'Pricing', icon: Crown },
  ];

  return (
    <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <button
            onClick={() => setView('landing')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent group-hover:from-brand-300 group-hover:to-violet-300 transition-all">
              DataSpark
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${view === item.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('upload')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-brand-500/20"
            >
              <Upload className="w-4 h-4" />
              Clean Data
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 animate-fadeIn">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setMobileOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all
                  ${view === item.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                setView('upload');
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium mt-2"
            >
              <Upload className="w-5 h-5" />
              Start Cleaning
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
