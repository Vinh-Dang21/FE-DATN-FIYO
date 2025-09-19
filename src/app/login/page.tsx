"use client";

import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("https://fiyo.click/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.status) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setMsg("✅ Đăng nhập thành công!");

        const role = data.user.role;
        let redirectUrl = "/login";
        if (role === 0) redirectUrl = "/dashboard";
        if (role === 2) redirectUrl = "/shop/dashboard";
        if (role === 1) redirectUrl = "/";

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
      } else {
        setMsg("❌ " + (data.message || "Sai email hoặc mật khẩu"));
      }
    } catch (err) {
      setMsg("⚠️ Lỗi kết nối server");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Đăng nhập</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>
            Đăng nhập
          </button>
        </form>
        {msg && <p style={styles.msg}>{msg}</p>}
      </div>
    </div>
  );
}

/* ===== CSS inline style ===== */
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff", // nền trắng
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: "32px",
    borderRadius: "12px",
    background: "#fff",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    textAlign: "center",
    fontFamily: "sans-serif",
  },
  title: {
    marginBottom: 20,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  button: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#ff4d4f",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
  },
  msg: {
    marginTop: 16,
    fontSize: 14,
    color: "#333",
  },
};
