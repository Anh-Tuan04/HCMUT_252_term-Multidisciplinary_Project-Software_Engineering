import { useState } from "react";

import { useAuth } from "../../contexts/AuthContext";

interface ForgotPasswordPageProps {
  navigate: (path: string) => void;
}

export const ForgotPasswordPage = ({ navigate }: ForgotPasswordPageProps) => {
  const { sendResetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<
    "info" | "success" | "warning" | "error"
  >("info");
  const [lookupFeedback, setLookupFeedback] = useState("");
  const [lookupTone, setLookupTone] = useState<
    "info" | "success" | "warning" | "error"
  >("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookupLoading, setIsLookupLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setFeedback("Vui lòng nhập email trước khi tiếp tục.");
      setFeedbackTone("warning");
      return;
    }

    setIsSubmitting(true);
    setFeedback("Đang kiểm tra email và gửi mã xác nhận...");
    setFeedbackTone("info");

    const result = await sendResetPassword(email);

    if (!result.success) {
      setFeedback(result.message || "Không thể gửi mã khôi phục lúc này");
      setFeedbackTone("error");
      setIsSubmitting(false);
      return;
    }

    setFeedback(
      "Mã khôi phục đã được gửi đến email. Đang chuyển sang bước nhập mã...",
    );
    setFeedbackTone("success");

    window.setTimeout(() => {
      navigate("/auth/reset/verify");
    }, 700);

    setIsSubmitting(false);
  };

  const findUsername = async () => {
    if (!email.trim()) {
      setLookupFeedback("Nhập email để tìm tên đăng nhập.");
      setLookupTone("warning");
      return;
    }

    setIsLookupLoading(true);
    setLookupFeedback("Đang tìm thông tin...");
    setLookupTone("info");

    await new Promise((resolve) => window.setTimeout(resolve, 300));

    setLookupFeedback(
      "Backend hiện tại không hỗ trợ tìm tên đăng nhập theo email.",
    );
    setLookupTone("warning");
    setIsLookupLoading(false);
  };

  return (
    <div className="auth-page auth-forgot-page">
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
            <h1 className="main-title">Quên mật khẩu</h1>
            <p className="sub-text">
              Nhập email để nhận mã xác nhận và tiếp tục đặt lại mật khẩu.
            </p>

            <form className="form-container" onSubmit={submit} noValidate>
              <div className="input-group">
                <label className="label-text" htmlFor="forgot-email">
                  Nhập E-mail của bạn
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  className="input-field"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <p
                className={`auth-feedback ${feedback ? `is-${feedbackTone}` : "is-hidden"}`}
              >
                {feedback || "feedback"}
              </p>
              <p
                className={`lookup-feedback ${lookupFeedback ? `is-${lookupTone}` : "is-hidden"}`}
              >
                {lookupFeedback || "lookup"}
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
                  className="btn btn-info"
                  onClick={findUsername}
                  disabled={isLookupLoading}
                >
                  {isLookupLoading
                    ? "Đang tìm..."
                    : "Tìm tên đăng nhập bằng E-mail"}
                </button>
                <button
                  type="button"
                  className="btn btn-back"
                  onClick={() => navigate("/auth/login")}
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
