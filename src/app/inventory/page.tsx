"use client";
import { useEffect, useState } from "react";
import styles from "./inventory.module.css";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";

interface Product {
  name: string;
  images?: string[];
  image?: string;
  sale_count: number;
  price?: number;
  total_quantity?: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState("week");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(
          `https://fiyo.click/api/products/reports/least-sold?timePeriod=${timePeriod}`,
          { method: "GET" }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        if (data && Array.isArray(data.result)) {
          setProducts(data.result);
        } else {
          console.error("Unexpected API format:", data);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [timePeriod]);

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />

        {/* Khu vực tìm kiếm và lọc - đồng bộ với trang danh mục */}
        <div className={styles.searchProduct}>
          <div className={styles.spaceBetween}>
            <h2 className={styles.userListTitle}> Hàng Tồn kho </h2>
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
          <p>Loading...</p>
        ) : (
          <div className={styles.usertList}>
            <table className={styles.cateTable}>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Giá</th>
                  <th>Số lượng đã bán</th>
                  <th>Số lượng tồn kho</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={index}>
                    <td>
                      <div className={styles.productInfo}>
                        <img
                          src={
                            Array.isArray(product.images)
                              ? product.images[0]
                              : product.image
                          }
                          alt={product.name}
                          className={styles.productImage}
                        />
                        <span className={styles.productName}>
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      {product.price
                        ? `${product.price.toLocaleString()}₫`
                        : "N/A"}
                    </td>
                    <td>{product.sale_count}</td>
                    <td>{product.total_quantity ?? 1}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </section>
    </main>
  );
}