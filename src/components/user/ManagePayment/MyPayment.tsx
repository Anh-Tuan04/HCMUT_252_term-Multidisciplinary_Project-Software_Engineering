import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "react-toastify";

import {
  getMyWallet,
  createPayment,
  getTransactionHistory,
} from "../../../services/apiServices";

import "./MyPayment.scss";

type WalletInfo = {
  money?: number;
  balance?: number;
};

type WalletTransaction = {
  id: number;
  userId?: number;
  type: "DEPOSIT" | "DEDUCT";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELED";
  orderCode?: number;
  transactionId?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
};

type WalletCursor = {
  createdAt: string;
  id: number;
};

type TransactionResponse = {
  data: WalletTransaction[];
  nextCursor: WalletCursor | null;
  hasNextPage: boolean;
};

type TransactionGroup = {
  dateKey: string;
  dateLabel: string;
  items: WalletTransaction[];
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const formatMoney = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value) + " VND";
};

const getStatusText = (status: WalletTransaction["status"]) => {
  switch (status) {
    case "PENDING":
      return "Đang chờ";
    case "SUCCESS":
      return "Thành công";
    case "FAILED":
      return "Thất bại";
    case "CANCELED":
      return "Đã hủy";
    default:
      return status;
  }
};

const getTypeText = (type: WalletTransaction["type"]) => {
  switch (type) {
    case "DEPOSIT":
      return "Nạp tiền";
    case "DEDUCT":
      return "Trừ tiền";
    default:
      return type;
  }
};

