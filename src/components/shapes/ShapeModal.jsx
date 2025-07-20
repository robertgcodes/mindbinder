import React, { useState } from 'react';
import StandardModal, { FormGroup, Label, Input } from '../StandardModal';
import { Shapes, Palette, Eye, Minus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ShapeModal = ({ shape, onClose, onUpdate }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    stroke: shape.data?.stroke || theme.colors.textSecondary || '#666666',
    strokeWidth: shape.data?.strokeWidth || 2,
    fill: shape.data?.fill || 'transparent',
    opacity: shape.data?.opacity !== undefined ? shape.data.opacity : 1,
    showArrow: shape.data?.showArrow || false,
    arrowColor: shape.data?.arrowColor || shape.data?.stroke || theme.colors.textSecondary,
    tension: shape.data?.tension !== undefined ? shape.data.tension : 0.5,
    cornerRadius: shape.data?.cornerRadius || 0,
  });

  const handleSave = () => {
    onUpdate({ data: formData });
    onClose();
  };

  const isLineShape = shape.type === 'line' || shape.type === 's-line' || shape.type === 'arrow';
  const isCurvedLine = shape.type === 's-line';
  const hasCornerRadius = shape.type === 'square';
  const hasFill = shape.type !== 'line' && shape.type !== 's-line' && shape.type !== 'arrow';

  return (
    <StandardModal
      isOpen={true}
      onClose={onClose}
      onSave={handleSave}
      title="Shape Properties"
      icon={Shapes}
      maxWidth="500px"
    >
      <div style={{ minHeight: '300px' }}>
        {/* Stroke Color */}
        <FormGroup>
          <Label>Stroke Color</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="color"
              value={formData.stroke}
              onChange={(e) => setFormData(prev => ({ ...prev, stroke: e.target.value }))}
              style={{
                width: '50px',
                height: '36px',
                border: `1px solid ${theme.colors.blockBorder}`,
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: formData.stroke
              }}
            />
            <Input
              type="text"
              value={formData.stroke}
              onChange={(e) => setFormData(prev => ({ ...prev, stroke: e.target.value }))}
              placeholder="#666666"
              style={{ flex: 1 }}
            />
          </div>
        </FormGroup>

        {/* Stroke Width */}
        <FormGroup>
          <Label>Stroke Width</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Input
              type="range"
              min="1"
              max="20"
              value={formData.strokeWidth}
              onChange={(e) => setFormData(prev => ({ ...prev, strokeWidth: parseInt(e.target.value) }))}
              style={{ flex: 1 }}
            />
            <div style={{
              width: '50px',
              textAlign: 'center',
              color: theme.colors.textPrimary,
              fontSize: '14px'
            }}>
              {formData.strokeWidth}px
            </div>
          </div>
        </FormGroup>

        {/* Fill Color (for shapes) */}
        {hasFill && (
          <FormGroup>
            <Label>Fill Color</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="color"
                value={formData.fill === 'transparent' ? '#ffffff' : formData.fill}
                onChange={(e) => setFormData(prev => ({ ...prev, fill: e.target.value }))}
                style={{
                  width: '50px',
                  height: '36px',
                  border: `1px solid ${theme.colors.blockBorder}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: formData.fill === 'transparent' ? '#ffffff' : formData.fill
                }}
              />
              <Input
                type="text"
                value={formData.fill}
                onChange={(e) => setFormData(prev => ({ ...prev, fill: e.target.value }))}
                placeholder="transparent"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => setFormData(prev => ({ ...prev, fill: 'transparent' }))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${theme.colors.blockBorder}`,
                  backgroundColor: theme.colors.modalBackground,
                  color: theme.colors.textSecondary,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Transparent
              </button>
            </div>
          </FormGroup>
        )}

        {/* Opacity */}
        <FormGroup>
          <Label>Opacity</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={formData.opacity}
              onChange={(e) => setFormData(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
              style={{ flex: 1 }}
            />
            <div style={{
              width: '50px',
              textAlign: 'center',
              color: theme.colors.textPrimary,
              fontSize: '14px'
            }}>
              {Math.round(formData.opacity * 100)}%
            </div>
          </div>
        </FormGroup>

        {/* Corner Radius (for squares) */}
        {hasCornerRadius && (
          <FormGroup>
            <Label>Corner Radius</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Input
                type="range"
                min="0"
                max="50"
                value={formData.cornerRadius}
                onChange={(e) => setFormData(prev => ({ ...prev, cornerRadius: parseInt(e.target.value) }))}
                style={{ flex: 1 }}
              />
              <div style={{
                width: '50px',
                textAlign: 'center',
                color: theme.colors.textPrimary,
                fontSize: '14px'
              }}>
                {formData.cornerRadius}px
              </div>
            </div>
          </FormGroup>
        )}

        {/* Curve Tension (for s-lines) */}
        {isCurvedLine && (
          <FormGroup>
            <Label>Curve Tension</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.tension}
                onChange={(e) => setFormData(prev => ({ ...prev, tension: parseFloat(e.target.value) }))}
                style={{ flex: 1 }}
              />
              <div style={{
                width: '50px',
                textAlign: 'center',
                color: theme.colors.textPrimary,
                fontSize: '14px'
              }}>
                {formData.tension}
              </div>
            </div>
          </FormGroup>
        )}

        {/* Arrow Options (for lines) */}
        {isLineShape && (
          <>
            <FormGroup>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="showArrow"
                  checked={formData.showArrow}
                  onChange={(e) => setFormData(prev => ({ ...prev, showArrow: e.target.checked }))}
                  style={{ cursor: 'pointer' }}
                />
                <Label htmlFor="showArrow" style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Show Arrow
                </Label>
              </div>
            </FormGroup>

            {formData.showArrow && (
              <FormGroup>
                <Label>Arrow Color</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="color"
                    value={formData.arrowColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, arrowColor: e.target.value }))}
                    style={{
                      width: '50px',
                      height: '36px',
                      border: `1px solid ${theme.colors.blockBorder}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: formData.arrowColor
                    }}
                  />
                  <Input
                    type="text"
                    value={formData.arrowColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, arrowColor: e.target.value }))}
                    placeholder="#666666"
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, arrowColor: formData.stroke }))}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${theme.colors.blockBorder}`,
                      backgroundColor: theme.colors.modalBackground,
                      color: theme.colors.textSecondary,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Match Stroke
                  </button>
                </div>
              </FormGroup>
            )}
          </>
        )}

        {/* Preview */}
        <FormGroup>
          <Label>Preview</Label>
          <div style={{
            height: '100px',
            backgroundColor: theme.colors.background,
            border: `1px solid ${theme.colors.blockBorder}`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {shape.type === 'line' && (
              <div
                style={{
                  width: '80%',
                  height: `${formData.strokeWidth}px`,
                  backgroundColor: formData.stroke,
                  opacity: formData.opacity,
                  position: 'relative'
                }}
              >
                {formData.showArrow && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: `10px solid ${formData.arrowColor}`,
                      borderTop: '5px solid transparent',
                      borderBottom: '5px solid transparent'
                    }}
                  />
                )}
              </div>
            )}
            {shape.type === 'circle' && (
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  border: `${formData.strokeWidth}px solid ${formData.stroke}`,
                  backgroundColor: formData.fill,
                  opacity: formData.opacity
                }}
              />
            )}
            {shape.type === 'square' && (
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: `${formData.cornerRadius}px`,
                  border: `${formData.strokeWidth}px solid ${formData.stroke}`,
                  backgroundColor: formData.fill,
                  opacity: formData.opacity
                }}
              />
            )}
            {shape.type === 'triangle' && (
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '30px solid transparent',
                  borderRight: '30px solid transparent',
                  borderBottom: `52px solid ${formData.fill}`,
                  filter: `drop-shadow(0 0 0 ${formData.stroke})`,
                  opacity: formData.opacity
                }}
              />
            )}
          </div>
        </FormGroup>
      </div>
    </StandardModal>
  );
};

export default ShapeModal;