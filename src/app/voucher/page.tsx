"use client";
import {
  Pencil,
  Trash2,
} from "lucide-react";
import styles from "./voucher.module.css";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";

import { useState, useEffect } from "react";

export default function Voucher() {
  const [vouchers, setVouchers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editVoucher, setEditVoucher] = useState(null);
  const [form, setForm] = useState({
    voucher_code: "",
    min_total: "",
    max_total: "",
    quantity: "",
    expired_at: "",
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
      });
      fetchVouchers();
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  const handleUpdateVoucher = async () => {
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
      });
      fetchVouchers();
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xoá voucher này không?")) return;
    try {
      const res = await fetch(`http://localhost:3000/voucher/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchVouchers();
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
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
      alert("Lỗi: " + error.message);
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
                          min_total: v.min_total,
                          max_total: v.max_total,
                          quantity: v.quantity,
                          expired_at: v.expired_at?.split("T")[0],
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
