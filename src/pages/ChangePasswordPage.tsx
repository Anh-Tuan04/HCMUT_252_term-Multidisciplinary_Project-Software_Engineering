import { useState } from "react";

import { useAuth } from "../contexts/AuthContext";

const MAP_SETTINGS_FLAG = "map-open-settings";

interface ChangePasswordPageProps {
  navigate: (path: string) => void;
}

export const ChangePasswordPage = ({ navigate }: ChangePasswordPageProps) => {
  const { changePassword, isAuthenticated } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentError, setCurrentError] = useState("");
  const [newError, setNewError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const returnToMap = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(MAP_SETTINGS_FLAG, "true");
    }

    navigate("/map");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setCurrentError("");
    setNewError("");
    setConfirmError("");

    let hasError = false;

    if (!isAuthenticated) {
      setCurrentError("Vui lòng đăng nhập trước khi đổi mật khẩu!");
      hasError = true;
    }

    if (!currentPassword) {
      setCurrentError("Vui lòng nhập mật khẩu hiện tại!");
      hasError = true;
    }

    if (!newPassword) {
      setNewError("Vui lòng nhập mật khẩu mới!");
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmError("Vui lòng xác nhận mật khẩu!");
      hasError = true;
    }

    if (newPassword && newPassword.length < 6) {
      setNewError("Mật khẩu mới phải có ít nhất 6 ký tự!");
      hasError = true;
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setConfirmError("Xác nhận mật khẩu mới không khớp!");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsSubmitting(true);

    const result = await changePassword(
      currentPassword,
      newPassword,
      confirmPassword,
    );

    if (!result.success) {
      setConfirmError(result.message || "Không thể cập nhật mật khẩu!");
      setIsSubmitting(false);
      return;
    }

    window.alert("Mật khẩu đã được cập nhật thành công!");
    setIsSubmitting(false);
    returnToMap();
  };

  return (
    <div className="change-password-example">
      <div className="password-page-wrapper">
        <form className="password-container" onSubmit={submit} noValidate>
          <div
            className="back-btn"
            onClick={returnToMap}
            role="button"
            tabIndex={0}
          >
            <span className="material-icons">arrow_back</span> Quay lại
          </div>
          <h2 style={{ textAlign: "center", margin: 0 }}>Đổi mật khẩu</h2>

          <div className="input-group">
            <label htmlFor="current-pass">Mật khẩu hiện tại</label>
            <div className="input-wrapper">
              <input
                id="current-pass"
                type={showCurrent ? "text" : "password"}
                className={`current-pass ${currentError ? "input-error" : ""}`}
                placeholder="Nhập mật khẩu hiện tại"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
              <span
                className="material-icons toggle-password"
                onClick={() => setShowCurrent((previous) => !previous)}
                role="button"
                tabIndex={0}
              >
                {showCurrent ? "visibility" : "visibility_off"}
              </span>
            </div>
            <span className="error-msg error-current">{currentError}</span>
          </div>

          <div className="input-group">
            <label htmlFor="new-pass">Mật khẩu mới</label>
            <div className="input-wrapper">
              <input
                id="new-pass"
                type={showNew ? "text" : "password"}
                className={`new-pass ${newError ? "input-error" : ""}`}
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <span
                className="material-icons toggle-password"
                onClick={() => setShowNew((previous) => !previous)}
                role="button"
                tabIndex={0}
              >
                {showNew ? "visibility" : "visibility_off"}
              </span>
            </div>
            <span className="error-msg error-new">{newError}</span>
          </div>

          <div className="input-group">
            <label htmlFor="confirm-pass">Xác nhận mật khẩu</label>
            <div className="input-wrapper">
              <input
                id="confirm-pass"
                type={showConfirm ? "text" : "password"}
                className={`confirm-pass ${confirmError ? "input-error" : ""}`}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <span
                className="material-icons toggle-password"
                onClick={() => setShowConfirm((previous) => !previous)}
                role="button"
                tabIndex={0}
              >
                {showConfirm ? "visibility" : "visibility_off"}
              </span>
            </div>
            <span className="error-msg error-confirm">{confirmError}</span>
          </div>

          <button className="submit-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </form>
      </div>
    </div>
  );
};
