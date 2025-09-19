"use client";
import { useEffect, useMemo, useState } from "react";
import styles from "./inventory.module.css";
import Sidebar from "@/app/component/S-Sidebar";
import Topbar from "@/app/component/Topbar";
import { useRouter } from "next/navigation";

interface Product {
  _id?: string;
  name: string;
  images?: string[];
  image?: string;
  sale_count: number;
  price?: number;
  total_quantity?: number;
  shop_id?: string | { _id?: string };
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://fiyo-be.onrender.com/api/";
const PLACEHOLDER_IMG =
  "https://via.placeholder.com/64x64?text=No+Img";

export default function InventoryPage() {
  const router = useRouter();
  const [shopId, setShopId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "year">("week");
  const [error, setError] = useState<string>("");

  // ---- check login & try to infer shopId
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

  // ---- fetch data (works with or without shop_id)
  useEffect(() => {
    let abort = false;

    async function fetchProducts() {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token") || "";

        const url = new URL(`${API_BASE}products/reports/least-sold`);
        url.searchParams.set("timePeriod", timePeriod);
        if (shopId) url.searchParams.set("shop_id", shopId); // chỉ gắn khi có

        const res = await fetch(url.toString(), {
          method: "GET",
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();

        const list: Product[] = Array.isArray(data?.result) ? data.result : [];

        // nếu BE chưa lọc theo shop, lọc FE theo p.shop_id
        const filtered = shopId
          ? list.filter((p) => {
            const sid =
              typeof p.shop_id === "string" ? p.shop_id : p.shop_id?._id;
            return !sid || sid === shopId;
          })
          : list;

        // sort tăng dần theo sale_count
        const sorted = filtered
          .slice()
          .sort((a, b) => (a.sale_count ?? 0) - (b.sale_count ?? 0));

        if (!abort) setProducts(sorted);
      } catch (e: any) {
        if (!abort) {
          setError(e?.message || "Không lấy được báo cáo tồn kho.");
          setProducts([]);
        }
      } finally {
        if (!abort) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      abort = true;
    };
  }, [timePeriod, shopId]);

  const getImage = (p: Product) =>
    (Array.isArray(p.images) && p.images[0]) || p.image || PLACEHOLDER_IMG;

  const prettyProducts = useMemo(() => products, [products]);

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />

        <div className={styles.searchProduct}>
          <div className={styles.spaceBetween}>
            <h2 className={styles.userListTitle}>Hàng Tồn kho</h2>
            <div className={styles.filterButtons}>
              <button
                onClick={() => setTimePeriod("week")}
                className={timePeriod === "week" ? styles.active : ""}
              >
                Tuần
              </button>
              <button
                onClick={() => setTimePeriod("month")}
                className={timePeriod === "month" ? styles.active : ""}
              >
                Tháng
              </button>
              <button
                onClick={() => setTimePeriod("year")}
                className={timePeriod === "year" ? styles.active : ""}
              >
                Năm
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <div className={styles.errorBanner}>{error}</div>
        ) : (
          <div className={styles.usertList}>
            <table className={styles.cateTable}>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Giá</th>
                  <th>Đã bán</th>
                  <th>Tồn kho</th>
                </tr>
              </thead>
              <tbody>
                {prettyProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: 24 }}>
                      Không có dữ liệu cho khoảng thời gian đã chọn.
                    </td>
                  </tr>
                ) : (
                  prettyProducts.map((product, index) => (
                    <tr key={product._id || index}>
                      <td>
                        <div className={styles.productInfo}>
                          <img
                            src={getImage(product)}
                            alt={product.name}
                            className={styles.productImage}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG;
                            }}
                          />
                          <span className={styles.productName}>{product.name}</span>
                        </div>
                      </td>
                      <td>
                        {typeof product.price === "number"
                          ? `${product.price.toLocaleString()}₫`
                          : "N/A"}
                      </td>
                      <td>{product.sale_count ?? 0}</td>
                      <td>{product.total_quantity ?? 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
