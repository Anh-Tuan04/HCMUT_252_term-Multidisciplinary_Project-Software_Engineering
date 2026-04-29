interface ClockCardProps {
  time: string;
  dateLabel: string;
}

export const ClockCard = ({ time, dateLabel }: ClockCardProps) => {
  return (
    <div className="clock-card" aria-live="polite">
      <div className="clock-time">{time}</div>
      <div className="clock-date">{dateLabel}</div>
    </div>
  );
};
