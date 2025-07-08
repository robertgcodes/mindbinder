import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, Type, MessageSquare, Image, List, Youtube, 
  Bot, Square, Calendar, CheckSquare, FileText, Link2,
  ArrowRight, Sparkles, Zap, Layers, Users, Shield,
  Globe, Infinity, Target, Palette, MousePointer, Cloud
} from 'lucide-react';
import ScrollableLayout from './ScrollableLayout';

const LandingPage = () => {
  const blocks = [
    { icon: Type, name: 'Text Block', description: 'Simple notes and ideas' },
    { icon: MessageSquare, name: 'Rich Text', description: 'Formatted content with style' },
    { icon: Bot, name: 'AI Prompt', description: 'AI-powered responses' },
    { icon: Image, name: 'Image Gallery', description: 'Visual collections' },
    { icon: Link2, name: 'Link Cards', description: 'Beautiful bookmarks' },
    { icon: List, name: 'Todo Lists', description: 'Track your tasks' },
    { icon: Calendar, name: 'Yearly Planner', description: 'Long-term goals' },
    { icon: CheckSquare, name: 'Habit Tracker', description: 'Build better habits' },
    { icon: Youtube, name: 'YouTube Embed', description: 'Video integration' },
    { icon: FileText, name: 'Quick Notes', description: 'Capture thoughts fast' },
    { icon: MessageSquare, name: 'Rotating Quotes', description: 'Daily inspiration' },
    { icon: Square, name: 'Frames', description: 'Organize with containers' }
  ];

  const features = [
    {
      icon: Infinity,
      title: 'Infinite Canvas',
      description: 'Unlimited space to organize your thoughts, plans, and ideas without constraints.'
    },
    {
      icon: MousePointer,
      title: 'Drag & Drop',
      description: 'Intuitive interface lets you arrange blocks exactly how your mind works.'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered',
      description: 'Smart blocks that leverage AI to help you think, plan, and create better.'
    },
    {
      icon: Cloud,
      title: 'Cloud Sync',
      description: 'Access your life blocks from anywhere, always in sync across devices.'
    },
    {
      icon: Palette,
      title: 'Customizable',
      description: 'Make it yours with custom colors, fonts, and layouts for every block.'
    },
    {
      icon: Shield,
      title: 'Private & Secure',
      description: 'Your data is encrypted and private. You own your information.'
    }
  ];

  return (
    <ScrollableLayout>
      <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
      {/* Navigation */}
      <nav className="border-b border-dark-700 backdrop-blur-lg bg-dark-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Brain className="h-7 w-7 text-blue-400" />
              <span className="text-white font-bold text-xl">LifeBlocks.ai</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                Log In
              </Link>
              <Link 
                to="/signup" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Start Free</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-600/10 text-blue-400 px-4 py-2 rounded-full mb-8 border border-blue-600/20">
            <Zap size={16} />
            <span className="text-sm font-medium">Currently in Beta - Free Access</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Organize Your Life with
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text"> Dynamic Blocks</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            The infinite canvas for your thoughts, tasks, and dreams. Build your perfect productivity system with AI-powered blocks that adapt to how you think.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/signup" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 flex items-center space-x-2 shadow-xl"
            >
              <span>Get Started Free</span>
              <ArrowRight size={20} />
            </Link>
            <button className="text-gray-300 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center space-x-2 border border-dark-600 hover:border-dark-500">
              <Globe size={20} />
              <span>See Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Visual Demo Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-dark-700 bg-dark-800/50 backdrop-blur">
            <div className="absolute top-0 left-0 right-0 h-12 bg-dark-700 flex items-center px-4 space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="pt-12 p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Today's Tasks</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <CheckSquare size={16} />
                      <span className="text-sm">Review project proposal</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Square size={16} />
                      <span className="text-sm">Team meeting at 2pm</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-600/10 border border-purple-600/20 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">AI Assistant</h3>
                  <p className="text-sm text-gray-400">
                    "What are the top 3 priorities for this quarter?"
                  </p>
                  <div className="mt-2 text-sm text-purple-400">
                    <Sparkles size={14} className="inline mr-1" />
                    Generating response...
                  </div>
                </div>
                
                <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Yearly Goals</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">Q1: Launch MVP</div>
                    <div className="text-gray-400">Q2: Scale team</div>
                    <div className="text-gray-400">Q3: Expand features</div>
                    <div className="text-gray-400">Q4: Go global</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blocks Showcase */}
      <section className="py-20 px-4 bg-dark-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Building Blocks for Your 
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text"> Best Life</span>
            </h2>
            <p className="text-xl text-gray-400">
              Mix and match powerful blocks to create your perfect system
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {blocks.map((block, index) => (
              <div 
                key={index}
                className="bg-dark-700/50 backdrop-blur border border-dark-600 rounded-xl p-6 hover:border-blue-600/50 transition-all hover:transform hover:scale-105 hover:shadow-xl"
              >
                <block.icon className="h-8 w-8 text-blue-400 mb-3" />
                <h3 className="text-white font-semibold mb-1">{block.name}</h3>
                <p className="text-sm text-gray-400">{block.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why LifeBlocks is 
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text"> Different</span>
            </h2>
            <p className="text-xl text-gray-400">
              Built for how your mind actually works
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-dark-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Get Started in 
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text"> 3 Simple Steps</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text mb-4">1</div>
              <h3 className="text-xl font-semibold text-white mb-2">Sign Up Free</h3>
              <p className="text-gray-400">Create your account in seconds. No credit card required during beta.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text mb-4">2</div>
              <h3 className="text-xl font-semibold text-white mb-2">Add Your Blocks</h3>
              <p className="text-gray-400">Choose from our library of blocks and drop them onto your infinite canvas.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text mb-4">3</div>
              <h3 className="text-xl font-semibold text-white mb-2">Organize Your Way</h3>
              <p className="text-gray-400">Arrange, connect, and customize blocks to match your workflow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-4 text-gray-400 mb-16">
            <Users className="h-5 w-5" />
            <span>Join thousands organizing their lives with LifeBlocks</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-dark-800/50 backdrop-blur border border-dark-700 rounded-xl p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "Finally, a tool that works how my brain works. The AI blocks are game-changing!"
              </p>
              <p className="text-sm text-gray-500">Sarah K., Product Manager</p>
            </div>
            
            <div className="bg-dark-800/50 backdrop-blur border border-dark-700 rounded-xl p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "The infinite canvas is perfect for visual thinkers. I've replaced 5 different apps with this."
              </p>
              <p className="text-sm text-gray-500">Michael R., Designer</p>
            </div>
            
            <div className="bg-dark-800/50 backdrop-blur border border-dark-700 rounded-xl p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "Love how I can mix todos, notes, and yearly planning all in one space. So intuitive!"
              </p>
              <p className="text-sm text-gray-500">Emma L., Entrepreneur</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-y border-dark-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform How You 
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text"> Organize Your Life?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join the beta and get free access to all features. No credit card required.
          </p>
          <Link 
            to="/signup" 
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-xl"
          >
            <span>Start Building Your Life System</span>
            <ArrowRight size={20} />
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Free during beta • No credit card • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-dark-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-blue-400" />
                <span className="text-white font-semibold">LifeBlocks.ai</span>
              </div>
              <p className="text-sm text-gray-400">
                The infinite canvas for organizing your life with dynamic blocks.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blocks Library</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-dark-700 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 LifeBlocks.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </ScrollableLayout>
  );
};

export default LandingPage;