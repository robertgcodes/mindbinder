import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, Type, MessageSquare, Image, List, Youtube, 
  Bot, Square, Calendar, CheckSquare, FileText, Link2,
  ArrowRight, Sparkles, Zap, Layers, Users, Shield,
  Globe, Infinity, Target, Palette, MousePointer, Cloud,
  Heart, Star, TrendingUp, Book, Coffee, Sun, Music,
  MapPin, Clock, Calculator, Code, Bookmark, BarChart3,
  Phone, Mail, DollarSign, Award, Camera, Mic,
  ChevronDown, Play, GitBranch
} from 'lucide-react';
import ScrollableLayout from './ScrollableLayout';
import { 
  GratitudePreview, 
  AffirmationsPreview, 
  ActionItemsPreview,
  HabitTrackerPreview,
  QuickStatsPreview,
  AIAssistantPreview
} from './landing/InteractiveBlocks';
import PricingSection from './landing/PricingSection';

const LandingPageNew = () => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Comprehensive block categories
  const blockCategories = [
    {
      name: 'Productivity & Tasks',
      icon: Target,
      blocks: [
        { icon: CheckSquare, name: 'Action Items', description: 'Track tasks with priorities and status' },
        { icon: List, name: 'Todo Lists', description: 'Simple checkbox lists' },
        { icon: Calendar, name: 'Yearly Planner', description: 'Long-term goal planning' },
        { icon: Clock, name: 'Timeline', description: 'Event and milestone tracking' },
        { icon: Target, name: 'OKRs & Goals', description: 'Objectives and key results' },
        { icon: GitBranch, name: 'Project Board', description: 'Kanban-style project management' }
      ]
    },
    {
      name: 'Wellness & Habits',
      icon: Heart,
      blocks: [
        { icon: Heart, name: 'Gratitude Journal', description: 'Daily gratitude practice' },
        { icon: Sun, name: 'Affirmations', description: 'Positive daily affirmations' },
        { icon: CheckSquare, name: 'Habit Tracker', description: 'Build and track habits' },
        { icon: Coffee, name: 'Mood Tracker', description: 'Monitor emotional wellness' },
        { icon: TrendingUp, name: 'Progress Charts', description: 'Visualize your growth' },
        { icon: Book, name: 'Reflection Journal', description: 'Daily self-reflection' }
      ]
    },
    {
      name: 'Content & Notes',
      icon: FileText,
      blocks: [
        { icon: Type, name: 'Text Block', description: 'Simple text notes' },
        { icon: MessageSquare, name: 'Rich Text', description: 'Formatted content editor' },
        { icon: FileText, name: 'Quick Notes', description: 'Sticky note style' },
        { icon: Bookmark, name: 'Bookmarks', description: 'Save important links' },
        { icon: Code, name: 'Code Snippets', description: 'Syntax highlighted code' },
        { icon: MessageSquare, name: 'Rotating Quotes', description: 'Inspirational quotes' }
      ]
    },
    {
      name: 'Media & Creative',
      icon: Image,
      blocks: [
        { icon: Image, name: 'Image Gallery', description: 'Photo collections' },
        { icon: Youtube, name: 'YouTube Embed', description: 'Embed videos' },
        { icon: Music, name: 'Spotify Playlist', description: 'Music integration' },
        { icon: Play, name: 'Video Player', description: 'Local video playback' },
        { icon: Camera, name: 'Photo Booth', description: 'Quick camera captures' },
        { icon: Mic, name: 'Voice Notes', description: 'Audio recordings' }
      ]
    },
    {
      name: 'AI & Smart Blocks',
      icon: Bot,
      blocks: [
        { icon: Bot, name: 'AI Assistant', description: 'ChatGPT powered helper' },
        { icon: Sparkles, name: 'AI Writer', description: 'Content generation' },
        { icon: Brain, name: 'AI Analyzer', description: 'Data insights' },
        { icon: MessageSquare, name: 'AI Chat', description: 'Conversational AI' },
        { icon: Award, name: 'AI Coach', description: 'Personal development' },
        { icon: BarChart3, name: 'AI Reports', description: 'Automated summaries' }
      ]
    },
    {
      name: 'Data & Analytics',
      icon: BarChart3,
      blocks: [
        { icon: BarChart3, name: 'Analytics', description: 'Track your metrics' },
        { icon: TrendingUp, name: 'Charts', description: 'Data visualization' },
        { icon: Calculator, name: 'Calculator', description: 'Quick calculations' },
        { icon: DollarSign, name: 'Finance Tracker', description: 'Budget management' },
        { icon: Clock, name: 'Time Tracker', description: 'Time management' },
        { icon: MapPin, name: 'Location Map', description: 'Places and travel' }
      ]
    }
  ];

  const features = [
    {
      icon: Infinity,
      title: 'Infinite Canvas',
      description: 'Unlimited space to organize your thoughts, plans, and ideas without constraints.'
    },
    {
      icon: MousePointer,
      title: 'Drag & Drop Everything',
      description: 'Intuitive interface lets you arrange blocks exactly how your mind works.'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Intelligence',
      description: 'Smart blocks that leverage AI to help you think, plan, and create better.'
    },
    {
      icon: Cloud,
      title: 'Always in Sync',
      description: 'Access your life blocks from anywhere, always in sync across all devices.'
    },
    {
      icon: Palette,
      title: 'Fully Customizable',
      description: 'Make it yours with custom colors, fonts, and layouts for every block.'
    },
    {
      icon: Shield,
      title: 'Private & Secure',
      description: 'Your data is encrypted and private. You own your information, always.'
    }
  ];

  return (
    <ScrollableLayout>
      <div className="min-h-screen bg-gradient-to-b from-#0a0a0a via-dark-800 to-#0a0a0a">
      {/* Navigation */}
      <nav className="border-b border-dark-700 backdrop-blur-lg bg-#0a0a0a/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Brain className="h-7 w-7 text-blue-400" />
              <span className="text-white font-bold text-xl">lifeblocks.ai</span>
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

      {/* Hero Section with Interactive Demo */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-600/10 text-blue-400 px-4 py-2 rounded-full mb-8 border border-blue-600/20">
            <Zap size={16} />
            <span className="text-sm font-medium">Free while in Beta • No credit card required</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your Life, Organized in
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
            <a 
              href="#interactive-demo"
              className="text-gray-300 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center space-x-2 border border-dark-600 hover:border-dark-500"
            >
              <Play size={20} />
              <span>Try Live Demo</span>
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="interactive-demo" className="py-20 px-4 bg-dark-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Experience the Magic
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text"> Live</span>
            </h2>
            <p className="text-lg text-gray-400">
              Click and interact with these actual blocks from the app
            </p>
          </div>

          {/* Interactive Blocks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <GratitudePreview />
            <ActionItemsPreview />
            <AffirmationsPreview />
            <HabitTrackerPreview />
            <AIAssistantPreview />
            <QuickStatsPreview />
          </div>

          <div className="text-center">
            <p className="text-gray-400 mb-4">These are just a few of our 30+ block types</p>
            <Link 
              to="/signup" 
              className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>Create your own workspace</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Comprehensive Blocks Showcase */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              30+ Blocks to Build Your
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text"> Perfect System</span>
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to organize every aspect of your life
            </p>
          </div>
          
          <div className="space-y-6">
            {blockCategories.map((category, index) => (
              <div key={index} className="bg-dark-800/50 backdrop-blur rounded-xl border border-dark-700 overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between hover:bg-dark-800/70 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <category.icon className="h-8 w-8 text-blue-400" />
                    <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                    <span className="text-sm text-gray-400">({category.blocks.length} blocks)</span>
                  </div>
                  <ChevronDown 
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      expandedCategory === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                
                {expandedCategory === index && (
                  <div className="px-6 pt-2 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.blocks.map((block, blockIndex) => (
                        <div 
                          key={blockIndex}
                          className="bg-dark-700/50 rounded-lg p-4 hover:bg-dark-700 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <block.icon className="h-6 w-6 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-white font-medium mb-1">{block.name}</h4>
                              <p className="text-sm text-gray-400">{block.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-dark-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for How Your Mind
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text"> Actually Works</span>
            </h2>
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

      {/* Pricing Section */}
      <PricingSection />

      {/* Use Cases */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Perfect for
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text"> Everyone</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-dark-800/50 rounded-xl p-8 border border-dark-700">
              <Target className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Professionals</h3>
              <p className="text-gray-400 mb-4">
                Track projects, manage tasks, and hit your goals with AI-powered productivity blocks.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Project management boards</li>
                <li>• Goal tracking & OKRs</li>
                <li>• Time blocking calendar</li>
                <li>• Meeting notes with AI</li>
              </ul>
            </div>
            
            <div className="bg-dark-800/50 rounded-xl p-8 border border-dark-700">
              <Book className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Students</h3>
              <p className="text-gray-400 mb-4">
                Organize notes, track assignments, and ace your studies with smart learning blocks.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Study planner</li>
                <li>• Assignment tracker</li>
                <li>• Note-taking with AI</li>
                <li>• Grade calculator</li>
              </ul>
            </div>
            
            <div className="bg-dark-800/50 rounded-xl p-8 border border-dark-700">
              <Heart className="h-12 w-12 text-pink-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Life Enthusiasts</h3>
              <p className="text-gray-400 mb-4">
                Build healthy habits, track wellness, and design your ideal life with mindful blocks.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Habit & mood tracking</li>
                <li>• Gratitude journaling</li>
                <li>• Wellness dashboards</li>
                <li>• Life goal planning</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-y border-dark-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start Building Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text"> Life Operating System</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands organizing their lives with dynamic blocks. Free during beta.
          </p>
          <Link 
            to="/signup" 
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-xl"
          >
            <span>Get Started Free</span>
            <ArrowRight size={20} />
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Unlimited boards • Cancel anytime
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
                <span className="text-white font-semibold">lifeblocks.ai</span>
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
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
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
            <p>&copy; 2024 lifeblocks.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </ScrollableLayout>
  );
};

export default LandingPageNew;