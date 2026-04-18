import { useEffect, useState } from 'react';

// origin 상태의 다음 프레임에 상태를 반영하고 싶을 때 사용합니다.
// 예를 들어 onLayout 콜백에서 뷰의 크기를 얻은 후 위치를 확정할 때, 동시에 뷰의 크기를 가시성 기준으로 삼는다면, 뷰가 이동하거나 깜빡이는 현상이 발생할 수 있습니다.
// 이를 방지하기 위해 사용합니다.
function useDelayedState<T>(origin: T, delay: number = 0) {
  const [state, setState] = useState<T>(origin);
  useEffect(() => {
    if (delay === 0) {
      setState(origin);

      return;
    }

    const timeout = setTimeout(() => {
      setState(origin);
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [delay, origin]);

  return state;
}

export default useDelayedState;
