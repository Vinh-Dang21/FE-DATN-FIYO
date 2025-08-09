"use client";
import {
  Pencil,
  Trash2,
} from "lucide-react";
import styles from "./voucher.module.css";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";

import { useState, useEffect } from "react";

interface Voucher {
  _id: string;
  voucher_code: string;
  min_total: number;
  max_total: number;
  quantity: number;
  expired_at: string;
  target_rank?: string;
  is_active: boolean;
}

interface VoucherForm {
  voucher_code: string;
  min_total: string;  // nếu để input number thì vẫn trả ra string
  max_total: string;
  quantity: string;
  expired_at: string;
  target_rank: string;
}


export default function Voucher() {
  const [showAdd, setShowAdd] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [editVoucher, setEditVoucher] = useState<Voucher | null>(null);
  const [form, setForm] = useState<VoucherForm>({
    voucher_code: "",
    min_total: "",
    max_total: "",
    quantity: "",
    expired_at: "",
    target_rank: "",
  });


  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const url = search.trim()
        ? `http://localhost:3000/voucher/search?keyword=${search}`
        : "http://localhost:3000/voucher";
      const res = await fetch(url);
      const data = await res.json();
      setVouchers(data.vouchers);
    } catch (error) {
      console.error("Lỗi khi fetch voucher:", error);
    }
  };

  const handleAddVoucher = async () => {
    try {
      const payload = {
        ...form,
        value: 1,
        is_active: true,
      };

      const res = await fetch("http://localhost:3000/voucher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Thêm thất bại");

      alert("Thêm voucher thành công");
      setShowAdd(false);
      setForm({
        voucher_code: "",
        min_total: "",
        max_total: "",
        quantity: "",
        expired_at: "",
        target_rank: "",
      });
      fetchVouchers();
    } catch (error) {
      if (error instanceof Error) {
        alert("Lỗi: " + error.message);
      } else {
        alert("Lỗi không xác định");
      }
    }

  };

  const handleUpdateVoucher = async () => {
    if (!editVoucher) {
      alert("Không có voucher để cập nhật");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/voucher/${editVoucher._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert("Cập nhật thành công");
      setEditVoucher(null);
      setShowAdd(false);
      setForm({
        voucher_code: "",
        min_total: "",
        max_total: "",
        quantity: "",
        expired_at: "",
        target_rank: "",
      });
      fetchVouchers();
    } catch (error) {
      if (error instanceof Error) {
        alert("Lỗi: " + error.message);
      } else {
        alert("Lỗi không xác định");
      }
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá voucher này không?")) return;
    try {
      const res = await fetch(`http://localhost:3000/voucher/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchVouchers();
    } catch (error) {
      if (error instanceof Error) {
        alert("Lỗi: " + error.message);
      } else {
        alert("Lỗi không xác định");
      }
    }

  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`http://localhost:3000/voucher/status/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchVouchers();
    } catch (error) {
      if (error instanceof Error) {
        alert("Lỗi: " + error.message);
      } else {
        alert("Lỗi không xác định");
      }
    }
  };

  const handleSearch = () => {
    fetchVouchers();
  };

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />
        <div className={styles.searchProduct}>
          <div className={styles.searchAddBar}>
            <div className={styles.spaceBetween}>
              <input
                type="text"
                placeholder="Tìm kiếm ..."
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                className={styles.addButton}
                onClick={() => {
                  setShowAdd(true);
                  setEditVoucher(null);
                  setForm({
                    voucher_code: "",
                    min_total: "",
                    max_total: "",
                    quantity: "",
                    expired_at: "",
                    target_rank: "",
                  });
                }}>
                + Thêm mã giảm giá
              </button>
            </div>
          </div>
        </div>
        {showAdd && (
          <div className={styles.addAside}>
            <h2 className={styles.addAsideTitle}>{editVoucher ? "Cập nhật Voucher" : "Thêm Voucher"}</h2>
            <input
              className={styles.input}
              type="text"
              placeholder="Mã voucher"
              value={form.voucher_code}
              onChange={(e) => setForm({ ...form, voucher_code: e.target.value })}
            />
            <input
              className={styles.input}
              type="number"
              placeholder="Giá trị đơn hàng tối thiểu"
              value={form.min_total}
              onChange={(e) => setForm({ ...form, min_total: e.target.value })}
            />
            <input
              className={styles.input}
              type="number"
              placeholder="Giảm giá tối đa"
              value={form.max_total}
              onChange={(e) => setForm({ ...form, max_total: e.target.value })}
            />
            <input
              className={styles.input}
              type="number"
              placeholder="Số lượng"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
            <div className={styles.dateRow}>
              <label className={styles.label}>Ngày hết hạn</label>
              <input
                className={styles.input}
                type="date"
                value={form.expired_at}
                onChange={(e) => setForm({ ...form, expired_at: e.target.value })}
              />
            </div>
            <div className={styles.dateRow}>
              <label className={styles.label}>Rank áp dụng</label>
              <select
                className={styles.input}
                value={form.target_rank}
                onChange={(e) => setForm({ ...form, target_rank: e.target.value })}
              >
                <option value="">-- Chọn rank --</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>


            <button
              className={styles.addButton}
              onClick={editVoucher ? handleUpdateVoucher : handleAddVoucher}>
              {editVoucher ? "Cập nhật" : "Thêm voucher"}
            </button>
            <button
              className={styles.closeBtn}
              onClick={() => {
                setShowAdd(false);
                setEditVoucher(null);
                setForm({
                  voucher_code: "",
                  min_total: "",
                  max_total: "",
                  quantity: "",
                  expired_at: "",
                  target_rank: "",
                });
              }}
              style={{ marginTop: 10 }}>
              Đóng
            </button>
          </div>
        )}
        <div className={styles.usertList}>
          <h2 className={styles.userListTitle}>Bảng Danh Sách Voucher</h2>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã giảm giá</th>
                <th>Đơn hàng tối thiểu</th>
                <th>Giảm giá tối đa</th>
                <th>Số lượng</th>
                <th>Trạng thái</th>
                <th>Hết hạn</th>
                <th>Chức năng</th>
              </tr>
            </thead>

            <tbody>
              {Array.isArray(vouchers) && vouchers.map((v, index) => (
                <tr key={v._id}>
                  <td>{index + 1}</td>
                  <td>{v.voucher_code}</td>
                  <td>{v.min_total?.toLocaleString()}đ</td>
                  <td>{v.max_total?.toLocaleString()}đ</td>
                  <td>{v.quantity}</td>
                  <td>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={v.is_active}
                        onChange={() => handleToggleStatus(v._id, v.is_active)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </td>
                  <td>{v.expired_at?.split("T")[0]}</td>
                  <td>
                    <button
                      className={styles.actionBtn}
                      title="Sửa"
                      onClick={() => {
                        setShowAdd(true);
                        setEditVoucher(v);
                        setForm({
                          voucher_code: v.voucher_code,
                          min_total: String(v.min_total),
                          max_total: String(v.max_total),
                          quantity: String(v.quantity),
                          expired_at: v.expired_at?.split("T")[0],
                          target_rank: v.target_rank || "",
                        });


                      }}>
                      <Pencil size={18} />
                    </button>
                    <button
                      className={styles.actionBtn}
                      title="Xóa"
                      onClick={() => handleDelete(v._id)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </section>
    </main>
  );
}
