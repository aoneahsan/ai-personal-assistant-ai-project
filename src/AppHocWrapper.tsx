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
          modalTitle: 'How was your experience?',
          widgetText: '💬 Feedback',
          hideAfterSubmit: true,
          onSubmit: (feedback) => {
            console.log('Feedback submitted:', feedback);
            // You can add analytics tracking here
          },
          onError: (error) => {
            console.error('Feedback error:', error);
          },
          onSuccess: () => {
            console.log('Feedback submitted successfully!');
          },
        }}
        autoShow={true}
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
