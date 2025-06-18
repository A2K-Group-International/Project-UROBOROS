import { useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";

const useInterObserver = (callback) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    if (inView && memoizedCallback) {
      memoizedCallback();
    }
  }, [inView, memoizedCallback]);

  return { ref };
};

export default useInterObserver;
