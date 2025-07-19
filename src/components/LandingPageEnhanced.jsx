import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutGrid, Type, MessageSquare, Image, List, Youtube, 
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

const LandingPageEnhanced = () => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Dark theme colors
  const colors = {
    background: '#0a0a0a',
    backgroundLight: '#1a1a1a',
    backgroundLighter: '#2a2a2a',
    border: '#333333',
    borderLight: '#404040',
    textPrimary: '#ffffff',
    textSecondary: '#a0a0a0',
    textTertiary: '#666666',
    blue: '#3b82f6',
    blueLight: '#60a5fa',
    purple: '#9333ea',
    purpleLight: '#a855f7',
    green: '#10b981',
    red: '#ef4444',
    yellow: '#f59e0b',
    pink: '#ec4899'
  };

  // Comprehensive block categories
  const blockCategories = [
    {
      name: 'Productivity & Tasks',
      icon: Target,
      color: colors.blue,
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
      color: colors.pink,
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
      color: colors.green,
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
      color: colors.purple,
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
      color: colors.yellow,
      blocks: [
        { icon: Bot, name: 'AI Assistant', description: 'ChatGPT powered helper' },
        { icon: Sparkles, name: 'AI Writer', description: 'Content generation' },
        { icon: LayoutGrid, name: 'AI Analyzer', description: 'Data insights' },
        { icon: MessageSquare, name: 'AI Chat', description: 'Conversational AI' },
        { icon: Award, name: 'AI Coach', description: 'Personal development' },
        { icon: BarChart3, name: 'AI Reports', description: 'Automated summaries' }
      ]
    },
    {
      name: 'Data & Analytics',
      icon: BarChart3,
      color: colors.red,
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
      <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50" style={{ 
        borderBottom: `1px solid ${colors.border}`,
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(10, 10, 10, 0.8)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <LayoutGrid className="h-7 w-7" style={{ color: colors.blue }} />
              <span className="font-bold text-xl" style={{ color: colors.textPrimary }}>LifeBlocks.ai</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="px-4 py-2 rounded-lg transition-colors"
                style={{ color: colors.textSecondary }}
                onMouseEnter={(e) => e.currentTarget.style.color = colors.textPrimary}
                onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
              >
                Log In
              </Link>
              <Link 
                to="/signup" 
                className="px-6 py-2 rounded-lg transition-all transform hover:scale-105 flex items-center space-x-2"
                style={{ backgroundColor: colors.blue, color: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.blueLight}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.blue}
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
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-8" style={{
            backgroundColor: `${colors.blue}20`,
            border: `1px solid ${colors.blue}40`,
            color: colors.blueLight
          }}>
            <Zap size={16} />
            <span className="text-sm font-medium">Start Free • No credit card required</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: colors.textPrimary }}>
            Your Life, Organized in
            <span className="block" style={{
              background: `linear-gradient(to right, ${colors.blue}, ${colors.purple})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}> Dynamic Blocks</span>
          </h1>
          
          <p className="text-xl mb-12 max-w-3xl mx-auto leading-relaxed" style={{ color: colors.textSecondary }}>
            The infinite canvas for your thoughts, tasks, and dreams. Build your perfect productivity system with AI-powered blocks that adapt to how you think.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/signup" 
              className="px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 flex items-center space-x-2 shadow-xl"
              style={{
                background: `linear-gradient(to right, ${colors.blue}, ${colors.purple})`,
                color: 'white'
              }}
            >
              <span>Get Started Free</span>
              <ArrowRight size={20} />
            </Link>
            <a 
              href="#interactive-demo"
              className="px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center space-x-2"
              style={{ 
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.textPrimary;
                e.currentTarget.style.borderColor = colors.borderLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.textSecondary;
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              <Play size={20} />
              <span>Try Live Demo</span>
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="interactive-demo" className="py-20 px-4" style={{ backgroundColor: `${colors.backgroundLight}80` }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: colors.textPrimary }}>
              Experience the Magic
              <span style={{
                background: `linear-gradient(to right, ${colors.blue}, ${colors.purple})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}> Live</span>
            </h2>
            <p className="text-lg" style={{ color: colors.textSecondary }}>
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
            <p className="mb-4" style={{ color: colors.textSecondary }}>These are just a few of our 30+ block types</p>
            <Link 
              to="/signup" 
              className="inline-flex items-center space-x-2 transition-colors"
              style={{ color: colors.blue }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.blueLight}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.blue}
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
            <h2 className="text-4xl font-bold mb-4" style={{ color: colors.textPrimary }}>
              30+ Blocks to Build Your
              <span style={{
                background: `linear-gradient(to right, ${colors.blue}, ${colors.purple})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}> Perfect System</span>
            </h2>
            <p className="text-xl" style={{ color: colors.textSecondary }}>
              Everything you need to organize every aspect of your life
            </p>
          </div>
          
          <div className="space-y-6">
            {blockCategories.map((category, index) => (
              <div key={index} className="rounded-xl overflow-hidden" style={{
                backgroundColor: `${colors.backgroundLight}80`,
                border: `1px solid ${colors.border}`
              }}>
                <button
                  onClick={() => setExpandedCategory(expandedCategory === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between transition-colors"
                  style={{ backgroundColor: expandedCategory === index ? `${colors.backgroundLight}` : 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.backgroundLight}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = expandedCategory === index ? colors.backgroundLight : 'transparent'}
                >
                  <div className="flex items-center space-x-4">
                    <category.icon className="h-8 w-8" style={{ color: category.color }} />
                    <h3 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>{category.name}</h3>
                    <span className="text-sm" style={{ color: colors.textSecondary }}>({category.blocks.length} blocks)</span>
                  </div>
                  <ChevronDown 
                    className={`h-5 w-5 transition-transform ${expandedCategory === index ? 'transform rotate-180' : ''}`}
                    style={{ color: colors.textSecondary }}
                  />
                </button>
                
                {expandedCategory === index && (
                  <div className="px-6 pt-2 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.blocks.map((block, blockIndex) => (
                        <div 
                          key={blockIndex}
                          className="rounded-lg p-4 transition-colors"
                          style={{ backgroundColor: `${colors.backgroundLighter}80` }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.backgroundLighter}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${colors.backgroundLighter}80`}
                        >
                          <div className="flex items-start space-x-3">
                            <block.icon className="h-6 w-6 flex-shrink-0 mt-0.5" style={{ color: colors.blue }} />
                            <div>
                              <h4 className="font-medium mb-1" style={{ color: colors.textPrimary }}>{block.name}</h4>
                              <p className="text-sm" style={{ color: colors.textSecondary }}>{block.description}</p>
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
      <section className="py-20 px-4" style={{ backgroundColor: `${colors.backgroundLight}50` }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: colors.textPrimary }}>
              Built for How Your Mind
              <span style={{
                background: `linear-gradient(to right, ${colors.blue}, ${colors.purple})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}> Actually Works</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 group-hover:scale-110 transition-transform" style={{
                  background: `linear-gradient(135deg, ${colors.blue}20, ${colors.purple}20)`
                }}>
                  <feature.icon className="h-8 w-8" style={{ color: colors.blue }} />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>{feature.title}</h3>
                <p style={{ color: colors.textSecondary }}>{feature.description}</p>
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
            <h2 className="text-4xl font-bold mb-4" style={{ color: colors.textPrimary }}>
              Perfect for
              <span style={{
                background: `linear-gradient(to right, ${colors.blue}, ${colors.purple})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}> Everyone</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-xl p-8" style={{
              backgroundColor: `${colors.backgroundLight}80`,
              border: `1px solid ${colors.border}`
            }}>
              <Target className="h-12 w-12 mb-4" style={{ color: colors.blue }} />
              <h3 className="text-xl font-semibold mb-3" style={{ color: colors.textPrimary }}>Professionals</h3>
              <p className="mb-4" style={{ color: colors.textSecondary }}>
                Track projects, manage tasks, and hit your goals with AI-powered productivity blocks.
              </p>
              <ul className="space-y-2 text-sm" style={{ color: colors.textSecondary }}>
                <li>• Project management boards</li>
                <li>• Goal tracking & OKRs</li>
                <li>• Time blocking calendar</li>
                <li>• Meeting notes with AI</li>
              </ul>
            </div>
            
            <div className="rounded-xl p-8" style={{
              backgroundColor: `${colors.backgroundLight}80`,
              border: `1px solid ${colors.border}`
            }}>
              <Book className="h-12 w-12 mb-4" style={{ color: colors.purple }} />
              <h3 className="text-xl font-semibold mb-3" style={{ color: colors.textPrimary }}>Students</h3>
              <p className="mb-4" style={{ color: colors.textSecondary }}>
                Organize notes, track assignments, and ace your studies with smart learning blocks.
              </p>
              <ul className="space-y-2 text-sm" style={{ color: colors.textSecondary }}>
                <li>• Study planner</li>
                <li>• Assignment tracker</li>
                <li>• Note-taking with AI</li>
                <li>• Grade calculator</li>
              </ul>
            </div>
            
            <div className="rounded-xl p-8" style={{
              backgroundColor: `${colors.backgroundLight}80`,
              border: `1px solid ${colors.border}`
            }}>
              <Heart className="h-12 w-12 mb-4" style={{ color: colors.pink }} />
              <h3 className="text-xl font-semibold mb-3" style={{ color: colors.textPrimary }}>Life Enthusiasts</h3>
              <p className="mb-4" style={{ color: colors.textSecondary }}>
                Build healthy habits, track wellness, and design your ideal life with mindful blocks.
              </p>
              <ul className="space-y-2 text-sm" style={{ color: colors.textSecondary }}>
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
      <section className="py-20 px-4" style={{
        background: `linear-gradient(to right, ${colors.blue}10, ${colors.purple}10)`,
        borderTop: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`
      }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4" style={{ color: colors.textPrimary }}>
            Start Building Your
            <span style={{
              background: `linear-gradient(to right, ${colors.blue}, ${colors.purple})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}> Life Operating System</span>
          </h2>
          <p className="text-xl mb-8" style={{ color: colors.textSecondary }}>
            Join thousands organizing their lives with dynamic blocks. Free during beta.
          </p>
          <Link 
            to="/signup" 
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-xl"
            style={{
              background: `linear-gradient(to right, ${colors.blue}, ${colors.purple})`,
              color: 'white'
            }}
          >
            <span>Get Started Free</span>
            <ArrowRight size={20} />
          </Link>
          <p className="text-sm mt-4" style={{ color: colors.textTertiary }}>
            No credit card required • Unlimited boards • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4" style={{ borderTop: `1px solid ${colors.border}` }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <LayoutGrid className="h-6 w-6" style={{ color: colors.blue }} />
                <span className="font-semibold" style={{ color: colors.textPrimary }}>LifeBlocks.ai</span>
              </div>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                The infinite canvas for organizing your life with dynamic blocks.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>Product</h4>
              <ul className="space-y-2 text-sm" style={{ color: colors.textSecondary }}>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blocks Library</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>Resources</h4>
              <ul className="space-y-2 text-sm" style={{ color: colors.textSecondary }}>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>Company</h4>
              <ul className="space-y-2 text-sm" style={{ color: colors.textSecondary }}>
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 text-center text-sm" style={{ 
            borderTop: `1px solid ${colors.border}`,
            color: colors.textSecondary 
          }}>
            <p>&copy; 2024 LifeBlocks.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </ScrollableLayout>
  );
};

export default LandingPageEnhanced;