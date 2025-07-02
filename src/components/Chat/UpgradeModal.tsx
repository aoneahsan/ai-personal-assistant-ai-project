import { featureFlagService } from '@/services/featureFlagService';
import { ChatFeatureFlag, SubscriptionPlan } from '@/types/user/subscription';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import React from 'react';

interface UpgradeModalProps {
  visible: boolean;
  feature: ChatFeatureFlag | null;
  onHide: () => void;
  onUpgrade: (plan: SubscriptionPlan) => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  visible,
  feature,
  onHide,
  onUpgrade,
}) => {
  if (!feature) return null;

  const upgradeInfo = featureFlagService.getFeatureUpgradeInfo(feature);

  const featureDescriptions: Record<ChatFeatureFlag, string> = {
    [ChatFeatureFlag.MESSAGE_EDITING]:
      'Edit your messages after sending them. Perfect for fixing typos or clarifying your thoughts.',
    [ChatFeatureFlag.MESSAGE_DELETION]:
      'Remove messages you no longer want visible in the conversation.',
    [ChatFeatureFlag.MESSAGE_HISTORY]:
      'View complete edit history of messages to track all changes made over time.',
    [ChatFeatureFlag.ANONYMOUS_CHAT]:
      'Start anonymous conversations without revealing your identity.',
    [ChatFeatureFlag.GROUP_CHAT]:
      'Create and manage group conversations with multiple participants.',
    [ChatFeatureFlag.FILE_SHARING]:
      'Share files, images, and documents in your conversations.',
    [ChatFeatureFlag.VOICE_MESSAGES]:
      'Send voice messages for more personal communication.',
    [ChatFeatureFlag.VIDEO_MESSAGES]:
      'Send video messages and recordings to enhance your conversations.',
    [ChatFeatureFlag.MESSAGE_REACTIONS]:
      'React to messages with emojis and expressions.',
    [ChatFeatureFlag.MESSAGE_FORWARDING]:
      'Forward messages between different conversations.',
  };

  const planPricing: Record<
    SubscriptionPlan,
    { price: string; period: string }
  > = {
    [SubscriptionPlan.FREE]: { price: 'Free', period: 'forever' },
    [SubscriptionPlan.PRO]: { price: '$9.99', period: 'month' },
    [SubscriptionPlan.PREMIUM]: { price: '$19.99', period: 'month' },
    [SubscriptionPlan.ENTERPRISE]: { price: 'Custom', period: 'contact us' },
  };

  const planColors: Record<SubscriptionPlan, string> = {
    [SubscriptionPlan.FREE]: 'secondary',
    [SubscriptionPlan.PRO]: 'info',
    [SubscriptionPlan.PREMIUM]: 'warning',
    [SubscriptionPlan.ENTERPRISE]: 'success',
  };

  const dialogHeader = (
    <div className='flex align-items-center gap-3'>
      <div className='p-2 bg-primary-100 border-circle'>
        <i className='pi pi-star text-primary text-xl'></i>
      </div>
      <div>
        <h3 className='m-0 text-900'>Upgrade Required</h3>
        <p className='m-0 text-600 text-sm'>Unlock premium features</p>
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: '600px' }}
      header={dialogHeader}
      onHide={onHide}
      draggable={false}
      resizable={false}
      modal
      blockScroll
    >
      <div className='flex flex-column gap-4'>
        {/* Feature highlight */}
        <div className='bg-gradient-to-r from-primary-50 to-blue-50 p-4 border-round border-left-3 border-primary'>
          <div className='flex align-items-center gap-3 mb-3'>
            <i className='pi pi-lock text-primary text-2xl'></i>
            <div>
              <h4 className='m-0 text-900 text-lg'>
                {upgradeInfo.feature
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </h4>
              <p className='m-0 text-600'>{featureDescriptions[feature]}</p>
            </div>
          </div>

          <Tag
            value={`Requires ${upgradeInfo.planName} Plan`}
            severity={planColors[upgradeInfo.requiredPlan]}
            icon='pi pi-star'
            className='font-medium'
          />
        </div>

        {/* Plan comparison */}
        <div className='grid'>
          {Object.values(SubscriptionPlan).map((plan) => {
            const isRequired = plan === upgradeInfo.requiredPlan;
            const isHigher =
              Object.values(SubscriptionPlan).indexOf(plan) >=
              Object.values(SubscriptionPlan).indexOf(upgradeInfo.requiredPlan);

            return (
              <div
                key={plan}
                className='col-6 md:col-3'
              >
                <div
                  className={`p-3 border-round border-2 h-full flex flex-column ${
                    isRequired
                      ? 'border-primary bg-primary-50'
                      : isHigher
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className='flex align-items-center justify-content-between mb-2'>
                    <h5 className='m-0 text-900 capitalize'>{plan}</h5>
                    {isRequired && (
                      <Tag
                        value='Required'
                        severity='success'
                        className='text-xs'
                      />
                    )}
                  </div>

                  <div className='mb-3'>
                    <span className='text-2xl font-bold text-900'>
                      {planPricing[plan].price}
                    </span>
                    {plan !== SubscriptionPlan.FREE &&
                      plan !== SubscriptionPlan.ENTERPRISE && (
                        <span className='text-600 text-sm'>
                          /{planPricing[plan].period}
                        </span>
                      )}
                  </div>

                  <div className='flex-grow-1'>
                    <div className='text-sm text-600'>
                      {upgradeInfo.benefits
                        .slice(0, 3)
                        .map((benefit, index) => (
                          <div
                            key={index}
                            className='flex align-items-center gap-2 mb-1'
                          >
                            <i className='pi pi-check text-green-500 text-xs'></i>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      {upgradeInfo.benefits.length > 3 && (
                        <div className='text-500 text-xs mt-1'>
                          +{upgradeInfo.benefits.length - 3} more features
                        </div>
                      )}
                    </div>
                  </div>

                  {isHigher && (
                    <Button
                      label={
                        plan === SubscriptionPlan.ENTERPRISE
                          ? 'Contact Sales'
                          : `Upgrade to ${plan}`
                      }
                      className={`mt-3 w-full text-sm ${
                        isRequired ? 'p-button-primary' : 'p-button-outlined'
                      }`}
                      size='small'
                      onClick={() => onUpgrade(plan)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature benefits */}
        <div className='bg-blue-50 p-3 border-round'>
          <div className='flex align-items-center gap-2 mb-2'>
            <i className='pi pi-info-circle text-blue-600'></i>
            <span className='font-medium text-blue-900'>Why Upgrade?</span>
          </div>
          <ul className='text-blue-800 text-sm line-height-3 pl-3 m-0'>
            <li>Access to all current and future premium features</li>
            <li>Priority customer support</li>
            <li>Enhanced security and privacy controls</li>
            <li>Increased storage and file sharing limits</li>
            <li>Advanced customization options</li>
          </ul>
        </div>

        {/* Footer actions */}
        <div className='flex justify-content-between align-items-center pt-3 border-top-1 surface-border'>
          <Button
            label='Maybe Later'
            className='p-button-text'
            onClick={onHide}
          />
          <Button
            label={`Upgrade to ${upgradeInfo.planName}`}
            icon='pi pi-arrow-right'
            iconPos='right'
            className='p-button-primary'
            onClick={() => onUpgrade(upgradeInfo.requiredPlan)}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default UpgradeModal;
