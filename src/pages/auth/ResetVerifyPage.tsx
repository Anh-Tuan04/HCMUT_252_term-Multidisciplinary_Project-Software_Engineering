import { useMemo, useState } from "react";

import { useAuth } from "../../contexts/AuthContext";

interface ResetVerifyPageProps {
  navigate: (path: string) => void;
}

const formatDuration = (totalSeconds: number): string => {
  const normalized = Math.max(0, totalSeconds);
  const mm = String(Math.floor(normalized / 60)).padStart(2, "0");
  const ss = String(normalized % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

export const ResetVerifyPage = ({ navigate }: ResetVerifyPageProps) => {
  const { recovery, sendResetPassword, setRecoveryCode } = useAuth();

  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState("");
  const [tone, setTone] = useState<"info" | "success" | "warning" | "error">(
    "info",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remainingSeconds = useMemo(() => {
    if (!recovery) {
      return 0;
    }

    return Math.max(0, Math.ceil((recovery.expiresAt - Date.now()) / 1000));
  }, [recovery]);

  const isExpired = remainingSeconds <= 0;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!recovery?.email) {
      setFeedback(
        "Không tìm thấy phiên khôi phục. Vui lòng quay lại bước quên mật khẩu.",
      );
      setTone("warning");
      return;
    }

    setIsSubmitting(true);
    const result = setRecoveryCode(code);

    if (!result.success) {
      setFeedback(result.message);
      setTone("error");
      setIsSubmitting(false);
      return;
    }

    setFeedback("Mã hợp lệ. Đang chuyển sang bước đặt lại mật khẩu...");
    setTone("success");

    window.setTimeout(() => {
      navigate("/auth/reset/password");
    }, 600);

    setIsSubmitting(false);
  };

  const resendCode = async () => {
    if (!recovery?.email) {
      setFeedback(
        "Không tìm thấy email khôi phục. Vui lòng quay lại bước quên mật khẩu.",
      );
      setTone("warning");
      return;
    }

    setIsSubmitting(true);
    setFeedback("Đang gửi lại mã xác nhận...");
    setTone("info");

    const result = await sendResetPassword(recovery.email);

    if (!result.success) {
      setFeedback(result.message || "Không thể gửi lại mã lúc này");
      setTone("error");
      setIsSubmitting(false);
      return;
    }

    setFeedback("Đã gửi lại mã mới cho email của bạn.");
    setTone("success");
    setIsSubmitting(false);
  };

  return (
    <div className="auth-page auth-reset-verify-page">
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
            <h1 className="main-title">Đặt lại mật khẩu</h1>
            <p className="sub-text">
              Nhập mã khôi phục được gửi trong email để tiếp tục đặt lại mật
              khẩu.
            </p>
            {recovery?.email ? (
              <p className="recovery-email">
                Email: <strong>{recovery.email}</strong>
              </p>
            ) : null}

            <form className="form-container" onSubmit={submit} noValidate>
              <div className="input-group">
                <label className="label-text" htmlFor="verify-code">
                  Nhập mã xác nhận
                </label>
                <input
                  id="verify-code"
                  type="text"
                  className="input-field"
                  placeholder="Ví dụ: 5dbf7f58-..."
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  required
                />
              </div>

              <div className="timer-section">
                <p>Mã này có hiệu lực trong</p>
                <div className={`countdown ${isExpired ? "is-expired" : ""}`}>
                  {formatDuration(remainingSeconds)}
                </div>
                <button
                  type="button"
                  className="resend-btn"
                  onClick={resendCode}
                  disabled={isSubmitting}
                >
                  Gửi lại mã
                </button>
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
                  {isSubmitting ? "Đang kiểm tra..." : "Xác nhận"}
                </button>
                <button
                  type="button"
                  className="btn btn-back"
                  onClick={() => navigate("/auth/forgot")}
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
