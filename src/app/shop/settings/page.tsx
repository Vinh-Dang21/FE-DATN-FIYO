"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Store, ImagePlus, Phone, Mail } from "lucide-react";
import styles from "./settings.module.css";
import Sidebar from "@/app/component/S-Sidebar";
import Topbar from "@/app/component/Topbar";

/* ===== Consts ===== */
const DESC_MAX = 300;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://fiyo.click";

/* ===== Types ===== */
type Shop = {
  _id: string;
  name: string;
  phone: string;
  email: string;
  description: string;
  avatar?: string;
  address?: string;
  status?: "active" | "inactive" | "pending";
  updated_at?: string;
};

/* ===== Helpers ===== */
function getFallbackUserId(): string {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const u = JSON.parse(raw);
    return u?._id || u?.id || "";
  } catch {
    return "";
  }
}

/** Chuẩn hoá URL ảnh (logo) luôn dùng API_BASE */
function toAbsoluteImage(url?: string) {
  if (!url) return "";
  const fname = url.includes("/api/images/")
    ? url.split("/api/images/")[1]
    : (url.split("/").pop() || "");
  return `${API_BASE.replace(/\/$/, "")}/api/images/${encodeURIComponent(
    fname.replace(/^\/+/, "")
  )}`;
}

/** Bust cache để thấy ảnh mới ngay */
const bust = (url?: string, tag?: string | number) =>
  url ? `${url}${url.includes("?") ? "&" : "?"}v=${tag ?? Date.now()}` : "";

