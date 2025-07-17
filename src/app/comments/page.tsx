"use client";
import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";
import styles from "./users.module.css";
export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const query = new URLSearchParams({
          keyword: search,
          page: page.toString(),
          limit: pageSize.toString(),
        });

        const res = await fetch(`/review/search?${query.toString()}`);
        const data = await res.json();

        setReviews(data.data || []);
        setTotalPages(Math.ceil((data.total || 0) / pageSize));
      } catch (err) {
        console.error("Lỗi khi tải đánh giá:", err);
      }
    };

    fetchReviews();
  }, [search, page, pageSize]);

  return (
    <div className={styles.main}>
      <div className={styles.aside}>
        <Sidebar />
      </div>
      <div className={styles.content}>
        <Topbar />
        <div className={styles.body}>
          <div className={styles.header_table}>
            <div className={styles.search_wrapper}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm đánh giá..."
                className={styles.input_search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.table_wrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Người đánh giá</th>
                  <th>Sản phẩm</th>
                  <th>Nội dung</th>
                  <th>Sao</th>
                  <th>Hình ảnh</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((c, index) => (
                  <tr key={c._id}>
                    <td>{(page - 1) * pageSize + index + 1}</td>
                    <td>{c.user_id?.name || "(Ẩn danh)"}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <img
                          src={c.productdetail_id?.product_image || "/placeholder.png"}
                          alt={c.productdetail_id?.product_name || "No name"}
                          className={styles.productImage}
                        />
                        <span>{c.productdetail_id?.product_name || "Không rõ"}</span>
                      </div>
                    </td>
                    <td>{c.content}</td>
                    <td>{c.rating}</td>
                    <td>
                      {c.images && c.images.length > 0 && (
                        <img
                          src={c.images[0]}
                          alt="Hình đánh giá"
                          style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
                        />
                      )}
                    </td>
                    <td>{new Date(c.createdAt).toLocaleString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Trang trước
                </button>
                <span>
                  Trang {page}/{totalPages}
                </span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  Trang sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
