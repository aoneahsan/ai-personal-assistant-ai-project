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
    </>
  );
};

export default AppHocWrapper;
