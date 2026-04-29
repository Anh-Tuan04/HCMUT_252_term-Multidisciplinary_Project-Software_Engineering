interface SlotStatsCardProps {
  empty: number;
  occupied: number;
  usable: number;
}

export const SlotStatsCard = ({
  empty,
  occupied,
  usable,
}: SlotStatsCardProps) => {
  return (
    <div className="slot-stats" aria-live="polite">
      <div className="stats-col">
        <div className="stats-title">Trống</div>
        <div className="stats-value">
          {empty}/{usable}
        </div>
      </div>
      <div className="stats-divider" aria-hidden="true" />
      <div className="stats-col">
        <div className="stats-title">Đã đỗ</div>
        <div className="stats-value">
          {occupied}/{usable}
        </div>
      </div>
    </div>
  );
};
