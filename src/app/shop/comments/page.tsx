"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Sidebar from "@/app/component/S-Sidebar";
import Topbar from "@/app/component/Topbar";
import styles from "./users.module.css";
import { useRouter } from "next/navigation";

interface Review {
  _id: string;
  user_id: {
    name: string;
    email?: string;
    avatar?: string;
  };
  product_id: {
    _id: string;
    name: string;
    images?: string[];
    image?: string;
    description?: string;
    shop_id?: string;
  } | null;
  shop_id?: string;
  rating: number;
  content: string;
  images: string[];
  createdAt: string;
  status?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://fiyo.click/api/";

const imgUrl = (src?: string) =>
  src ? (src.startsWith("http") ? src : `${API_BASE}images/${src}`) : "/placeholder-product.png";


export default function CommentsPage() {
  const router = useRouter();
  const [shopId, setShopId] = useState<string | null>(null);
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
      if (user.role !== 2) {
        router.push("/warning-login");
        return;
      }
    } catch (err) {
      router.push("/warning-login");
    }
  }, [router]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    (async () => {
      try {
        const user = JSON.parse(userStr);
        const userId = user?._id;
        if (!userId) return;

        const res = await fetch(`${API_BASE}shop/user/${userId}`, { cache: "no-store" });
        const data = await res.json();

        // Đúng cấu trúc trả về
        const id =
          data?.shop?._id   // ✅ trường hợp hiện tại
          ?? data?.shopId   // fallback nếu BE đổi
          ?? data?._id;     // fallback khác

        if (id) {
          setShopId(String(id));
          console.log("Shop ID:", id);
        } else {
          console.warn("Không tìm được shopId trong payload:", data);
        }
      } catch (err) {
        console.error("Lỗi lấy shopId:", err);
      }
    })();
  }, []);

  const handleToggleExpand = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (!shopId) return;

    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE}review`); // hoặc thêm limit nếu cần
        const data = await res.json();

        const all: Review[] = data.reviews || [];

        // Chỉ giữ review có shop_id trùng shop hiện tại
        const onlyMine = all.filter((r) => {
          const sid = r.shop_id || r.product_id?.shop_id; // ưu tiên top-level, fallback product
          return sid && String(sid) === String(shopId);
        });

        setReviews(onlyMine);
      } catch (err) {
        console.error("Lỗi khi fetch đánh giá:", err);
        setReviews([]);
      }
    };

    fetchReviews();
  }, [shopId]);


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
                        {c.user_id?.avatar ? (
                          <img
                            src={c.user_id.avatar}
                            alt={c.user_id?.name || "Người dùng"}
                            className={styles.avatar}
                            loading="lazy"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder-user.png"; }}
                          />
                        ) : (
                          <div className={styles.avatarFallback}>
                            {(() => {
                              const name = c.user_id?.name || "Khách";
                              return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
                            })()}
                          </div>
                        )}

                        <div className={styles.userMeta}>
                          <div className={styles.userName} title={c.user_id?.name || "Khách"}>
                            {c.user_id?.name || "Khách"}
                          </div>
                          {c.user_id?.email && (
                            <div className={styles.userEmail} title={c.user_id.email}>
                              {c.user_id.email}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </td>
                  <td className={styles.productInfo}>
                    <div className={styles.productBox}>
                      {c.product_id ? (
                        <>
                          <img
                            src={imgUrl(c.product_id.images?.[0] || c.product_id.image)}
                            alt={c.product_id.name}
                            className={styles.productThumb}
                            loading="lazy"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder-product.png"; }}
                          />
                          <div className={styles.productMeta}>
                            <div className={styles.productName} title={c.product_id.name}>
                              {c.product_id.name}
                            </div>
                            {c.product_id.description && (
                              <div className={styles.productDesc} title={c.product_id.description}>
                                {c.product_id.description}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className={styles.productMeta}>
                          <div className={styles.productName}><em>Sản phẩm không còn tồn tại</em></div>
                        </div>
                      )}
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
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {new Date(c.createdAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false, // 24h
                    })}
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
