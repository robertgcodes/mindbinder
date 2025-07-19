import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CreditCard, Download, FileText, HelpCircle, 
  Package, AlertCircle, CheckCircle, Clock, RefreshCw,
  Mail, Phone, MessageSquare, ExternalLink, Calendar,
  DollarSign, TrendingUp, Shield, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTheme } from '../contexts/ThemeContext';
import { createCustomerPortal } from '../services/stripe';
import { formatBytes, PRICING_TIERS } from '../config/pricing';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import ScrollableLayout from './ScrollableLayout';

const BillingPage = () => {
  const { currentUser } = useAuth();
  const { tier, subscription, storageUsed, loading: subLoading } = useSubscription();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportTicket, setSupportTicket] = useState({
    subject: '',
    category: 'billing',
    message: ''
  });

  useEffect(() => {
    if (subscription?.id) {
      // In a real app, you'd fetch invoices from Stripe
      // For now, we'll simulate some invoice data
      setInvoices([
        {
          id: 'inv_demo_1',
          date: new Date().toISOString(),
          amount: tier.price?.monthly || 0,
          status: 'paid',
          description: `${tier.name} Plan - Monthly`,
          downloadUrl: '#'
        }
      ]);
    }
  }, [subscription, tier]);

  const handleManageSubscription = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await createCustomerPortal();
    } catch (err) {
      console.error('Error opening billing portal:', err);
      setError('Failed to open billing portal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async () => {
    if (!supportTicket.subject || !supportTicket.message) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, 'support_tickets'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        ...supportTicket,
        status: 'open',
        createdAt: serverTimestamp(),
        type: 'billing'
      });

      setSuccess('Support ticket submitted successfully. We\'ll get back to you within 24 hours.');
      setShowSupportModal(false);
      setSupportTicket({ subject: '', category: 'billing', message: '' });
    } catch (err) {
      console.error('Error submitting ticket:', err);
      setError('Failed to submit support ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'paid':
        return theme.colors.green;
      case 'trialing':
      case 'pending':
        return theme.colors.yellow;
      case 'canceled':
      case 'failed':
        return theme.colors.red;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'trialing':
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'canceled':
      case 'failed':
        return <X className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <RefreshCw className="h-8 w-8 animate-spin" style={{ color: theme.colors.accentPrimary }} />
      </div>
    );
  }

  return (
    <ScrollableLayout>
      <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
        {/* Header */}
        <div className="border-b" style={{ borderColor: theme.colors.blockBorder }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link
                  to="/boards"
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: theme.colors.textSecondary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                    e.currentTarget.style.color = theme.colors.textPrimary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
                  Billing & Subscription
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg flex items-center space-x-2" style={{ 
              backgroundColor: `${theme.colors.red}20`,
              border: `1px solid ${theme.colors.red}40`
            }}>
              <AlertCircle className="h-5 w-5" style={{ color: theme.colors.red }} />
              <span style={{ color: theme.colors.red }}>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg flex items-center space-x-2" style={{ 
              backgroundColor: `${theme.colors.green}20`,
              border: `1px solid ${theme.colors.green}40`
            }}>
              <CheckCircle className="h-5 w-5" style={{ color: theme.colors.green }} />
              <span style={{ color: theme.colors.green }}>{success}</span>
            </div>
          )}

          {/* Current Plan Card */}
          <div className="mb-8 p-6 rounded-lg" style={{ 
            backgroundColor: theme.colors.blockBackground,
            border: `1px solid ${theme.colors.blockBorder}`
          }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center space-x-2" style={{ color: theme.colors.textPrimary }}>
                <Package className="h-5 w-5" />
                <span>Current Plan</span>
              </h2>
              {subscription?.status && (
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm" style={{
                  backgroundColor: `${getStatusColor(subscription.status)}20`,
                  color: getStatusColor(subscription.status)
                }}>
                  {getStatusIcon(subscription.status)}
                  <span className="capitalize">{subscription.status}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm mb-1" style={{ color: theme.colors.textSecondary }}>Plan Type</p>
                <p className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>{tier.name}</p>
                <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>{tier.description}</p>
              </div>

              <div>
                <p className="text-sm mb-1" style={{ color: theme.colors.textSecondary }}>Billing Amount</p>
                <p className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                  ${subscription?.items?.[0]?.price?.unit_amount ? (subscription.items[0].price.unit_amount / 100).toFixed(2) : '0.00'}
                </p>
                <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                  per {subscription?.items?.[0]?.price?.recurring?.interval || 'month'}
                </p>
              </div>

              <div>
                <p className="text-sm mb-1" style={{ color: theme.colors.textSecondary }}>Next Billing Date</p>
                <p className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                  {subscription?.current_period_end 
                    ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
                {subscription?.cancel_at_period_end && (
                  <p className="text-sm mt-1" style={{ color: theme.colors.red }}>
                    Cancels at period end
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={handleManageSubscription}
                disabled={loading || !subscription}
                className="px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                style={{
                  backgroundColor: theme.colors.accentPrimary,
                  color: 'white',
                  opacity: loading || !subscription ? 0.5 : 1,
                  cursor: loading || !subscription ? 'not-allowed' : 'pointer'
                }}
              >
                <CreditCard className="h-4 w-4" />
                <span>Manage Subscription</span>
              </button>

              <Link
                to="/pricing"
                className="px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                style={{
                  backgroundColor: theme.colors.blockBackground,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.blockBorder}`
                }}
              >
                <TrendingUp className="h-4 w-4" />
                <span>View All Plans</span>
              </Link>
            </div>
          </div>

          {/* Storage Usage */}
          <div className="mb-8 p-6 rounded-lg" style={{ 
            backgroundColor: theme.colors.blockBackground,
            border: `1px solid ${theme.colors.blockBorder}`
          }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
              Storage Usage
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span style={{ color: theme.colors.textSecondary }}>
                    {formatBytes(storageUsed)} of {formatBytes(tier.limitations.storageLimit)} used
                  </span>
                  <span style={{ color: theme.colors.textSecondary }}>
                    {Math.round((storageUsed / tier.limitations.storageLimit) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.blockBorder }}>
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, (storageUsed / tier.limitations.storageLimit) * 100)}%`,
                      backgroundColor: storageUsed > tier.limitations.storageLimit * 0.9 
                        ? theme.colors.red 
                        : theme.colors.accentPrimary
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Invoice History */}
          <div className="mb-8 p-6 rounded-lg" style={{ 
            backgroundColor: theme.colors.blockBackground,
            border: `1px solid ${theme.colors.blockBorder}`
          }}>
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: theme.colors.textPrimary }}>
              <FileText className="h-5 w-5" />
              <span>Invoice History</span>
            </h2>

            {invoices.length === 0 ? (
              <p style={{ color: theme.colors.textSecondary }}>No invoices yet</p>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div 
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{ 
                      backgroundColor: theme.colors.modalBackground,
                      border: `1px solid ${theme.colors.blockBorder}`
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-5 w-5" style={{ color: theme.colors.textSecondary }} />
                      <div>
                        <p style={{ color: theme.colors.textPrimary }}>{invoice.description}</p>
                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                          {new Date(invoice.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                          ${invoice.amount.toFixed(2)}
                        </p>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(invoice.status)}
                          <span className="text-sm capitalize" style={{ color: getStatusColor(invoice.status) }}>
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                      <button
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: theme.colors.textSecondary }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                          e.currentTarget.style.color = theme.colors.textPrimary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = theme.colors.textSecondary;
                        }}
                        title="Download Invoice"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Support Section */}
          <div className="p-6 rounded-lg" style={{ 
            backgroundColor: theme.colors.blockBackground,
            border: `1px solid ${theme.colors.blockBorder}`
          }}>
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: theme.colors.textPrimary }}>
              <HelpCircle className="h-5 w-5" />
              <span>Need Help?</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowSupportModal(true)}
                className="p-4 rounded-lg text-center transition-all"
                style={{
                  backgroundColor: theme.colors.modalBackground,
                  border: `1px solid ${theme.colors.blockBorder}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.accentPrimary;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.blockBorder;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <MessageSquare className="h-8 w-8 mx-auto mb-2" style={{ color: theme.colors.accentPrimary }} />
                <p className="font-medium" style={{ color: theme.colors.textPrimary }}>Submit Ticket</p>
                <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                  Get help with billing issues
                </p>
              </button>

              <a
                href="mailto:support@LifeBlocks.ai"
                className="p-4 rounded-lg text-center transition-all block"
                style={{
                  backgroundColor: theme.colors.modalBackground,
                  border: `1px solid ${theme.colors.blockBorder}`,
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.accentPrimary;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.blockBorder;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Mail className="h-8 w-8 mx-auto mb-2" style={{ color: theme.colors.accentPrimary }} />
                <p className="font-medium" style={{ color: theme.colors.textPrimary }}>Email Support</p>
                <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                  support@LifeBlocks.ai
                </p>
              </a>

              <a
                href="https://docs.lifeblocks.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg text-center transition-all flex flex-col items-center"
                style={{
                  backgroundColor: theme.colors.modalBackground,
                  border: `1px solid ${theme.colors.blockBorder}`,
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.accentPrimary;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.blockBorder;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <ExternalLink className="h-8 w-8 mb-2" style={{ color: theme.colors.accentPrimary }} />
                <p className="font-medium" style={{ color: theme.colors.textPrimary }}>Documentation</p>
                <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                  Browse help articles
                </p>
              </a>
            </div>
          </div>
        </div>

        {/* Support Modal */}
        {showSupportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div 
              className="w-full max-w-md rounded-lg p-6"
              style={{ 
                backgroundColor: theme.colors.modalBackground,
                border: `1px solid ${theme.colors.blockBorder}`
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
                  Submit Support Ticket
                </h3>
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: theme.colors.textSecondary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.hoverBackground;
                    e.currentTarget.style.color = theme.colors.textPrimary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Category
                  </label>
                  <select
                    value={supportTicket.category}
                    onChange={(e) => setSupportTicket(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      border: `1px solid ${theme.colors.blockBorder}`,
                      color: theme.colors.textPrimary
                    }}
                  >
                    <option value="billing">Billing Issue</option>
                    <option value="payment">Payment Problem</option>
                    <option value="subscription">Subscription Question</option>
                    <option value="refund">Refund Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    value={supportTicket.subject}
                    onChange={(e) => setSupportTicket(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      border: `1px solid ${theme.colors.blockBorder}`,
                      color: theme.colors.textPrimary
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Message
                  </label>
                  <textarea
                    value={supportTicket.message}
                    onChange={(e) => setSupportTicket(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Please describe your issue in detail"
                    rows={5}
                    className="w-full px-3 py-2 rounded-lg resize-none"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      border: `1px solid ${theme.colors.blockBorder}`,
                      color: theme.colors.textPrimary
                    }}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSubmitTicket}
                    disabled={loading}
                    className="flex-1 py-2 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: theme.colors.accentPrimary,
                      color: 'white',
                      opacity: loading ? 0.5 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                  <button
                    onClick={() => setShowSupportModal(false)}
                    className="flex-1 py-2 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      color: theme.colors.textPrimary,
                      border: `1px solid ${theme.colors.blockBorder}`
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollableLayout>
  );
};

export default BillingPage;