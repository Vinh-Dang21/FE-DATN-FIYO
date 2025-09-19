"use client";
import { AlertTriangle } from "lucide-react";
import styles from "./WL.module.css";
import { useRouter } from "next/navigation";

export default function WloginPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <main className={styles.main}>
      <div className={styles.box}>
        <AlertTriangle className={styles.icon} />
        <h1 className={styles.title}>Bạn không có quyền truy cập!</h1>
        <p className={styles.desc}>
          Tài khoản của bạn không phải là admin hoặc shop.<br />
          Vui lòng đăng nhập lại bằng tài khoản hợp lệ.
        </p>
        <button onClick={handleLogout} className={styles.button}>
          Đăng nhập 
        </button>
      </div>
    </main>
  );
}
