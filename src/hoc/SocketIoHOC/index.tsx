import {
  connectToSocketIoServer,
  getSocketIoInstance,
} from '@/services/socketIo';
import { consoleInfo } from '@/utils/helpers/consoleHelper';
import { useUserDataZState } from '@/zustandStates/userState';
import { useEffect } from 'react';

// connect to socketIo
connectToSocketIoServer();

const SocketIoHOC: React.FC<{ children?: React.ReactNode }> = (props) => {
  const userData = useUserDataZState((state) => state.data);
  const userEmail = userData?.email;

  useEffect(() => {
    if (userEmail) {
      (async () => {
        // establish socketIo connection
        const _socketIoObj = getSocketIoInstance();
        consoleInfo('Socket IO Object', { _socketIoObj });
      })();
    }
  }, [userEmail]);

  return <>{props?.children}</>;
};

export default SocketIoHOC;
