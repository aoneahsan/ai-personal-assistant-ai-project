import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import AmplitudeHoc from './hoc/AmplitudeHoc';
import NetworkStatusHOC from './hoc/NetworkStatusHOC';
import OneSignalHOC from './hoc/OneSignalHOC';
import PrimeReactHoc from './hoc/PrimeReactHoc';
import ProductFruitsHOC from './hoc/ProductFruitsHOC';
import SocketIoHOC from './hoc/SocketIoHOC';
import TanstackQueryHoc from './hoc/Tanstack/QueryHoc';
import TolgeeHoc from './hoc/TolgeeHoc';
import useTheme from './hooks/useTheme';
import { FeedbackModule } from './modules/FeedbackModule';
import { auth, db } from './services/firebase';
import { useUserDataZState } from './zustandStates/userState';

import './index.scss';

const AppHocWrapper = () => {
  // Initialize theme system
  useTheme();

  // Get current user for feedback module
  const currentUser = useUserDataZState((state) => state.data);
  const firebaseUser = auth.currentUser;

  return (
    <>
      <PrimeReactHoc>
        <TanstackQueryHoc>
          <TolgeeHoc>
            <App />
          </TolgeeHoc>

          {/* Standalone HOCs */}
          <AmplitudeHoc />
          <NetworkStatusHOC />
          <OneSignalHOC />
          <ProductFruitsHOC />
          <SocketIoHOC />
        </TanstackQueryHoc>
      </PrimeReactHoc>

      {/* Feedback Module */}
      <FeedbackModule
        firestore={db}
        user={firebaseUser}
        config={{
          collectionName: 'user_feedback',
          theme: 'auto',
          position: 'bottom-right',

          // Trigger Configuration - only show manually or after 3 minutes
          trigger: {
            type: 'time-delay',
            delay: 3, // Show after 3 minutes
            exitIntent: false,
          },

          // Step-specific encouraging text
          step1Title: 'How was your experience?',
          step2Title: 'Tell us more',
          step3Title: 'Thank you!',
          step1Subtitle: 'Your rating helps us improve',
          step2Subtitle: 'Share your thoughts with us (optional)',
          step3Message:
            'We appreciate your feedback and will use it to make things better!',
          continueButtonText: 'Continue',
          nextButtonText: 'Share & Finish',
          closeButtonText: 'Close',
          skipButtonText: 'Skip',
          placeholderText:
            'What can we do better? Your thoughts matter to us...',

          // Behavior
          widgetText: 'Share Feedback',
          hideAfterSubmit: true,
          requireMessage: false,
          showStep2: true,

          // Callbacks
          onSubmit: (feedback) => {
            console.log('Feedback submitted:', feedback);
            // Add analytics tracking here if needed
          },
          onError: (error) => {
            console.error('Feedback error:', error);
          },
          onSuccess: () => {
            console.log('Feedback submitted successfully!');
          },
          onStepChange: (step) => {
            console.log('Feedback step changed to:', step);
          },
        }}
        autoShow={false} // Don't auto-show the widget immediately
        dismissHours={24} // Hide for 24 hours when dismissed
        showDismissButton={true} // Allow users to dismiss the widget
      />

      {/* Toast Notifications */}
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
    </>
  );
};

export default AppHocWrapper;
