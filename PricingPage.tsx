import { AppView } from '../types';
import {
  ArrowLeft, Check, X, Crown, Sparkles, Zap, Building2, Star
} from 'lucide-react';

interface Props {
  onBack: () => void;
  setView: (view: AppView) => void;
}

export default function PricingPage({ onBack, setView }: Props) {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/forever',
      desc: 'Perfect for quick cleanup jobs and smaller files.',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-slate-600 to-slate-500',
      borderColor: 'border-slate-700/50',
      bg: 'bg-slate-800/30',
      buttonClass: 'bg-slate-700 hover:bg-slate-600 text-white',
      buttonText: 'Start Free',
      popular: false,
      features: [
        { text: '5 free templates', included: true },
        { text: '10 files per month', included: true },
        { text: 'Basic cleaning operations', included: true },
        { text: 'CSV export', included: true },
        { text: 'Max 1,000 rows per file', included: true },
        { text: 'Custom templates', included: false },
        { text: 'AI column mapping', included: false },
        { text: 'Template sharing', included: false },
        { text: 'Priority support', included: false },
        { text: 'API access', included: false },
      ],
    },
    {
      name: 'Pro',
      price: '$49',
      period: '/month',
      desc: 'Built for analysts, marketers, and data-heavy workflows.',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-brand-600 to-violet-600',
      borderColor: 'border-brand-500/30',
      bg: 'bg-brand-500/5',
      buttonClass: 'bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white shadow-lg shadow-brand-500/25',
      buttonText: 'Start Pro Trial',
      popular: true,
      features: [
        { text: 'All 50+ templates', included: true },
        { text: 'Unlimited files', included: true },
        { text: 'Advanced cleaning operations', included: true },
        { text: 'CSV + Excel export', included: true },
        { text: 'Unlimited rows per file', included: true },
        { text: 'Create custom templates', included: true },
        { text: 'AI-powered column mapping', included: true },
        { text: 'Template versioning', included: true },
        { text: 'Priority support', included: true },
        { text: 'API access', included: false },
      ],
    },
    {
      name: 'Team',
      price: '$99',
      period: '/month',
      desc: 'Designed for shared workflows, collaboration, and governance.',
      icon: <Building2 className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-600',
      borderColor: 'border-amber-500/20',
      bg: 'bg-amber-500/5',
      buttonClass: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white',
      buttonText: 'Contact Sales',
      popular: false,
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Team template library', included: true },
        { text: 'Up to 10 team members', included: true },
        { text: 'Template permissions', included: true },
        { text: 'Audit logs', included: true },
        { text: 'SSO integration', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'Custom onboarding', included: true },
        { text: 'API access', included: true },
        { text: 'SLA guarantee', included: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-4">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-medium">Pricing Plans</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Start for free, upgrade when you need more automation, more templates, and more team features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative ${plan.bg} border ${plan.borderColor} rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1
                ${plan.popular ? 'ring-2 ring-brand-500/40 scale-[1.02]' : ''}
              `}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 bg-gradient-to-r from-brand-600 to-violet-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                    <Star className="w-3 h-3" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white mb-4`}>
                {plan.icon}
              </div>

              <h2 className="text-xl font-bold text-white">{plan.name}</h2>
              <p className="text-slate-400 text-sm mt-1 mb-4">{plan.desc}</p>

              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-500 text-sm mb-1">{plan.period}</span>
              </div>

              <button
                onClick={() => {
                  if (plan.name === 'Free') {
                    setView('upload');
                  }
                }}
                className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 ${plan.buttonClass}`}
              >
                {plan.buttonText}
              </button>

              <div className="mt-6 space-y-3">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {f.included ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                    <span className={`text-sm ${f.included ? 'text-slate-300' : 'text-slate-600'}`}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Is my data safe?',
                a: 'Yes. Processing happens in your browser for the core file cleaning workflow, which keeps your files private by default.',
              },
              {
                q: 'How many files can I clean on the free plan?',
                a: 'The free plan includes 10 files per month, basic cleaning operations, and access to 5 starter templates.',
              },
              {
                q: 'Can I cancel Pro anytime?',
                a: 'Absolutely. There is no lock-in period. You can cancel at any time and keep access through the end of your billing cycle.',
              },
              {
                q: 'How many team members are included in Team?',
                a: 'The standard Team plan includes up to 10 members. Enterprise options can support larger shared workspaces.',
              },
              {
                q: 'Do you support Excel files too?',
                a: 'Yes. CSV, TSV, XLS, and XLSX files are supported, along with dedicated PDF to Excel and Excel to PDF conversion tools.',
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-slate-800/40 border border-slate-700/50 rounded-xl">
                <summary className="px-5 py-4 cursor-pointer text-white font-medium text-sm list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-slate-500 group-open:rotate-45 transition-transform text-lg">+</span>
                </summary>
                <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
