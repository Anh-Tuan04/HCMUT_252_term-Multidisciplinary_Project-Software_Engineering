import reloadIcon from "../../assets/MapPage/ReloadIcon.svg";

interface BottomActionsProps {
  onReload: () => void;
  isReloading: boolean;
}

export const BottomActions = ({
  onReload,
  isReloading,
}: BottomActionsProps) => {
  return (
    <>
      <button
        type="button"
        className={`reload-btn ${isReloading ? "is-reloading" : ""}`}
        aria-label="Reload"
        onClick={onReload}
      >
        <img
          src={reloadIcon}
          alt="Reload"
          className={isReloading ? "spinning" : ""}
        />
      </button>

      <div className="up-arrow" aria-label="Huong len tren">
        ↑
      </div>
    </>
  );
};
