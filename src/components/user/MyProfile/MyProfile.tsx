import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAccount } from "../../../redux/slices/userSlice";
import { toast } from "react-toastify";
import type { RfidCard, UserProfile } from "../../../interfaces";

import {
  getMyProfile,
  getMyRfidCard,
  updateMyProfile,
} from "../../../services/apiServices";

import "./MyProfile.scss";

type RootState = {
  user: {
    account: UserProfile | null;
  };
};

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const MyProfile = () => {
  const dispatch = useDispatch();
  const account = useSelector((state: RootState) => state.user.account);

  const [profile, setProfile] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    email: "",
    role: "USER",
  });

  const [rfidCard, setRfidCard] = useState<RfidCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [profileRes, rfidRes] = await Promise.allSettled([
          getMyProfile(),
          getMyRfidCard(),
        ]);

        if (profileRes.status === "fulfilled") {
          const res = profileRes.value;

          if (res.data.success && res.data.data) {
            const userData: UserProfile = res.data.data;

            setProfile({
              firstName: userData.first_name || account?.first_name || "",
              lastName: userData.last_name || account?.last_name || "",
              email: userData.email || account?.email || "",
              role: userData.role || account?.role || "USER",
            });
          } else {
            setProfile({
              firstName: account?.first_name || "",
              lastName: account?.last_name || "",
              email: account?.email || "",
              role: account?.role || "USER",
            });
          }
        } else {
          setProfile({
            firstName: account?.first_name || "",
            lastName: account?.last_name || "",
            email: account?.email || "",
            role: account?.role || "USER",
          });
        }

        if (rfidRes.status === "fulfilled") {
          const res = rfidRes.value;

          if (res.data.success && res.data.data) {
            const cardData: RfidCard = res.data.data;
            setRfidCard(cardData);
          } else {
            setRfidCard(null);
          }
        } else {
          setRfidCard(null);
        }
      } catch {
        toast.error("Không thể tải thông tin cá nhân");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [account]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profile.email) {
      toast.error("Không tìm thấy email người dùng");
      return;
    }

    try {
      setSaving(true);

      const res = await updateMyProfile(
        profile.firstName,
        profile.lastName
      );

      if (res.data.success && res.data.data) {
        const updatedUser: UserProfile = res.data.data;

        const nextAccount = {
          id: updatedUser.id || account?.id,
          email: updatedUser.email || profile.email,
          first_name: updatedUser.first_name || profile.firstName,
          last_name: updatedUser.last_name || profile.lastName,
          role: updatedUser.role || profile.role,
        };

        setProfile({
          firstName: nextAccount.first_name || "",
          lastName: nextAccount.last_name || "",
          email: nextAccount.email || "",
          role: nextAccount.role || "USER",
        });

        dispatch(setAccount(nextAccount));


        toast.success(res.data.message || "Cập nhật thông tin thành công");
      } else {
        toast.error(res.data.message || "Cập nhật thông tin thất bại");
      }
    } catch (error) {
      const err = error as ApiError;

      toast.error(
        err?.response?.data?.message || "Cập nhật thông tin thất bại"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="my-profile">
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="my-profile">
      <div className="my-profile__header">
        <h2>Thông tin cá nhân</h2>
        <p>Quản lý thông tin tài khoản và thẻ RFID của bạn.</p>
      </div>

      <div className="my-profile__content">
        <form className="my-profile__form" onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label>Email</label>
            <input value={profile.email} disabled />
          </div>

          <div className="form-group">
            <label>Vai trò</label>
            <input value={profile.role} disabled />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Họ</label>
              <input
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                placeholder="Nhập họ"
              />
            </div>

            <div className="form-group">
              <label>Tên</label>
              <input
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                placeholder="Nhập tên"
              />
            </div>
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : "Cập nhật thông tin"}
          </button>
        </form>

        <div className="my-profile__rfid">
          <h3>Thẻ RFID của tôi</h3>

          {rfidCard ? (
            <div className="rfid-card">
              <div className="rfid-card__row">
                <span>Mã thẻ</span>
                <strong>{rfidCard.cardUid}</strong>
              </div>

              <div className="rfid-card__row">
                <span>Chủ thẻ</span>
                <strong>{rfidCard.ownerName || "Chưa có"}</strong>
              </div>

              <div className="rfid-card__row">
                <span>Loại thẻ</span>
                <strong>
                  {rfidCard.status === "REGISTERED" ? "Đã đăng ký" : "Khách"}
                </strong>
              </div>

              <div className="rfid-card__row">
                <span>Trạng thái</span>
                <strong>
                  {rfidCard.isActive ? "Đã kích hoạt" : "Đã khóa"}
                </strong>
              </div>

              <div className="rfid-card__row">
                <span>Ngày đăng ký</span>
                <strong>{rfidCard.registeredAt || "Chưa có"}</strong>
              </div>
            </div>
          ) : (
            <div className="rfid-card rfid-card--empty">
              <p>Bạn chưa được gán thẻ RFID.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;