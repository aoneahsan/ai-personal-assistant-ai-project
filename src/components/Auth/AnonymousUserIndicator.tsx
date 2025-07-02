import { unifiedAuthService } from '@/services/authService';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import React, { useState } from 'react';
import AnonymousConversionModal from './AnonymousConversionModal';
import './AnonymousUserIndicator.scss';

interface AnonymousUserIndicatorProps {
  variant?: 'banner' | 'card' | 'minimal';
  showConversion?: boolean;
  className?: string;
}

const AnonymousUserIndicator: React.FC<AnonymousUserIndicatorProps> = ({
  variant = 'banner',
  showConversion = true,
  className = '',
}) => {
  const [showConversionModal, setShowConversionModal] = useState(false);
  const anonymousInfo = unifiedAuthService.getAnonymousUserInfo();

  if (!anonymousInfo) return null;

  const handleConversionSuccess = () => {
    setShowConversionModal(false);
    // The auth state will update automatically, causing this component to unmount
  };

  if (variant === 'minimal') {
    return (
      <div className={`anonymous-indicator minimal ${className}`}>
        <Badge
          value='Anonymous'
          severity='warning'
          className='anonymous-badge'
        />
        {showConversion && (
          <Button
            icon='pi pi-user-plus'
            className='p-button-text p-button-sm convert-btn'
            onClick={() => setShowConversionModal(true)}
            tooltip='Create Account'
            tooltipOptions={{ position: 'bottom' }}
          />
        )}
        <AnonymousConversionModal
          visible={showConversionModal}
          onHide={() => setShowConversionModal(false)}
          onSuccess={handleConversionSuccess}
        />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`anonymous-indicator card ${className}`}>
        <Card className='anonymous-card'>
          <div className='card-content'>
            <div className='status-section'>
              <div className='status-icon'>🎭</div>
              <div className='status-info'>
                <h4>Anonymous Mode</h4>
                <p>
                  You're chatting anonymously as{' '}
                  <strong>{anonymousInfo.displayName}</strong>
                </p>
              </div>
            </div>

            {showConversion && (
              <div className='action-section'>
                <Button
                  label='Create Account'
                  icon='pi pi-user-plus'
                  className='p-button-outlined convert-btn'
                  onClick={() => setShowConversionModal(true)}
                  size='small'
                />
              </div>
            )}
          </div>
        </Card>

        <AnonymousConversionModal
          visible={showConversionModal}
          onHide={() => setShowConversionModal(false)}
          onSuccess={handleConversionSuccess}
        />
      </div>
    );
  }

  return (
    <div className={`anonymous-indicator banner ${className}`}>
      <div className='banner-content'>
        <div className='banner-left'>
          <div className='banner-icon'>🎭</div>
          <div className='banner-info'>
            <div className='banner-title'>
              Anonymous Mode
              <Badge
                value='Temporary'
                severity='warning'
                className='ml-2'
              />
            </div>
            <div className='banner-subtitle'>
              You're chatting as <strong>{anonymousInfo.displayName}</strong> •
              Messages won't be saved permanently
            </div>
          </div>
        </div>

        {showConversion && (
          <div className='banner-right'>
            <Button
              label='Save My Chats'
              icon='pi pi-save'
              className='p-button-success save-btn'
              onClick={() => setShowConversionModal(true)}
              size='small'
            />
          </div>
        )}
      </div>

      <AnonymousConversionModal
        visible={showConversionModal}
        onHide={() => setShowConversionModal(false)}
        onSuccess={handleConversionSuccess}
      />
    </div>
  );
};

export default AnonymousUserIndicator;
