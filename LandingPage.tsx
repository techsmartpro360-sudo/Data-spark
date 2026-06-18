import { AppView } from '../types';
import {
  Upload, Zap, Shield, Clock, Star, ArrowRight,
  CheckCircle, Sparkles, Database, FileSpreadsheet, Users, TrendingUp, Wrench, Phone
} from 'lucide-react';

interface Props {
  setView: (view: AppView) => void;
}

export default function LandingPage({ setView }: Props) {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/80 via-slate-900 to-violet-900/50" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span className="text-brand-300 text-sm font-medium">AI-Powered Data Cleaning and File Conversion</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-brand-200 to-violet-300 bg-clip-text text-transparent">
                Turn Messy Files Into
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-brand-400 bg-clip-text text-transparent">
                Clean, Usable Data ✨
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Upload CSV or Excel files, remove duplicates, fix email formats, standardize phone numbers with country codes,
              fill missing values, and convert <span className="text-white font-semibold">PDF to Excel or Excel to PDF</span> — all in your browser.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setView('upload')}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-105"
              >
                <Upload className="w-5 h-5" />
                Start Cleaning for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setView('tools')}
                className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:border-white/20"
              >
                <Wrench className="w-5 h-5" />
                Open Conversion Tools
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-slate-500">
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-500" /> No signup required</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-500" /> 100% browser-based</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-500" /> Private by default</span>
            </div>
          </div>

          <div className="mt-16 max-w-4xl mx-auto animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-3 text-sm text-slate-500">customer_export.csv</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-rose-400 mb-2 flex items-center gap-1">
                    ❌ Before (Dirty Data)
                  </div>
                  <div className="bg-slate-900/80 rounded-xl p-3 text-xs font-mono space-y-1">
                    <div className="text-slate-500">JOHN SMITH, john@<span className="text-rose-400">gmial</span>.com</div>
                    <div className="text-slate-500">jane doe, <span className="text-amber-400">missing phone</span></div>
                    <div className="text-slate-500"><span className="text-rose-400">JOHN SMITH</span>, john@gmial.com <span className="text-rose-300">← duplicate</span></div>
                    <div className="text-slate-500">  <span className="text-amber-400">extra spaces</span>  , bob@hotmal.com</div>
                    <div className="text-slate-500"><span className="text-rose-400">(empty row)</span></div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                    ✅ After (Clean Data)
                  </div>
                  <div className="bg-slate-900/80 rounded-xl p-3 text-xs font-mono space-y-1">
                    <div className="text-emerald-300">John Smith, john@gmail.com</div>
                    <div className="text-emerald-300">Jane Doe, +91 98765 43210</div>
                    <div className="text-slate-600 line-through">duplicate removed ✓</div>
                    <div className="text-emerald-300">Bob Johnson, bob@hotmail.com</div>
                    <div className="text-slate-600 line-through">empty row removed ✓</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-10 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Database, value: '50K+', label: 'Files Cleaned', color: 'text-brand-400' },
              { icon: Users, value: '12K+', label: 'Active Users', color: 'text-emerald-400' },
              { icon: Clock, value: '80%', label: 'Time Saved', color: 'text-violet-400' },
              { icon: TrendingUp, value: '99.2%', label: 'Accuracy Rate', color: 'text-amber-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 text-center hover:bg-slate-800/80 transition-colors">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything You Need for File Cleanup</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Clean datasets, standardize phone numbers, and convert document formats without leaving your browser.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap className="w-7 h-7" />,
              title: 'Auto-Detect Issues',
              desc: 'Automatically identify duplicates, blanks, inconsistent casing, suspicious numbers, and malformed values.',
              color: 'from-amber-500 to-orange-600',
              bg: 'bg-amber-500/10',
            },
            {
              icon: <Shield className="w-7 h-7" />,
              title: 'Email and Data Validation',
              desc: 'Fix common email typos, standardize fields, and flag invalid values before they break your workflows.',
              color: 'from-emerald-500 to-teal-600',
              bg: 'bg-emerald-500/10',
            },
            {
              icon: <Phone className="w-7 h-7" />,
              title: 'Country-Wise Phone Codes',
              desc: 'Apply phone formatting presets for the US, India, UK, UAE, Pakistan, Australia, or auto-detect from the data.',
              color: 'from-brand-500 to-blue-600',
              bg: 'bg-brand-500/10',
            },
            {
              icon: <FileSpreadsheet className="w-7 h-7" />,
              title: 'Smart Templates',
              desc: 'Use ready-made workflows for CRM, marketing, finance, e-commerce, HR, and lead-cleaning datasets.',
              color: 'from-violet-500 to-purple-600',
              bg: 'bg-violet-500/10',
            },
            {
              icon: <Wrench className="w-7 h-7" />,
              title: 'PDF ↔ Excel Tools',
              desc: 'Extract tabular text from PDFs into Excel or export spreadsheets as clean PDF tables in one click.',
              color: 'from-rose-500 to-pink-600',
              bg: 'bg-rose-500/10',
            },
            {
              icon: <Star className="w-7 h-7" />,
              title: 'Private by Default',
              desc: 'All processing runs in your browser so your files stay local while you clean and convert them.',
              color: 'from-cyan-500 to-sky-600',
              bg: 'bg-cyan-500/10',
            },
          ].map((feature, i) => (
            <div key={i} className="group bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/50 hover:border-slate-600/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1">
              <div className={`${feature.bg} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
                <div className={`bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`}>
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-800/30 border-y border-slate-700/30 py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">Clean data or convert files in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload a File',
                desc: 'Drag and drop a CSV, Excel, or PDF file. You can also try the built-in sample dataset.',
                icon: '📤',
              },
              {
                step: '02',
                title: 'Review and Configure',
                desc: 'Use auto-detected cleaning steps, select a smart template, or apply a country phone-code preset.',
                icon: '🔍',
              },
              {
                step: '03',
                title: 'Download the Result',
                desc: 'Export a cleaned CSV, a detailed issue report, an Excel workbook, or a polished PDF file.',
                icon: '✅',
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="text-6xl mb-4">{item.icon}</div>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 font-bold text-sm mb-3">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 right-0 translate-x-1/2">
                    <ArrowRight className="w-6 h-6 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setView('upload')}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              Try Data Cleaning
            </button>
            <button
              onClick={() => setView('tools')}
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:border-white/20"
            >
              <Wrench className="w-5 h-5" />
              Try Conversion Tools
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-brand-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">DataSpark</span>
          </div>
          <p className="text-slate-500 text-sm mb-4">Smart CSV/Excel Cleaning, Phone Validation, and PDF Conversion</p>
          <p className="text-slate-600 text-xs">© 2025 DataSpark. All processing happens in your browser. Your files remain private.</p>
        </div>
      </footer>
    </div>
  );
}
