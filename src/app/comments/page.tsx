"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";
import { useRouter } from "next/navigation";
import styles from "./users.module.css";

interface Review {
  _id: string;
  user_id: {
    name: string;
    email?: string;
    avatar?: string;
  };
  product_id: {
    name: string;
    image?: string;
  };
  rating: number;
  content: string;
  images: string[];
  createdAt: string;
  status?: string;
}

export default function CommentsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/warning-login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 0) {
        router.push("/warning-login");
        return;
      }
    } catch (err) {
      router.push("/warning-login");
    }
  }, [router]);

  const handleToggleExpand = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("https://fiyo.click/api/review");
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error("Lỗi khi fetch đánh giá:", err);
      }
    };

    fetchReviews();
  }, []);

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />

        <div className={styles.usertList}>
          <h2 className={styles.userListTitle}>Bảng Danh Sách Bình Luận</h2>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Sản phẩm</th>
                <th>Số sao</th>
                <th>Nội dung</th>
                <th>Hình ảnh</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((c) => (
                <tr key={c._id}>
                  <td className={styles.userInfo}>
                    <div className={styles.userBox}>
                      <div className={styles.userDetails}>
                        <div className={styles.userName}>{c.user_id?.name}</div>
                        <div className={styles.userDesc}>{c.user_id?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.productInfo}>
                    <div className={styles.productBox}>
                      <span className={styles.productName}>{c.product_id?.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.stars}>
                      {"★".repeat(c.rating)}
                      {"☆".repeat(5 - c.rating)}
                    </span>
                  </td>
                  <td className={styles.commentContent}>
                    {expandedRows.includes(c._id) ? (
                      <>
                        {c.content}
                        {c.content.length > 62 && (
                          <button
                            className={styles.seeMoreBtn}
                            onClick={() => handleToggleExpand(c._id)}
                          >
                            Thu gọn
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {c.content.length > 62
                          ? c.content.slice(0, 62) + "..."
                          : c.content}
                        {c.content.length > 62 && (
                          <button
                            className={styles.seeMoreBtn}
                            onClick={() => handleToggleExpand(c._id)}
                          >
                            Xem thêm
                          </button>
                        )}
                      </>
                    )}
                  </td>
                  <td>
                    {c.images?.[0] ? (
                      <img
                        src={c.images[0]}
                        className={styles.productImage}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
