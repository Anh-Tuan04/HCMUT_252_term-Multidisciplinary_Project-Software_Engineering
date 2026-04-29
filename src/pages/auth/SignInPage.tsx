import { useState } from "react";

import { useAuth } from "../../contexts/AuthContext";

interface SignInPageProps {
  navigate: (path: string) => void;
}

export const SignInPage = ({ navigate }: SignInPageProps) => {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [tone, setTone] = useState<"info" | "success" | "warning" | "error">(
    "info",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setFeedback("Vui lòng nhập đầy đủ email và mật khẩu.");
      setTone("warning");
      return;
    }

    setIsSubmitting(true);
    setFeedback("Đang gửi yêu cầu đăng nhập...");
    setTone("info");

    const result = await signIn(email, password);

    if (!result.success) {
      setFeedback(result.message || "Đăng nhập thất bại");
      setTone("error");
      setIsSubmitting(false);
      return;
    }

    setFeedback("Đăng nhập thành công. Đang chuyển đến trang bản đồ...");
    setTone("success");

    window.setTimeout(() => {
      navigate("/map");
    }, 650);

    setIsSubmitting(false);
  };

  return (
    <div className="auth-page auth-signin-page">
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
        <main className="auth-shell">
          <section className="auth-card">
            <p className="chip">Smart Parking</p>
            <h2 className="login-header">Đăng nhập</h2>
            <p className="desc">
              Đăng nhập để quản lý thông tin bãi đỗ xe và tài khoản của bạn.
            </p>

            <form className="auth-form" onSubmit={submit} noValidate>
              <div className="input-group">
                <label className="label-text" htmlFor="signin-email">
                  Nhập email của bạn
                </label>
                <input
                  id="signin-email"
                  type="email"
                  className="input-field"
                  placeholder="Email của bạn"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="label-text" htmlFor="signin-password">
                  Nhập mật khẩu của bạn
                </label>
                <div className="password-box">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="signin-password"
                    className="input-field"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowPassword((previous) => !previous)}
                  >
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="link-like forgot-link"
                onClick={() => navigate("/auth/forgot")}
              >
                Bạn quên mật khẩu?
              </button>

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
                  {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
                </button>
                <button
                  type="button"
                  className="btn btn-back"
                  onClick={() => navigate("/auth")}
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
