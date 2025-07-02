import { AuthProvider, unifiedAuthService } from '@/services/authService';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './AnonymousChatWelcome.scss';

interface AnonymousChatWelcomeProps {
  onAnonymousStart?: () => void;
  onShowSignUp?: () => void;
  onShowLogin?: () => void;
}

const AnonymousChatWelcome: React.FC<AnonymousChatWelcomeProps> = ({
  onAnonymousStart,
  onShowSignUp,
  onShowLogin,
}) => {
  const navigate = useNavigate();
  const [isStartingAnonymous, setIsStartingAnonymous] = useState(false);
  const [socialLoading, setSocialLoading] = useState<AuthProvider | null>(null);

  const handleStartAnonymousChat = async () => {
    setIsStartingAnonymous(true);
    try {
      await unifiedAuthService.signInAnonymously();
      toast.success('Welcome! You can start chatting anonymously now.');
      onAnonymousStart?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to start anonymous chat'
      );
    } finally {
      setIsStartingAnonymous(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading(AuthProvider.GOOGLE);
    try {
      await unifiedAuthService.signInWithGoogle();
      toast.success('Welcome! You have signed in with Google successfully.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to sign in with Google'
      );
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setSocialLoading(AuthProvider.APPLE);
    try {
      await unifiedAuthService.signInWithApple();
      toast.success('Welcome! You have signed in with Apple successfully.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to sign in with Apple'
      );
    } finally {
      setSocialLoading(null);
    }
  };

  const isAppleAvailable = unifiedAuthService.isAppleSignInAvailable();

  return (
    <div className='anonymous-chat-welcome'>
      <Card className='welcome-card'>
        <div className='welcome-header'>
          <div className='welcome-icon'>💬</div>
          <h2 className='welcome-title'>AI Personal Assistant</h2>
          <p className='welcome-subtitle'>
            Start chatting instantly or create an account for full features
          </p>
        </div>

        <div className='welcome-content'>
          {/* Anonymous Chat Option */}
          <div className='option-section anonymous-section'>
            <div className='option-header'>
              <div className='option-icon'>🎭</div>
              <h3>Try Anonymous Chat</h3>
              <p>Start chatting immediately without creating an account</p>
            </div>

            <div className='features-list'>
              <div className='feature-item'>
                <i className='pi pi-check text-green-500' />
                <span>Instant access - no signup required</span>
              </div>
              <div className='feature-item'>
                <i className='pi pi-check text-green-500' />
                <span>Basic chat functionality</span>
              </div>
              <div className='feature-item'>
                <i className='pi pi-check text-green-500' />
                <span>Temporary session</span>
              </div>
              <div className='feature-item'>
                <i className='pi pi-times text-gray-400' />
                <span>No message history saved</span>
              </div>
              <div className='feature-item'>
                <i className='pi pi-times text-gray-400' />
                <span>Limited features</span>
              </div>
            </div>

            <div className='anonymous-buttons'>
              <Button
                label='Personal AI Chat'
                icon='pi pi-user'
                className='p-button-success p-button-lg anonymous-btn'
                onClick={handleStartAnonymousChat}
                loading={isStartingAnonymous}
              />

              <Button
                label='Public Chat Rooms'
                icon='pi pi-users'
                className='p-button-outlined p-button-lg rooms-btn'
                onClick={() => navigate({ to: '/room' })}
              />
            </div>
          </div>

          <Divider
            align='center'
            className='divider-section'
          >
            <span className='divider-text'>OR</span>
          </Divider>

          {/* Account Options */}
          <div className='option-section account-section'>
            <div className='option-header'>
              <div className='option-icon'>🔐</div>
              <h3>Create Account for Full Features</h3>
              <p>
                Get access to all premium features and save your conversations
              </p>
            </div>

            <div className='features-list'>
              <div className='feature-item'>
                <i className='pi pi-check text-blue-500' />
                <span>Save conversation history</span>
              </div>
              <div className='feature-item'>
                <i className='pi pi-check text-blue-500' />
                <span>Edit and delete messages</span>
              </div>
              <div className='feature-item'>
                <i className='pi pi-check text-blue-500' />
                <span>Advanced search features</span>
              </div>
              <div className='feature-item'>
                <i className='pi pi-check text-blue-500' />
                <span>File sharing and backup</span>
              </div>
              <div className='feature-item'>
                <i className='pi pi-check text-blue-500' />
                <span>Multiple themes</span>
              </div>
            </div>

            <div className='auth-buttons'>
              {/* Social Sign In Buttons */}
              <div className='social-buttons'>
                <Button
                  label='Continue with Google'
                  icon='pi pi-google'
                  className='p-button-outlined google-btn'
                  onClick={handleGoogleSignIn}
                  loading={socialLoading === AuthProvider.GOOGLE}
                />

                {isAppleAvailable && (
                  <Button
                    label='Continue with Apple'
                    icon='pi pi-apple'
                    className='p-button-outlined apple-btn'
                    onClick={handleAppleSignIn}
                    loading={socialLoading === AuthProvider.APPLE}
                  />
                )}
              </div>

              <Divider />

              {/* Email Options */}
              <div className='email-buttons'>
                <Button
                  label='Create Account'
                  icon='pi pi-user-plus'
                  className='p-button-primary create-account-btn'
                  onClick={onShowSignUp}
                />

                <Button
                  label='Sign In'
                  icon='pi pi-sign-in'
                  className='p-button-text signin-btn'
                  onClick={onShowLogin}
                />
              </div>
            </div>
          </div>
        </div>

        <div className='welcome-footer'>
          <p className='privacy-note'>
            <i className='pi pi-shield text-blue-500 mr-2' />
            Your privacy is protected. Anonymous chats are temporary and not
            stored permanently.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AnonymousChatWelcome;
