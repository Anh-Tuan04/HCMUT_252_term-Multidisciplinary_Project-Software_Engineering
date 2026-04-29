import { useEffect, useState } from "react";

import { BottomActions } from "../components/map-page/BottomActions";
import { ClockCard } from "../components/map-page/ClockCard";
import { ParkingMapGrid } from "../components/map-page/ParkingMapGrid";
import { SlotStatsCard } from "../components/map-page/SlotStatsCard";
import { TopRightActions } from "../components/map-page/TopRightActions";
import { useAuth } from "../contexts/AuthContext";
import { useClock } from "../hooks/useClock";
import { useParkingMap } from "../hooks/useParkingMap";

const MAP_SETTINGS_FLAG = "map-open-settings";

interface MapPageProps {
  navigate: (path: string) => void;
}

const MapPage = ({ navigate }: MapPageProps) => {
  const { session, role, isAuthenticated, signOut } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("");
  const [logoutMessage, setLogoutMessage] = useState("");
  const { time, dateLabel } = useClock();
  const {
    slots,
    stats,
    reload,
    isReloading,
    adminEnabled,
    selectedSlotId,
    openSlotMenu,
    closeSlotMenu,
    updateSlotStatusAsAdmin,
  } = useParkingMap({
    accessToken: session?.accessToken,
    role,
    onError: (message) => {
      setNoticeMessage(message);
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      document.body.classList.remove("is-logged-in");
      document.body.classList.add("is-logged-out");
      setIsSettingsOpen(false);
      closeSlotMenu();
      return;
    }

    document.body.classList.remove("is-logged-out");
    document.body.classList.add("is-logged-in");

    if (typeof window === "undefined") {
      return;
    }

    if (window.sessionStorage.getItem(MAP_SETTINGS_FLAG)) {
      window.sessionStorage.removeItem(MAP_SETTINGS_FLAG);
      setIsSettingsOpen(true);
    }
  }, [closeSlotMenu, isAuthenticated]);

  useEffect(() => {
    if (!noticeMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setNoticeMessage("");
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [noticeMessage]);

  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      if (event.message) {
        setNoticeMessage(event.message);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason instanceof Error) {
        setNoticeMessage(reason.message);
        return;
      }

      if (typeof reason === "string") {
        setNoticeMessage(reason);
        return;
      }

      setNoticeMessage("Đã xảy ra lỗi không xác định trên MapPage.");
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  const openSettings = () => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const goToLogin = () => {
    navigate("/auth");
  };

  const goToChangePassword = () => {
    setIsSettingsOpen(false);
    navigate("/account/change-password");
  };

  const handleLogout = async () => {
    await signOut();
    setIsSettingsOpen(false);
    setLogoutMessage("Bạn đã đăng xuất");
    const timer = window.setTimeout(() => {
      setLogoutMessage("");
    }, 3000);
  };

  return (
    <main className="map-page">
      <ClockCard time={time} dateLabel={dateLabel} />

      <SlotStatsCard
        empty={stats.empty}
        occupied={stats.occupied}
        usable={stats.usable}
      />

      <TopRightActions
        isAuthenticated={isAuthenticated}
        onLogin={goToLogin}
        onOpenSettings={openSettings}
      />

      {isAuthenticated ? (
        <aside className={`settings-sidebar ${isSettingsOpen ? "active" : ""}`}>
          <div
            className="sidebar-close"
            onClick={closeSettings}
            role="button"
            tabIndex={0}
          >
            ❌
          </div>
          <h2>Cài đặt</h2>
          <button
            type="button"
            className="sidebar-btn"
            onClick={goToChangePassword}
          >
            Đặt lại mật khẩu
          </button>
          <button
            type="button"
            className="sidebar-btn logout"
            onClick={handleLogout}
          >
            <span className="material-icons">logout</span>
            <span>Đăng xuất</span>
          </button>
        </aside>
      ) : null}

      <ParkingMapGrid
        slots={slots}
        adminEnabled={adminEnabled}
        selectedSlotId={selectedSlotId}
        onSelectSlot={openSlotMenu}
        onCloseSlotMenu={closeSlotMenu}
        onChangeSlotStatus={updateSlotStatusAsAdmin}
      />

      <div
        id="global-error-toast"
        className={`error-toast ${noticeMessage ? "is-visible" : ""}`}
        aria-live="polite"
        aria-hidden={!noticeMessage}
      >
        <span className="error-toast-text">{noticeMessage}</span>
        <button
          type="button"
          className="error-toast-close"
          aria-label="Đóng thông báo"
          onClick={() => setNoticeMessage("")}
        >
          ❌
        </button>
      </div>

      <div
        className={`logout-notification ${logoutMessage ? "is-visible" : ""}`}
        aria-live="polite"
        aria-hidden={!logoutMessage}
      >
        {logoutMessage}
      </div>

      <BottomActions onReload={reload} isReloading={isReloading} />
    </main>
  );
};

export default MapPage;