/* ===== Page ===== */
export default function Setting() {
  // UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Form
  const [shopId, setShopId] = useState<string>("");

  // Logo
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Fields
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [desc, setDesc] = useState("");

  // initial để check isDirty
  const initialRef = useRef<{
    logoPreview: string;
    shopName: string;
    phone: string;
    email: string;
    desc: string;
  } | null>(null);

  // Validators
  const phoneValid = /^0\d{9,10}$/.test(phone.trim());
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const nameValid = shopName.trim().length > 0;
  const descValid = desc.length <= DESC_MAX && desc.trim().length > 0;

  const isDirty = useMemo(() => {
    const init = initialRef.current;
    if (!init) return false;
    return (
      logoFile !== null ||
      logoPreview !== init.logoPreview ||
      shopName !== init.shopName ||
      phone !== init.phone ||
      email !== init.email ||
      desc !== init.desc
    );
  }, [logoFile, logoPreview, shopName, phone, email, desc]);

  const canSubmit =
    nameValid && phoneValid && emailValid && descValid && isDirty && !!shopId;

  // Pickers
  const validateImage = (file?: File) => {
    if (!file) return "Không có file.";
    if (!file.type.startsWith("image/")) return "File phải là hình ảnh.";
    if (file.size > MAX_IMAGE_BYTES) return "Ảnh quá lớn (tối đa 5MB).";
    return "";
  };

  const pickLogo = (file?: File) => {
    const msg = validateImage(file);
    if (msg) return setError(msg);
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  // Load shop
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const uid = getFallbackUserId();
        if (!uid) throw new Error("Không tìm thấy userId.");

        const res = await fetch(
          `${API_BASE}/api/shop/user/${uid}?t=${Date.now()}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`Lỗi tải shop: ${res.status}`);
        const data = await res.json();
        const shop: Shop = data?.shop || data;

        setShopId(shop._id);
        setShopName(shop.name || "");
        setPhone(shop.phone || "");
        setEmail(shop.email || "");
        setDesc(shop.description || "");

        setLogoPreview(toAbsoluteImage(shop.avatar) || "");

        setLogoFile(null);
        initialRef.current = {
          logoPreview: toAbsoluteImage(shop.avatar) || "",
          shopName: shop.name || "",
          phone: shop.phone || "",
          email: shop.email || "",
          desc: shop.description || "",
        };
      } catch (e: any) {
        setError(e?.message || "Không tải được thông tin shop.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Submit
  const handleSubmit = async () => {
    if (!canSubmit || !shopId) return;
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("name", shopName.trim());
      fd.append("phone", phone.trim());
      fd.append("email", email.trim());
      fd.append("description", desc.trim());
      if (logoFile) fd.append("avatar", logoFile);

      for (const [k, v] of fd.entries()) {
        console.log(
          "[FD]",
          k,
          v instanceof File ? `File(${v.name}, ${v.type}, ${v.size}B)` : v
        );
      }

      const res = await fetch(`${API_BASE}/api/shop/${shopId}`, {
        method: "PUT",
        body: fd,
      });
      if (!res.ok) throw new Error(`Cập nhật thất bại: ${res.status}`);

      const updated: Shop = await res.json();

      setShopName(updated.name || "");
      setPhone(updated.phone || "");
      setEmail(updated.email || "");
      setDesc(updated.description || "");
      setLogoPreview(toAbsoluteImage(updated.avatar) || "");
      setLogoFile(null);

      try {
        const re = await fetch(`${API_BASE}/api/shop/${shopId}?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (re.ok) {
          const fresh: Shop = await re.json();
          setLogoPreview(toAbsoluteImage(fresh.avatar) || "");
          initialRef.current = {
            logoPreview: toAbsoluteImage(fresh.avatar) || "",
            shopName: fresh.name || "",
            phone: fresh.phone || "",
            email: fresh.email || "",
            desc: fresh.description || "",
          };
        } else {
          initialRef.current = {
            logoPreview: toAbsoluteImage(updated.avatar) || "",
            shopName: updated.name || "",
            phone: updated.phone || "",
            email: updated.email || "",
            desc: updated.description || "",
          };
        }
      } catch {
        initialRef.current = {
          logoPreview: toAbsoluteImage(updated.avatar) || "",
          shopName: updated.name || "",
          phone: updated.phone || "",
          email: updated.email || "",
          desc: updated.description || "",
        };
      }

      setSuccess("Cập nhật cửa hàng thành công!");
      setTimeout(() => setSuccess(""), 2500);
    } catch (e: any) {
      setError(e?.message || "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  };

  // Render
  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <div className={styles.toolbarPad}>
          <Topbar />
        </div>

        <div className={styles.hero}>
          <div className={styles.heroIcon}><Store size={22} /></div>
          <div>
            <h2 className={styles.heroTitle}>Cài đặt cửa hàng</h2>
            <p className={styles.heroSub}>Quản lý thông tin cửa hàng của bạn</p>
          </div>
        </div>

        {!!success && (
          <div className={styles.successBanner}><span className={styles.dot} />{success}</div>
        )}
        {!!error && (
          <div className={styles.successBanner} style={{ background: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" }}>
            {error}
          </div>
        )}

        {/* Logo */}
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
                pickLogo(e.dataTransfer.files?.[0]);
              }}
            >
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => pickLogo(e.target.files?.[0])}
              />
              <ImagePlus size={18} />
              <span>Chọn logo hoặc kéo thả ảnh vào đây</span>
            </label>

            {logoPreview && (
              <button
                className={styles.ghostBtn}
                onClick={() => {
                  setLogoPreview("");
                  setLogoFile(null);
                }}
                type="button"
              >
                Gỡ logo
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <div className={styles.card}>
          <div className={styles.grid}>
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

            <div className={styles.actionBar}>
              <button
                className={`${styles.submitBtn} ${(!canSubmit || saving) ? styles.btnDisabled : ""}`}
                disabled={!canSubmit || saving}
                onClick={handleSubmit}
                type="button"
              >
                {saving ? "Đang lưu..." : "Cập nhật cửa hàng"}
              </button>
              <button
                className={styles.ghostBtn}
                type="button"
                onClick={() => {
                  const init = initialRef.current;
                  if (!init) return;
                  setLogoPreview(init.logoPreview);
                  setLogoFile(null);
                  setShopName(init.shopName);
                  setPhone(init.phone);
                  setEmail(init.email);
                  setDesc(init.desc);
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