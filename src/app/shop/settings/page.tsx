"use client";
import { useMemo, useState } from "react";
import { Store, ImagePlus, Phone, Mail } from "lucide-react";
import styles from "./settings.module.css";
import Sidebar from "@/app/component/S-Sidebar";
import Topbar from "@/app/component/Topbar";

const DESC_MAX = 300;

export default function Setting() {
  // state demo
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [shopName, setShopName] = useState("Thời Trang Sành Điệu");
  const [phone, setPhone] = useState("0909123456");
  const [email, setEmail] = useState("baotruong1082003@gmail.com");
  const [desc, setDesc] = useState("Cửa hàng thời trang hiện đại và phong cách.");
  const [success, setSuccess] = useState<string>("");

  // để hoàn tác
  const initial = useMemo(
    () => ({
      logoPreview: "",
      shopName: "Thời Trang Sành Điệu",
      phone: "0909123456",
      email: "baotruong1082003@gmail.com",
      desc: "Cửa hàng thời trang hiện đại và phong cách.",
    }),
    []
  );

  // validate cơ bản
  const phoneValid = /^0\d{9,10}$/.test(phone.trim());
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const nameValid = shopName.trim().length > 0;
  const descValid = desc.length <= DESC_MAX && desc.trim().length > 0;

  const isDirty =
    logoPreview !== initial.logoPreview ||
    shopName !== initial.shopName ||
    phone !== initial.phone ||
    email !== initial.email ||
    desc !== initial.desc;

  const canSubmit = nameValid && phoneValid && emailValid && descValid && isDirty;

  const pickFile = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    // demo layout
    setSuccess("Cập nhật cửa hàng thành công!");
    setTimeout(() => setSuccess(""), 2500);
  };

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        {/* CHỈ căn lề cho Topbar, KHÔNG đổi ô tìm kiếm cũ */}
        <div className={styles.toolbarPad}>
          <Topbar />
        </div>

        {/* Header gradient */}
        <div className={styles.hero}>
          <div className={styles.heroIcon}><Store size={22} /></div>
          <div>
            <h2 className={styles.heroTitle}>Cài đặt cửa hàng</h2>
            <p className={styles.heroSub}>Quản lý thông tin cửa hàng của bạn</p>
          </div>
        </div>

        {success && (
          <div className={styles.successBanner}>
            <span className={styles.dot} /> {success}
          </div>
        )}

        {/* Card: Logo */}
        <div className={styles.card}>
          <div className={styles.cardHead}>Logo cửa hàng</div>
          <div className={styles.logoRow}>
            <div className={styles.logoCircle}>
              {logoPreview ? <img src={logoPreview} alt="logo" /> : <span className={styles.logoEmoji}>🦊</span>}
            </div>

            <label
              className={styles.dropZone}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pickFile(e.dataTransfer.files?.[0]);
              }}
            >
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
              <ImagePlus size={18} />
              <span>Chọn logo hoặc kéo thả ảnh vào đây</span>
            </label>

            {logoPreview && (
              <button className={styles.ghostBtn} onClick={() => setLogoPreview("")} type="button">
                Gỡ logo
              </button>
            )}
          </div>
        </div>

        {/* Card: Form */}
        <div className={styles.card}>
          <div className={styles.grid}>
            {/* Tên cửa hàng */}
            <div className={styles.group}>
              <label className={styles.label}>
                <span className={styles.required}>*</span> Tên cửa hàng
              </label>
              <div className={styles.inputWrap}>
                <input
                  type="text"
                  className={`${styles.input} ${!nameValid ? styles.invalid : ""}`}
                  placeholder="Nhập tên cửa hàng"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                />
              </div>
            </div>

            {/* Phone + Email */}
            <div className={styles.row2}>
              <div className={styles.group}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span> Số điện thoại
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.leftIcon}><Phone size={16} /></span>
                  <input
                    type="text"
                    className={`${styles.input} ${styles.withIcon} ${!phoneValid ? styles.invalid : ""}`}
                    placeholder="Ví dụ: 0909xxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                {!phoneValid && <div className={styles.hint}>Số điện thoại không hợp lệ (10–11 số, bắt đầu bằng 0).</div>}
              </div>

              <div className={styles.group}>
                <label className={styles.label}>
                  <span className={styles.required}>*</span> Email
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.leftIcon}><Mail size={16} /></span>
                  <input
                    type="email"
                    className={`${styles.input} ${styles.withIcon} ${!emailValid ? styles.invalid : ""}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {!emailValid && <div className={styles.hint}>Email không hợp lệ.</div>}
              </div>
            </div>

            {/* Mô tả */}
            <div className={styles.group}>
              <label className={styles.label}>
                <span className={styles.required}>*</span> Mô tả cửa hàng
              </label>
              <div className={styles.inputWrap}>
                <textarea
                  className={`${styles.input} ${styles.textarea} ${!descValid ? styles.invalid : ""}`}
                  rows={5}
                  placeholder="Mô tả ngắn gọn về cửa hàng…"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
                <div className={styles.counter}>{desc.length}/{DESC_MAX}</div>
              </div>
              {!descValid && <div className={styles.hint}>Tối đa {DESC_MAX} ký tự và không được để trống.</div>}
            </div>

            {/* Actions */}
            <div className={styles.actionBar}>
              <button
                className={`${styles.submitBtn} ${!canSubmit ? styles.btnDisabled : ""}`}
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                Cập nhật cửa hàng
              </button>
              <button
                className={styles.ghostBtn}
                type="button"
                onClick={() => {
                  setLogoPreview(initial.logoPreview);
                  setShopName(initial.shopName);
                  setPhone(initial.phone);
                  setEmail(initial.email);
                  setDesc(initial.desc);
                }}
              >
                Hoàn tác
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
