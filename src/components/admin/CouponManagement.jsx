import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, X, Check, Copy, 
  Calendar, Users, Percent, DollarSign, Gift, 
  AlertCircle, RefreshCw, Download, Eye, EyeOff,
  CheckCircle
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  createCoupon, 
  getAllCoupons, 
  updateCoupon,
  updateCouponStatus, 
  deleteCoupon,
  getCouponStats,
  COUPON_TYPES,
  FEATURE_ACCESS_TYPES 
} from '../../services/couponService';
import { Timestamp } from 'firebase/firestore';

const CouponManagement = () => {
  const { theme } = useTheme();
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Form state for creating coupon
  const [formData, setFormData] = useState({
    code: '',
    type: COUPON_TYPES.PERCENTAGE_DISCOUNT,
    description: '',
    discountPercentage: 0,
    discountAmount: 0,
    grantedFeatures: [],
    durationDays: 30,
    maxRedemptions: null,
    oneTimeUse: false,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: null
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  useEffect(() => {
    filterCoupons(searchQuery);
  }, [searchQuery, coupons]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const allCoupons = await getAllCoupons();
      setCoupons(allCoupons);
      setFilteredCoupons(allCoupons);
    } catch (error) {
      console.error('Error loading coupons:', error);
      alert('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const filterCoupons = (query) => {
    if (!query) {
      setFilteredCoupons(coupons);
      return;
    }

    const filtered = coupons.filter(coupon => 
      coupon.code.toLowerCase().includes(query.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(query.toLowerCase()) ||
      coupon.type.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCoupons(filtered);
  };

  const handleCreateCoupon = async () => {
    try {
      // Validate form
      if (!formData.code) {
        alert('Coupon code is required');
        return;
      }

      const couponData = {
        ...formData,
        code: formData.code.toUpperCase(),
        validFrom: formData.validFrom ? Timestamp.fromDate(new Date(formData.validFrom)) : Timestamp.now(),
        validUntil: formData.validUntil ? Timestamp.fromDate(new Date(formData.validUntil)) : null,
        maxRedemptions: formData.maxRedemptions || null,
        createdBy: 'admin' // You might want to get actual admin user ID
      };

      // Clean up data based on type
      if (formData.type !== COUPON_TYPES.PERCENTAGE_DISCOUNT) {
        delete couponData.discountPercentage;
      }
      if (formData.type !== COUPON_TYPES.FIXED_DISCOUNT) {
        delete couponData.discountAmount;
      }
      if (formData.type !== COUPON_TYPES.FEATURE_ACCESS && formData.type !== COUPON_TYPES.FREE_TRIAL) {
        couponData.grantedFeatures = [];
      }

      await createCoupon(couponData);
      alert('Coupon created successfully');
      setShowCreateModal(false);
      resetForm();
      loadCoupons();
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Failed to create coupon');
    }
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      description: coupon.description || '',
      discountPercentage: coupon.discountPercentage || 0,
      discountAmount: coupon.discountAmount || 0,
      grantedFeatures: coupon.grantedFeatures || [],
      durationDays: coupon.durationDays || 30,
      maxRedemptions: coupon.maxRedemptions || null,
      oneTimeUse: coupon.oneTimeUse || false,
      validFrom: coupon.validFrom ? new Date(coupon.validFrom.seconds * 1000).toISOString().split('T')[0] : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil.seconds * 1000).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleUpdateCoupon = async () => {
    try {
      // Validate form
      if (!formData.code) {
        alert('Coupon code is required');
        return;
      }

      const updateData = {
        ...formData,
        code: formData.code.toUpperCase(),
        validFrom: formData.validFrom ? Timestamp.fromDate(new Date(formData.validFrom)) : Timestamp.now(),
        validUntil: formData.validUntil ? Timestamp.fromDate(new Date(formData.validUntil)) : null,
        maxRedemptions: formData.maxRedemptions || null
      };

      // Clean up data based on type
      if (formData.type !== COUPON_TYPES.PERCENTAGE_DISCOUNT) {
        delete updateData.discountPercentage;
      }
      if (formData.type !== COUPON_TYPES.FIXED_DISCOUNT) {
        delete updateData.discountAmount;
      }
      if (formData.type !== COUPON_TYPES.FEATURE_ACCESS && formData.type !== COUPON_TYPES.FREE_TRIAL) {
        updateData.grantedFeatures = [];
      }

      await updateCoupon(editingCoupon.id, updateData);
      alert('Coupon updated successfully');
      setShowEditModal(false);
      setEditingCoupon(null);
      resetForm();
      loadCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      alert('Failed to update coupon');
    }
  };

  const handleToggleStatus = async (couponId, currentStatus) => {
    try {
      await updateCouponStatus(couponId, !currentStatus);
      alert(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadCoupons();
    } catch (error) {
      console.error('Error updating coupon status:', error);
      alert('Failed to update coupon status');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(couponId);
        alert('Coupon deleted successfully');
        loadCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
        alert('Failed to delete coupon');
      }
    }
  };

  const handleViewStats = async (coupon) => {
    try {
      const couponStats = await getCouponStats(coupon.id);
      setStats(couponStats);
      setSelectedCoupon(coupon);
      setShowStatsModal(true);
    } catch (error) {
      console.error('Error fetching coupon stats:', error);
      alert('Failed to load coupon statistics');
    }
  };

  const handleCopyCode = (code, event) => {
    navigator.clipboard.writeText(code);
    // Use a less intrusive notification for copy action
    const copyButton = event.currentTarget;
    const originalTitle = copyButton.title;
    copyButton.title = 'Copied!';
    setTimeout(() => {
      copyButton.title = originalTitle;
    }, 2000);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: COUPON_TYPES.PERCENTAGE_DISCOUNT,
      description: '',
      discountPercentage: 0,
      discountAmount: 0,
      grantedFeatures: [],
      durationDays: 30,
      maxRedemptions: null,
      oneTimeUse: false,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: null
    });
  };

  const exportCoupons = () => {
    const csv = [
      ['Code', 'Type', 'Description', 'Status', 'Redemptions', 'Max Redemptions', 'Valid From', 'Valid Until'].join(','),
      ...filteredCoupons.map(coupon => [
        coupon.code,
        coupon.type,
        coupon.description || 'N/A',
        coupon.isActive ? 'Active' : 'Inactive',
        coupon.currentRedemptions,
        coupon.maxRedemptions || 'Unlimited',
        coupon.validFrom?.toDate?.().toLocaleDateString() || 'N/A',
        coupon.validUntil?.toDate?.().toLocaleDateString() || 'No expiry'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coupons-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" style={{ color: theme.colors.accentPrimary }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h2 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
          Coupon Management
        </h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
              style={{ color: theme.colors.textSecondary }} 
            />
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg"
              style={{
                backgroundColor: theme.colors.modalBackground,
                border: `1px solid ${theme.colors.blockBorder}`,
                color: theme.colors.textPrimary,
                minWidth: '200px'
              }}
            />
          </div>

          {/* Export */}
          <button
            onClick={exportCoupons}
            className="px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            style={{
              backgroundColor: theme.colors.modalBackground,
              border: `1px solid ${theme.colors.blockBorder}`,
              color: theme.colors.textPrimary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.colors.accentPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.colors.blockBorder;
            }}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>

          {/* Create New */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
            style={{
              backgroundColor: theme.colors.accentPrimary,
              color: 'white'
            }}
          >
            <Plus className="h-4 w-4" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="rounded-lg overflow-hidden" style={{ 
        backgroundColor: theme.colors.blockBackground,
        border: `1px solid ${theme.colors.blockBorder}`
      }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: theme.colors.blockBorder }}>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                  style={{ color: theme.colors.textSecondary }}>
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                  style={{ color: theme.colors.textSecondary }}>
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                  style={{ color: theme.colors.textSecondary }}>
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                  style={{ color: theme.colors.textSecondary }}>
                  Usage
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                  style={{ color: theme.colors.textSecondary }}>
                  Validity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                  style={{ color: theme.colors.textSecondary }}>
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                  style={{ color: theme.colors.textSecondary }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center" style={{ color: theme.colors.textSecondary }}>
                    No coupons found. Create your first coupon to get started.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b hover:bg-opacity-5" 
                    style={{ borderColor: theme.colors.blockBorder }}>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <code className="font-mono font-medium" style={{ 
                          color: theme.colors.textPrimary,
                          backgroundColor: theme.colors.hoverBackground,
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {coupon.code}
                        </code>
                        <button
                          onClick={(e) => handleCopyCode(coupon.code, e)}
                          className="p-1 rounded transition-colors"
                          style={{ color: theme.colors.textSecondary }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = theme.colors.textPrimary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = theme.colors.textSecondary;
                          }}
                          title="Copy code"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm capitalize" style={{ color: theme.colors.textPrimary }}>
                        {coupon.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                        {coupon.description || 'No description'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <span style={{ color: theme.colors.textPrimary }}>
                          {coupon.currentRedemptions}
                        </span>
                        <span style={{ color: theme.colors.textSecondary }}>
                          {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ' / ∞'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs space-y-1">
                        <div style={{ color: theme.colors.textSecondary }}>
                          From: {coupon.validFrom?.toDate?.().toLocaleDateString() || 'Now'}
                        </div>
                        <div style={{ color: theme.colors.textSecondary }}>
                          Until: {coupon.validUntil?.toDate?.().toLocaleDateString() || 'No expiry'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                        className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: coupon.isActive ? `${theme.colors.green}20` : `${theme.colors.red}20`,
                          color: coupon.isActive ? theme.colors.green : theme.colors.red
                        }}
                      >
                        {coupon.isActive ? (
                          <>
                            <Eye className="h-3 w-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditCoupon(coupon)}
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
                          title="Edit Coupon"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleViewStats(coupon)}
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
                          title="View Statistics"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: theme.colors.textSecondary }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = theme.colors.textSecondary;
                          }}
                          title="Delete Coupon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="w-full max-w-2xl rounded-lg p-6 max-h-[90vh] overflow-y-auto"
            style={{ 
              backgroundColor: theme.colors.modalBackground,
              border: `1px solid ${theme.colors.blockBorder}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
                Create New Coupon
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
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
              {/* Code and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER2024"
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
                    Coupon Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      border: `1px solid ${theme.colors.blockBorder}`,
                      color: theme.colors.textPrimary
                    }}
                  >
                    <option value={COUPON_TYPES.PERCENTAGE_DISCOUNT}>Percentage Discount</option>
                    <option value={COUPON_TYPES.FIXED_DISCOUNT}>Fixed Discount</option>
                    <option value={COUPON_TYPES.FREE_TRIAL}>Free Trial</option>
                    <option value={COUPON_TYPES.FEATURE_ACCESS}>Feature Access</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summer promotion - 50% off"
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: theme.colors.blockBackground,
                    border: `1px solid ${theme.colors.blockBorder}`,
                    color: theme.colors.textPrimary
                  }}
                />
              </div>

              {/* Type-specific fields */}
              {formData.type === COUPON_TYPES.PERCENTAGE_DISCOUNT && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Discount Percentage
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.blockBackground,
                        border: `1px solid ${theme.colors.blockBorder}`,
                        color: theme.colors.textPrimary
                      }}
                    />
                    <span className="ml-2" style={{ color: theme.colors.textSecondary }}>%</span>
                  </div>
                </div>
              )}

              {formData.type === COUPON_TYPES.FIXED_DISCOUNT && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Discount Amount
                  </label>
                  <div className="flex items-center">
                    <span className="mr-2" style={{ color: theme.colors.textSecondary }}>$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.blockBackground,
                        border: `1px solid ${theme.colors.blockBorder}`,
                        color: theme.colors.textPrimary
                      }}
                    />
                  </div>
                </div>
              )}

              {(formData.type === COUPON_TYPES.FEATURE_ACCESS || formData.type === COUPON_TYPES.FREE_TRIAL) && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Granted Features
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.grantedFeatures.includes('pro')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, grantedFeatures: [...formData.grantedFeatures, 'pro'] });
                          } else {
                            setFormData({ ...formData, grantedFeatures: formData.grantedFeatures.filter(f => f !== 'pro') });
                          }
                        }}
                      />
                      <span style={{ color: theme.colors.textPrimary }}>Pro Access</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.grantedFeatures.includes('ai_features')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, grantedFeatures: [...formData.grantedFeatures, 'ai_features'] });
                          } else {
                            setFormData({ ...formData, grantedFeatures: formData.grantedFeatures.filter(f => f !== 'ai_features') });
                          }
                        }}
                      />
                      <span style={{ color: theme.colors.textPrimary }}>AI Features</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.grantedFeatures.includes('unlimited_boards')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, grantedFeatures: [...formData.grantedFeatures, 'unlimited_boards'] });
                          } else {
                            setFormData({ ...formData, grantedFeatures: formData.grantedFeatures.filter(f => f !== 'unlimited_boards') });
                          }
                        }}
                      />
                      <span style={{ color: theme.colors.textPrimary }}>Unlimited Boards</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      border: `1px solid ${theme.colors.blockBorder}`,
                      color: theme.colors.textPrimary
                    }}
                    disabled={!!formData.validUntil}
                  />
                  {formData.validUntil && (
                    <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                      Duration ignored when "Valid Until" is set - all users expire on that date
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxRedemptions || ''}
                    onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      border: `1px solid ${theme.colors.blockBorder}`,
                      color: theme.colors.textPrimary
                    }}
                  />
                </div>
              </div>

              {/* Validity Period */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
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
                    Valid Until (Hard Expiration)
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil || ''}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value || null })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      border: `1px solid ${theme.colors.blockBorder}`,
                      color: theme.colors.textPrimary
                    }}
                  />
                  <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                    {formData.validUntil ? 
                      'All users will lose access on this date, regardless of when they redeemed' : 
                      'Leave empty to use duration from redemption date'
                    }
                  </p>
                </div>
              </div>

              {/* One-time use */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.oneTimeUse}
                  onChange={(e) => setFormData({ ...formData, oneTimeUse: e.target.checked })}
                />
                <span style={{ color: theme.colors.textPrimary }}>One-time use per user</span>
              </label>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: theme.colors.blockBackground,
                    color: theme.colors.textPrimary,
                    border: `1px solid ${theme.colors.blockBorder}`
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCoupon}
                  className="px-4 py-2 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: theme.colors.accentPrimary,
                    color: 'white'
                  }}
                >
                  Create Coupon
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && selectedCoupon && stats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowStatsModal(false)}
        >
          <div 
            className="w-full max-w-2xl rounded-lg p-6"
            style={{ 
              backgroundColor: theme.colors.modalBackground,
              border: `1px solid ${theme.colors.blockBorder}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
                Coupon Statistics: {selectedCoupon.code}
              </h3>
              <button
                onClick={() => setShowStatsModal(false)}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg" style={{ 
                  backgroundColor: theme.colors.blockBackground,
                  border: `1px solid ${theme.colors.blockBorder}`
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-6 w-6" style={{ color: theme.colors.accentPrimary }} />
                    <span className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                      {stats.totalRedemptions}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Total Redemptions</p>
                </div>

                <div className="p-4 rounded-lg" style={{ 
                  backgroundColor: theme.colors.blockBackground,
                  border: `1px solid ${theme.colors.blockBorder}`
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="h-6 w-6" style={{ color: theme.colors.green }} />
                    <span className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                      {stats.activeRedemptions}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Active Users</p>
                </div>

                <div className="p-4 rounded-lg" style={{ 
                  backgroundColor: theme.colors.blockBackground,
                  border: `1px solid ${theme.colors.blockBorder}`
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <Percent className="h-6 w-6" style={{ color: theme.colors.yellow }} />
                    <span className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                      {stats.redemptionRate ? `${stats.redemptionRate.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Redemption Rate</p>
                </div>
              </div>

              {stats.redemptionsByDate && Object.keys(stats.redemptionsByDate).length > 0 && (
                <div className="p-4 rounded-lg" style={{ 
                  backgroundColor: theme.colors.blockBackground,
                  border: `1px solid ${theme.colors.blockBorder}`
                }}>
                  <h4 className="font-medium mb-3" style={{ color: theme.colors.textPrimary }}>
                    Redemptions by Date
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {Object.entries(stats.redemptionsByDate).map(([date, count]) => (
                      <div key={date} className="flex justify-between text-sm">
                        <span style={{ color: theme.colors.textSecondary }}>{date}</span>
                        <span style={{ color: theme.colors.textPrimary }}>{count} redemptions</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {showEditModal && editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => {
            setShowEditModal(false);
            setEditingCoupon(null);
            resetForm();
          }}
        >
          <div 
            className="w-full max-w-2xl rounded-lg p-6 max-h-[90vh] overflow-y-auto"
            style={{ 
              backgroundColor: theme.colors.modalBackground,
              border: `1px solid ${theme.colors.blockBorder}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
                Edit Coupon
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCoupon(null);
                  resetForm();
                }}
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
              {/* Code and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER2024"
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      border: `1px solid ${theme.colors.blockBorder}`,
                      color: theme.colors.textPrimary
                    }}
                    disabled={editingCoupon.currentRedemptions > 0}
                  />
                  {editingCoupon.currentRedemptions > 0 && (
                    <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                      Code cannot be changed after redemptions
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Coupon Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      border: `1px solid ${theme.colors.blockBorder}`,
                      color: theme.colors.textPrimary
                    }}
                  >
                    <option value={COUPON_TYPES.PERCENTAGE_DISCOUNT}>Percentage Discount</option>
                    <option value={COUPON_TYPES.FIXED_DISCOUNT}>Fixed Discount</option>
                    <option value={COUPON_TYPES.FREE_TRIAL}>Free Trial</option>
                    <option value={COUPON_TYPES.FEATURE_ACCESS}>Feature Access</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summer promotion - 50% off"
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: theme.colors.blockBackground,
                    border: `1px solid ${theme.colors.blockBorder}`,
                    color: theme.colors.textPrimary
                  }}
                />
              </div>

              {/* Type-specific fields */}
              {formData.type === COUPON_TYPES.PERCENTAGE_DISCOUNT && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Discount Percentage
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.blockBackground,
                        border: `1px solid ${theme.colors.blockBorder}`,
                        color: theme.colors.textPrimary
                      }}
                    />
                    <span className="ml-2" style={{ color: theme.colors.textSecondary }}>%</span>
                  </div>
                </div>
              )}

              {formData.type === COUPON_TYPES.FIXED_DISCOUNT && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Discount Amount
                  </label>
                  <div className="flex items-center">
                    <span className="mr-2" style={{ color: theme.colors.textSecondary }}>$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: theme.colors.blockBackground,
                        border: `1px solid ${theme.colors.blockBorder}`,
                        color: theme.colors.textPrimary
                      }}
                    />
                  </div>
                </div>
              )}

              {(formData.type === COUPON_TYPES.FEATURE_ACCESS || formData.type === COUPON_TYPES.FREE_TRIAL) && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Granted Features
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.grantedFeatures.includes('pro')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, grantedFeatures: [...formData.grantedFeatures, 'pro'] });
                          } else {
                            setFormData({ ...formData, grantedFeatures: formData.grantedFeatures.filter(f => f !== 'pro') });
                          }
                        }}
                      />
                      <span style={{ color: theme.colors.textPrimary }}>Pro Access</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.grantedFeatures.includes('ai_features')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, grantedFeatures: [...formData.grantedFeatures, 'ai_features'] });
                          } else {
                            setFormData({ ...formData, grantedFeatures: formData.grantedFeatures.filter(f => f !== 'ai_features') });
                          }
                        }}
                      />
                      <span style={{ color: theme.colors.textPrimary }}>AI Features</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.grantedFeatures.includes('unlimited_boards')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, grantedFeatures: [...formData.grantedFeatures, 'unlimited_boards'] });
                          } else {
                            setFormData({ ...formData, grantedFeatures: formData.grantedFeatures.filter(f => f !== 'unlimited_boards') });
                          }
                        }}
                      />
                      <span style={{ color: theme.colors.textPrimary }}>Unlimited Boards</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      border: `1px solid ${theme.colors.blockBorder}`,
                      color: theme.colors.textPrimary
                    }}
                    disabled={!!formData.validUntil}
                  />
                  {formData.validUntil && (
                    <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                      Duration ignored when "Valid Until" is set - all users expire on that date
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxRedemptions || ''}
                    onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      border: `1px solid ${theme.colors.blockBorder}`,
                      color: theme.colors.textPrimary
                    }}
                  />
                  {editingCoupon.currentRedemptions > 0 && (
                    <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                      Current redemptions: {editingCoupon.currentRedemptions}
                    </p>
                  )}
                </div>
              </div>

              {/* Validity Period */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textPrimary }}>
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
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
                    Valid Until (Hard Expiration)
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil || ''}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value || null })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: theme.colors.blockBackground,
                      border: `1px solid ${theme.colors.blockBorder}`,
                      color: theme.colors.textPrimary
                    }}
                  />
                  <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                    {formData.validUntil ? 
                      'All users will lose access on this date, regardless of when they redeemed' : 
                      'Leave empty to use duration from redemption date'
                    }
                  </p>
                </div>
              </div>

              {/* One-time use */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.oneTimeUse}
                  onChange={(e) => setFormData({ ...formData, oneTimeUse: e.target.checked })}
                />
                <span style={{ color: theme.colors.textPrimary }}>One-time use per user</span>
              </label>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCoupon(null);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: theme.colors.blockBackground,
                    color: theme.colors.textPrimary,
                    border: `1px solid ${theme.colors.blockBorder}`
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCoupon}
                  className="px-4 py-2 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: theme.colors.accentPrimary,
                    color: 'white'
                  }}
                >
                  Update Coupon
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;