const getDateKey = (dateString: string) => {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}-${month}-${day}`;
};

const getDateLabel = (dateString: string) => {
  const date = new Date(dateString);

  return `Ngày ${date.getDate()} tháng ${date.getMonth() + 1}`;
};

const getTimeLabel = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const isBadStatus = (status: WalletTransaction["status"]) => {
  return status === "FAILED" || status === "CANCELED";
};

const getTransactionClassName = (item: WalletTransaction) => {
  return [
    "wallet-transaction",
    `wallet-transaction--${item.status.toLowerCase()}`,
  ].join(" ");
};

const getAmountClassName = (item: WalletTransaction) => {
  const classes = ["wallet-transaction__amount"];

  if (item.type === "DEPOSIT") {
    classes.push("wallet-transaction__amount--plus");
  } else {
    classes.push("wallet-transaction__amount--minus");
  }

  if (item.status === "PENDING") {
    classes.push("wallet-transaction__amount--pending");
  }

  if (isBadStatus(item.status)) {
    classes.push("wallet-transaction__amount--bad");
  }

  return classes.join(" ");
};

const MyPayment = () => {
  const [walletMoney, setWalletMoney] = useState(0);
  const [amount, setAmount] = useState("");

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [nextCursor, setNextCursor] = useState<WalletCursor | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const groupedTransactions = useMemo<TransactionGroup[]>(() => {
    const groups = new Map<string, TransactionGroup>();

    transactions.forEach((item) => {
      const dateKey = getDateKey(item.createdAt);

      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          dateKey,
          dateLabel: getDateLabel(item.createdAt),
          items: [],
        });
      }

      groups.get(dateKey)?.items.push(item);
    });

    return Array.from(groups.values());
  }, [transactions]);

  const loadWallet = async () => {
    try {
      const res = await getMyWallet();

      if (res.data.success && res.data.data) {
        const wallet: WalletInfo = res.data.data;

        setWalletMoney(wallet.money ?? wallet.balance ?? 0);
      }
    } catch {
      toast.error("Không thể tải thông tin ví");
    }
  };

  const loadTransactions = async (
    isLoadMore = false,
    cursor?: WalletCursor | null
  ) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      }

      const res = await getTransactionHistory(20, cursor || undefined);

      if (res.data.success && res.data.data) {
        const payload: TransactionResponse = res.data.data;

        setTransactions((prev) =>
          isLoadMore ? [...prev, ...payload.data] : payload.data
        );

        setNextCursor(payload.nextCursor);
        setHasNextPage(payload.hasNextPage);
      }
    } catch {
      toast.error("Không thể tải lịch sử giao dịch");
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        await Promise.all([loadWallet(), loadTransactions(false)]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreatePayment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const depositAmount = Number(amount);

    if (!depositAmount || depositAmount < 1000) {
      toast.error("Số tiền nạp tối thiểu là 1.000 VND");
      return;
    }

    try {
      setCreatingPayment(true);

      const res = await createPayment(depositAmount);

      if (res.data.success && res.data.data?.paymentUrl) {
        toast.success(res.data.message || "Tạo link thanh toán thành công");

        window.location.href = res.data.data.paymentUrl;
        return;
      }

      toast.error(res.data.message || "Không thể tạo link thanh toán");
    } catch (error) {
      const err = error as ApiError;

      toast.error(
        err?.response?.data?.message || "Tạo link thanh toán thất bại"
      );
    } finally {
      setCreatingPayment(false);
    }
  };

  const handleLoadMore = () => {
    if (!nextCursor || loadingMore) return;

    loadTransactions(true, nextCursor);
  };

  if (loading) {
    return (
      <div className="my-wallet">
        <p>Đang tải thông tin ví...</p>
      </div>
    );
  }

  return (
    <div className="my-wallet">
      <div className="my-wallet__header">
        <h2>Ví của tôi</h2>
        <p>Quản lý số dư, nạp tiền và xem lịch sử giao dịch ví.</p>
      </div>

      <div className="my-wallet__content">
        <div className="my-wallet__form">
          <div className="wallet-balance-card">
            <span>Số dư hiện tại</span>
            <strong>{formatMoney(walletMoney)}</strong>
          </div>

          <form onSubmit={handleCreatePayment}>
            <div className="form-group">
              <label>Số tiền muốn nạp</label>
              <input
                type="number"
                min={1000}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Nhập số tiền, ví dụ 50000"
              />
            </div>

            <button type="submit" disabled={creatingPayment}>
              {creatingPayment ? "Đang tạo thanh toán..." : "Nạp tiền"}
            </button>
          </form>
        </div>

        <div className="my-wallet__history">
          <h3>Lịch sử giao dịch</h3>

          {transactions.length === 0 ? (
            <div className="history history--empty">
              <p>Chưa có giao dịch nào.</p>
            </div>
          ) : (
            <div className="wallet-transaction-list">
              {groupedTransactions.map((group) => (
                <div className="wallet-transaction-group" key={group.dateKey}>
                  <div className="wallet-transaction-group__date">
                    {group.dateLabel}
                  </div>

                  <div className="wallet-transaction-group__items">
                    {group.items.map((item) => (
                      <div
                        className={getTransactionClassName(item)}
                        key={item.id}
                      >
                        <div className="wallet-transaction__top">
                          <div className="wallet-transaction__main">
                            <strong>{getTypeText(item.type)}</strong>
                            <span>{getTimeLabel(item.createdAt)}</span>
                          </div>

                          <b className={getAmountClassName(item)}>
                            {item.type === "DEPOSIT" ? "+" : "-"}
                            {formatMoney(item.amount)}
                          </b>
                        </div>

                        <div className="wallet-transaction__meta">
                          <span
                            className={`wallet-transaction__status wallet-transaction__status--${item.status.toLowerCase()}`}
                          >
                            {getStatusText(item.status)}
                          </span>

                          {item.transactionId && (
                            <span className="wallet-transaction__meta-item">
                              <span className="wallet-transaction__meta-label">
                                Mã giao dịch
                              </span>
                              <span className="wallet-transaction__meta-value">
                                {item.transactionId}
                              </span>
                            </span>
                          )}

                          {item.orderCode && (
                            <span className="wallet-transaction__meta-item">
                              <span className="wallet-transaction__meta-label">
                                Mã PayOS
                              </span>
                              <span className="wallet-transaction__meta-value">
                                {item.orderCode}
                              </span>
                            </span>
                          )}

                          {typeof item.balanceAfter === "number" &&
                            item.status === "SUCCESS" && (
                              <span className="wallet-transaction__meta-item wallet-transaction__meta-item--balance">
                                <span className="wallet-transaction__meta-label">
                                  Số dư cuối
                                </span>
                                <span className="wallet-transaction__meta-value">
                                  {formatMoney(item.balanceAfter)}
                                </span>
                              </span>
                            )}

                          {item.description && (
                            <span className="wallet-transaction__description">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {hasNextPage && (
                <button
                  className="wallet-load-more"
                  type="button"
                  disabled={loadingMore}
                  onClick={handleLoadMore}
                >
                  {loadingMore ? "Đang tải..." : "Tải thêm"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPayment;