import { useEffect, useMemo, useState } from "react";

import { formatDateVi, formatTime } from "../utils/dateTime";

export const useClock = () => {
  const [current, setCurrent] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return useMemo(
    () => ({
      time: formatTime(current),
      dateLabel: formatDateVi(current),
    }),
    [current],
  );
};
