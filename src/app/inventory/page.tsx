"use client";
import { useEffect, useState } from "react";
import styles from "./inventory.module.css";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";

interface Product {
    product_id: string;
    name: string;
    images?: string[]; // nếu là mảng
    image?: string; // fallback nếu backend chỉ có 1 ảnh
    sale_count: number;
}

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [timePeriod, setTimePeriod] = useState("week");

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch(`http://localhost:3000/products/reports/least-sold?timePeriod=${timePeriod}`, {
                    method: "GET",
                });
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
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.content}>
                <Topbar />
                <h1 className={styles.title}>Tồn kho - Top bán ít</h1>

                <div className={styles.filterButtons}>
                    <button onClick={() => setTimePeriod("week")} className={timePeriod === "week" ? styles.active : ""}>Tuần</button>
                    <button onClick={() => setTimePeriod("month")} className={timePeriod === "month" ? styles.active : ""}>Tháng</button>
                    <button onClick={() => setTimePeriod("year")} className={timePeriod === "year" ? styles.active : ""}>Năm</button>
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className={styles.productList}>
                        {products.map((product) => (
                            <div key={product.product_id} className={styles.productCard}>
                                <img
                                    src={Array.isArray(product.images) ? product.images[0] : product.image}
                                    alt={product.name}
                                    className={styles.productImage}
                                />
                                <h2 className={styles.productName}>{product.name}</h2>
                                <p className={styles.productSaleCount}>Số lượng bán: {product.sale_count}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
