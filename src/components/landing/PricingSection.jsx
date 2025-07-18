import React, { useState } from 'react';
import { Check, X, Zap, Users, Clock, Sparkles, Upload, Shield } from 'lucide-react';

const PricingSection = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: [
        { text: '3 boards', included: true },
        { text: '50 blocks per board', included: true },
        { text: 'Basic block types', included: true },
        { text: '100MB storage', included: true },
        { text: 'Community support', included: true },
        { text: 'AI blocks', included: false },
        { text: 'Advanced integrations', included: false },
        { text: 'Priority support', included: false }
      ],
      cta: 'Start Free',
      popular: false,
      available: true
    },
    {
      name: 'Pro',
      price: { monthly: 10, yearly: 100 },
      description: 'For power users and professionals',
      features: [
        { text: 'Unlimited boards', included: true },
        { text: 'Unlimited blocks', included: true },
        { text: 'All block types', included: true },
        { text: '10GB storage', included: true },
        { text: 'AI-powered blocks', included: true },
        { text: 'Advanced integrations', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Custom themes', included: true }
      ],
      cta: 'Coming Soon',
      popular: true,
      available: false,
      badge: 'Most Popular'
    },
    {
      name: 'Team',
      price: { monthly: 20, yearly: 200 },
      description: 'Collaborate with your team',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: '3 team members', included: true },
        { text: '50GB shared storage', included: true },
        { text: 'Team collaboration', included: true },
        { text: 'Admin controls', included: true },
        { text: 'Team analytics', included: true },
        { text: 'Priority phone support', included: true },
        { text: 'Custom onboarding', included: true }
      ],
      cta: 'Coming Soon',
      popular: false,
      available: false
    }
  ];

  return (
    <section className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, rgba(26, 26, 26, 0.5), #0a0a0a)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent 
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text"> Pricing</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Start free, upgrade when you need more power
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center space-x-4 bg-gray-900/50 p-1 rounded-lg border border-gray-800">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md transition-all ${
                billingPeriod === 'monthly' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-md transition-all ${
                billingPeriod === 'yearly' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
            </button>
            {billingPeriod === 'yearly' && (
              <span className="text-green-400 text-sm flex items-center space-x-1">
                <Sparkles size={14} />
                <span>Save 17%</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative rounded-2xl p-8 ${
                plan.popular 
                  ? 'bg-gradient-to-b from-blue-600/20 to-purple-600/20 border-2 border-blue-600/50' 
                  : 'bg-gray-900/50 border border-gray-800'
              } backdrop-blur hover:transform hover:scale-105 transition-all`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {plan.badge}
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-bold text-white">
                    ${plan.price[billingPeriod]}
                  </span>
                  <span className="text-gray-400">
                    /{billingPeriod === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>
                {plan.name === 'Team' && (
                  <p className="text-sm text-gray-400 mt-2">per user</p>
                )}
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-600 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${
                      feature.included ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.available
                    ? plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gray-800 text-white hover:bg-dark-600'
                    : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!plan.available}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="bg-gray-900/30 rounded-2xl p-8 border border-gray-800 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Upload className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Flexible Storage</h4>
              <p className="text-sm text-gray-400">
                Upgrade anytime as your needs grow. Team storage is shared across all members.
              </p>
            </div>
            <div>
              <Shield className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">No Lock-in</h4>
              <p className="text-sm text-gray-400">
                Cancel anytime. Export all your data. We believe in earning your trust.
              </p>
            </div>
            <div>
              <Clock className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Grandfather Pricing</h4>
              <p className="text-sm text-gray-400">
                Lock in your rate forever. Early adopters keep their pricing as we grow.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            <div className="bg-gray-900/30 rounded-lg p-6 border border-gray-800">
              <h4 className="text-white font-semibold mb-2">When will paid plans be available?</h4>
              <p className="text-sm text-gray-400">
                We're targeting Q2 2024 for Pro and Team plans. Early beta users will get special pricing.
              </p>
            </div>
            <div className="bg-gray-900/30 rounded-lg p-6 border border-gray-800">
              <h4 className="text-white font-semibold mb-2">What are AI blocks?</h4>
              <p className="text-sm text-gray-400">
                AI blocks use GPT-4 to help with writing, planning, and analysis directly in your workspace.
              </p>
            </div>
            <div className="bg-gray-900/30 rounded-lg p-6 border border-gray-800">
              <h4 className="text-white font-semibold mb-2">Can I add more team members?</h4>
              <p className="text-sm text-gray-400">
                Yes! Additional team members are $7/month or $70/year each. Volume discounts available.
              </p>
            </div>
            <div className="bg-gray-900/30 rounded-lg p-6 border border-gray-800">
              <h4 className="text-white font-semibold mb-2">Is there an education discount?</h4>
              <p className="text-sm text-gray-400">
                Yes! Students and educators get 50% off Pro plans. Team plans for schools available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;