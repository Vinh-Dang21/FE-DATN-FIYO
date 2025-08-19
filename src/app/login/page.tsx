"use client";

import { useState } from "react";

export default function LoginTest() {
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
        // Lưu token và user
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setMsg("✅ Đăng nhập thành công!");
        // chuyển sang trang test (hoặc dashboard)
        setTimeout(() => {
          window.location.href = "http://localhost:3000/dashboard";
        }, 1000);
      } else {
        setMsg("❌ " + (data.message || "Sai email hoặc mật khẩu"));
      }
    } catch (err) {
      setMsg("⚠️ Lỗi kết nối server");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", textAlign: "center" }}>
      <h2>Login Test</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", width: "100%", margin: "8px 0", padding: 8 }}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", width: "100%", margin: "8px 0", padding: 8 }}
        />
        <button type="submit" style={{ padding: "8px 16px", marginTop: 8 }}>
          Đăng nhập
        </button>
      </form>
      {msg && <p style={{ marginTop: 16 }}>{msg}</p>}
    </div>
  );
}
