const WEEKDAY_LABELS: Record<number, string> = {
  0: "Chu nhat",
  1: "Thu 2",
  2: "Thu 3",
  3: "Thu 4",
  4: "Thu 5",
  5: "Thu 6",
  6: "Thu 7",
};

export const formatTime = (value: Date): string => {
  const hh = String(value.getHours()).padStart(2, "0");
  const mm = String(value.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

export const formatDateVi = (value: Date): string => {
  const weekday = WEEKDAY_LABELS[value.getDay()] ?? "Thu";
  const day = String(value.getDate()).padStart(2, "0");
  const month = value.getMonth() + 1;
  const year = value.getFullYear();

  return `${weekday}, ngay ${day} thang ${month} nam ${year}`;
};
