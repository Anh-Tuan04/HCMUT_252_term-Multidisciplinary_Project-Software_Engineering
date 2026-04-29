import { useState } from "react";

import { useAuth } from "../../contexts/AuthContext";

interface ResetPasswordPageProps {
  navigate: (path: string) => void;
}

export const ResetPasswordPage = ({ navigate }: ResetPasswordPageProps) => {
  const { recovery, resetPassword } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [tone, setTone] = useState<"info" | "success" | "warning" | "error">(
    "info",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!recovery?.email) {
      setFeedback(
        "Không có email khôi phục. Vui lòng thực hiện lại từ bước quên mật khẩu.",
      );
      setTone("warning");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setFeedback("Vui lòng nhập đầy đủ mật khẩu mới và xác nhận.");
      setTone("warning");
      return;
    }

    if (newPassword.length < 6) {
      setFeedback("Mật khẩu mới cần ít nhất 6 ký tự.");
      setTone("warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback("Mật khẩu xác nhận không khớp.");
      setTone("error");
      return;
    }

    setIsSubmitting(true);
    setFeedback("Đang cập nhật mật khẩu mới...");
    setTone("info");

    const result = await resetPassword(newPassword, confirmPassword);

    if (!result.success) {
      setFeedback(result.message || "Đặt lại mật khẩu thất bại");
      setTone("error");
      setIsSubmitting(false);
      return;
    }

    setFeedback("Đặt lại mật khẩu thành công. Đang chuyển sang đăng nhập...");
    setTone("success");

    window.setTimeout(() => {
      navigate("/auth/login");
    }, 800);

    setIsSubmitting(false);
  };

  return (
    <div className="auth-page auth-reset-password-page">
      <div className="auth-top-actions">
        <button
          type="button"
          className="auth-map-btn"
          onClick={() => navigate("/map")}
        >
          Back to map
        </button>
      </div>
      <div className="page-wrapper">
        <main className="recover-shell">
          <section className="recover-card">
            <p className="chip">Smart Parking</p>
            <h1 className="main-title">Thiết lập mật khẩu mới</h1>
            <p className="sub-text">
              Nhập mật khẩu mới để hoàn tất quá trình khôi phục tài khoản.
            </p>
            {recovery?.email ? (
              <p className="recovery-email">
                Email: <strong>{recovery.email}</strong>
              </p>
            ) : null}

            <form className="form-container" onSubmit={submit} noValidate>
              <div className="input-group">
                <label className="label-text" htmlFor="new-password">
                  Nhập mật khẩu mới
                </label>
                <div className="password-box">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="input-field"
                    id="new-password"
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowNewPassword((previous) => !previous)}
                  >
                    <span>{showNewPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="label-text" htmlFor="confirm-password">
                  Xác nhận mật khẩu
                </label>
                <div className="password-box">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="input-field"
                    id="confirm-password"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                  >
                    <span>{showConfirmPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
              </div>

              <p
                className={`auth-feedback ${feedback ? `is-${tone}` : "is-hidden"}`}
              >
                {feedback || "feedback"}
              </p>

              <div className="button-group">
                <button
                  type="submit"
                  className="btn btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </button>
                <button
                  type="button"
                  className="btn btn-back"
                  onClick={() => navigate("/auth/reset/verify")}
                >
                  Quay lại
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};
