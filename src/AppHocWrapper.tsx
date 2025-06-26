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

import './index.scss';

const AppHocWrapper = () => {
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
