import { isHybrid } from '@/utils/constants/capacitorConstants';

import { useRouter } from '@tanstack/react-router';
import { useSwipeable } from 'react-swipeable';

const AppSwipeHOC: React.FC<{ children?: React.ReactNode }> = (props) => {
  const router = useRouter();

  const handleSwipeNavigation = (goBack = true) => {
    if (isHybrid) {
      if (goBack) {
        router.history.back();
      } else {
        router.history.forward();
      }
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      handleSwipeNavigation(true);
    },
    onSwipedLeft: () => {
      handleSwipeNavigation(false);
    },
    delta: 200,
    trackMouse: false,
  });

  return (
    <>
      <div {...swipeHandlers}>{props?.children}</div>
    </>
  );
};

export default AppSwipeHOC;
