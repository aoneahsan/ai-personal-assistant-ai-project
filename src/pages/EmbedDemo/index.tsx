import EmbeddableWidget from '@/components/EmbeddableWidget/EmbeddableWidget';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import React, { useState } from 'react';
import { FaCode, FaCopy, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './EmbedDemo.scss';

const EmbedDemo: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<string>('e-commerce');
  const [showWidget, setShowWidget] = useState(false);

  const demoConfigs = {
    'e-commerce': {
      title: 'E-commerce Store',
      description: 'Customer support chat for online shopping',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      primaryColor: '#3b82f6',
      welcomeMessage: "Hi! Need help with your order? I'm here to assist!",
    },
    saas: {
      title: 'SaaS Platform',
      description: 'Technical support for software users',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      primaryColor: '#e91e63',
      welcomeMessage: 'Welcome! How can I help you with our platform today?',
    },
    blog: {
      title: 'Personal Blog',
      description: 'Connect with blog readers',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      primaryColor: '#00bcd4',
      welcomeMessage: 'Thanks for reading! Any questions about the content?',
    },
    portfolio: {
      title: 'Portfolio Website',
      description: 'Direct contact for potential clients',
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      primaryColor: '#ff5722',
      welcomeMessage: "Interested in working together? Let's chat!",
    },
  };

  const currentConfig = demoConfigs[selectedDemo as keyof typeof demoConfigs];

  const embedCode = `<!-- AI Personal Assistant Chat Widget -->
<div id="ai-chat-widget-demo"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/embed/widget.js';
    script.async = true;
    script.onload = function() {
      if (window.AIChatWidget) {
        window.AIChatWidget.init({
          embedId: 'demo-${selectedDemo}',
          containerId: 'ai-chat-widget-demo',
          baseUrl: '${window.location.origin}',
          userId: 'demo-user-123'
        });
      }
    };
    document.head.appendChild(script);
  })();
</script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard!');
  };

  const toggleWidget = () => {
    setShowWidget(!showWidget);
  };

  return (
    <div className='embed-demo-page'>
      <div className='embed-demo-header'>
        <div className='container'>
          <h1 className='demo-title'>Embeddable Chat Widget Demo</h1>
          <p className='demo-subtitle'>
            See how our AI chat widget looks and works on different types of
            websites
          </p>
        </div>
      </div>

      <div className='container demo-content'>
        {/* Demo Selection */}
        <Card className='demo-selection-card'>
          <h2>Choose a Demo Scenario</h2>
          <div className='demo-buttons'>
            {Object.entries(demoConfigs).map(([key, config]) => (
              <Button
                key={key}
                label={config.title}
                className={`demo-button ${selectedDemo === key ? 'active' : ''}`}
                onClick={() => setSelectedDemo(key)}
              />
            ))}
          </div>
        </Card>

        {/* Current Demo Info */}
        <Card className='demo-info-card'>
          <div className='demo-info-header'>
            <h3>{currentConfig.title}</h3>
            <p>{currentConfig.description}</p>
          </div>

          <div className='demo-actions'>
            <Button
              icon={<FaEye />}
              label={showWidget ? 'Hide Widget' : 'Show Widget'}
              onClick={toggleWidget}
              className='p-button-primary'
            />
            <Button
              icon={<FaCopy />}
              label='Copy Embed Code'
              onClick={copyEmbedCode}
              className='p-button-outlined'
            />
          </div>
        </Card>

        <div className='demo-layout'>
          {/* Website Preview */}
          <div className='website-preview'>
            <Panel
              header={`${currentConfig.title} - Website Preview`}
              className='preview-panel'
            >
              <div
                className='mock-website'
                style={{ background: currentConfig.background }}
              >
                <div className='mock-header'>
                  <div className='mock-logo'></div>
                  <div className='mock-nav'>
                    <span>Home</span>
                    <span>About</span>
                    <span>Services</span>
                    <span>Contact</span>
                  </div>
                </div>

                <div className='mock-content'>
                  <h2>Welcome to {currentConfig.title}</h2>
                  <p>
                    This is a demo website showing how the AI chat widget
                    integrates seamlessly with your existing design.
                  </p>

                  <div className='mock-features'>
                    <div className='feature-card'>
                      <h4>Feature 1</h4>
                      <p>Great functionality that helps users</p>
                    </div>
                    <div className='feature-card'>
                      <h4>Feature 2</h4>
                      <p>Amazing tools for productivity</p>
                    </div>
                    <div className='feature-card'>
                      <h4>Feature 3</h4>
                      <p>Excellent customer support</p>
                    </div>
                  </div>
                </div>

                <div className='mock-footer'>
                  <p>&copy; 2024 {currentConfig.title}. All rights reserved.</p>
                </div>

                {/* Embedded Widget */}
                {showWidget && (
                  <div id='demo-widget-container'>
                    <EmbeddableWidget
                      embedId={`demo-${selectedDemo}`}
                      containerId='demo-widget-container'
                      baseUrl={window.location.origin}
                      userId='demo-user-123'
                      userMetadata={{
                        name: 'Demo User',
                        email: 'demo@example.com',
                      }}
                    />
                  </div>
                )}
              </div>
            </Panel>
          </div>

          {/* Code Example */}
          <div className='code-example'>
            <Panel
              header='Embed Code'
              className='code-panel'
            >
              <div className='code-toolbar'>
                <span className='code-language'>HTML</span>
                <Button
                  icon={<FaCopy />}
                  className='p-button-text p-button-sm'
                  onClick={copyEmbedCode}
                  tooltip='Copy code'
                />
              </div>
              <pre className='code-block'>
                <code>{embedCode}</code>
              </pre>
            </Panel>

            <Panel
              header='Implementation Steps'
              className='steps-panel'
            >
              <div className='implementation-steps'>
                <div className='step'>
                  <div className='step-number'>1</div>
                  <div className='step-content'>
                    <h4>Create Embed</h4>
                    <p>
                      Go to the Embed Manager in your dashboard to create a new
                      chat embed.
                    </p>
                  </div>
                </div>

                <div className='step'>
                  <div className='step-number'>2</div>
                  <div className='step-content'>
                    <h4>Configure Settings</h4>
                    <p>
                      Customize the appearance, behavior, and allowed domains
                      for your widget.
                    </p>
                  </div>
                </div>

                <div className='step'>
                  <div className='step-number'>3</div>
                  <div className='step-content'>
                    <h4>Copy & Paste</h4>
                    <p>
                      Copy the generated embed code and paste it into your
                      website's HTML.
                    </p>
                  </div>
                </div>

                <div className='step'>
                  <div className='step-number'>4</div>
                  <div className='step-content'>
                    <h4>Start Chatting</h4>
                    <p>
                      Your visitors can now chat with you directly from your
                      website!
                    </p>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        {/* Features Overview */}
        <Card className='features-card'>
          <h2>Widget Features</h2>
          <div className='features-grid'>
            <div className='feature-item'>
              <FaCode className='feature-icon' />
              <h4>Easy Integration</h4>
              <p>Just copy and paste the embed code into your website</p>
            </div>

            <div className='feature-item'>
              <i className='pi pi-palette feature-icon'></i>
              <h4>Customizable Design</h4>
              <p>Match your brand colors and positioning preferences</p>
            </div>

            <div className='feature-item'>
              <i className='pi pi-mobile feature-icon'></i>
              <h4>Mobile Responsive</h4>
              <p>Works perfectly on desktop, tablet, and mobile devices</p>
            </div>

            <div className='feature-item'>
              <i className='pi pi-shield feature-icon'></i>
              <h4>Secure & Private</h4>
              <p>Domain restrictions and secure message delivery</p>
            </div>

            <div className='feature-item'>
              <i className='pi pi-comments feature-icon'></i>
              <h4>Real-time Chat</h4>
              <p>Instant messaging with file sharing capabilities</p>
            </div>

            <div className='feature-item'>
              <i className='pi pi-cog feature-icon'></i>
              <h4>Flexible Settings</h4>
              <p>Auto-open, welcome messages, and behavior controls</p>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <Card className='cta-card'>
          <div className='cta-content'>
            <h2>Ready to Add Chat to Your Website?</h2>
            <p>
              Create your own embeddable chat widget in just a few clicks.
              Connect with your website visitors in real-time!
            </p>
            <div className='cta-buttons'>
              <Button
                label='Create Your Embed'
                icon='pi pi-plus'
                className='p-button-lg p-button-primary'
              />
              <Button
                label='View Documentation'
                icon='pi pi-book'
                className='p-button-lg p-button-outlined'
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmbedDemo;
