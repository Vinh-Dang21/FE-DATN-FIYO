"use client";
import { useEffect, useState } from "react";
import styles from "./stockentry.module.css";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";

interface Variant {
  color: string;
  sizes: {
    size: string;
    quantity: number;
    sku?: string;
  }[];
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  type?: string;
}
interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  sale: number;
  material: string;
  shop_id: number;
  create_at: string;
  description: string;
  sale_count?: number;
  isHidden: boolean;
  category_id: {
    categoryName: string;
    categoryId: string;
  };
  variants: Variant[];
}

export default function InventoryPage() {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [noProduct, setNoProduct] = useState(false);
  const [stockFilter, setStockFilter] = useState("");
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [selectedChild, setSelectedChild] = useState("");
  const [filterChild, setFilterChild] = useState(""); // cho bộ lọc
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; // số sản phẩm mỗi trang



  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      console.log("Không có từ khóa. Đang load lại tất cả sản phẩm...");

      const res = await fetch("https://fiyo.click/api/products");
      const data = await res.json();

      console.log("Danh sách sản phẩm đầy đủ:", data.products);

      // Đảm bảo mỗi sản phẩm có mảng variants
      const updatedData = (data.products || []).map((product: any) => ({
        ...product,
        variants: product.variants ?? [],
      }));

      setProducts(updatedData);
      setNoProduct(false);
      return;
    }

    try {
      const encodedKeyword = encodeURIComponent(searchKeyword.trim());
      const url = `https://fiyo.click/api/products/search?name=${encodedKeyword}`;
      console.log("Gửi request tìm sản phẩm với keyword:", searchKeyword);
      console.log("URL gửi đi:", url);

      const res = await fetch(url);
      const data = await res.json();

      console.log("Phản hồi từ server:", data);

      if (data && data.length > 0) {
        console.log(`Tìm thấy ${data.length} sản phẩm`);
        const updatedData = data.map((product: any, i: number) => {
          console.log(`Sản phẩm ${i + 1}:`, product);
          return {
            ...product,
            variants: product.variants ?? [],
          };
        });

        setProducts(updatedData);
        setNoProduct(false);
      } else {
        setProducts([]);
        setNoProduct(true);
      }

    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      setProducts([]);
      setNoProduct(true);
    }
  };

  const getTotalQuantity = (variants: any[]) => {
    return variants.reduce((total: number, variant: any) => {
      // Bỏ qua nếu variant hoặc sizes không tồn tại hoặc không phải mảng
      if (!variant || !Array.isArray(variant.sizes)) return total;

      const variantQty = variant.sizes.reduce((sum: number, size: any) => {
        return sum + (size?.quantity || 0); // tránh lỗi nếu size là null
      }, 0);

      return total + variantQty;
    }, 0);
  };

  const fetchProducts = async () => {
    try {
      let url = "https://fiyo.click/api/products";

      if (filterChild) {
        url = `https://fiyo.click/api/products/category/${filterChild}`;
      } else if (selectedChild) {
        url = `https://fiyo.click/api/products/category/${selectedChild}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 1 && data[0].status === true) {
        setProducts(data.slice(1));
        setNoProduct(false);
      } else if (data.products) {
        setProducts(data.products);
        setNoProduct(false);
      } else {
        setProducts([]);
        setNoProduct(true);
      }
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
      setProducts([]);
      setNoProduct(true);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filterChild, selectedChild]);

  const handleToggleDesc = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const getProductStatus = (variants: any[]) => {
    const totalQty = getTotalQuantity(variants);
    if (totalQty === 0) return "Hết hàng";
    if (totalQty < 50) return "Sắp hết";
    return "Còn hàng";
  };

  const getProductStatusClass = (variants: any[]) => {
    const totalQty = getTotalQuantity(variants);
    if (totalQty === 0) return styles.statusOut;
    if (totalQty < 50) return styles.statusLow;
    return styles.statusAvailable;
  };

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const res = await fetch("https://fiyo.click/api/category/parents");
        const data = await res.json();

        // Lọc bỏ phần tử có status (nếu là object không có _id)
        const validCategories = data.filter((item: any) => item._id);
        setParentCategories(validCategories);

      } catch (error) {
        console.error("Lỗi khi lấy danh mục cha:", error);
      }
    };
    fetchParents();
  }, []);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!selectedParent) {
        setChildCategories([]);
        return;
      }

      try {
        const res = await fetch(`https://fiyo.click/api/category/children/${selectedParent}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setChildCategories(data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh mục con:", error);
      }
    };

    fetchChildren();
  }, [selectedParent]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = "https://fiyo.click/api/products";

        // Nếu chọn danh mục con thì lọc theo danh mục con
        if (selectedChild) {
          url = `https://fiyo.click/api/products/category/${selectedChild}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 1 && data[0].status === true) {
          const products = data.slice(1);
          setProducts(products);
          setNoProduct(false);
        } else if (data.products) {
          // Trường hợp khi gọi toàn bộ sản phẩm từ /products
          setProducts(data.products);
          setNoProduct(false);
        } else {
          setProducts([]);
          setNoProduct(true);
        }
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        setProducts([]);
        setNoProduct(true);
      }
    };

    fetchProducts();
  }, [selectedChild]);

  const indexOfLast = currentPage * limit;
  const indexOfFirst = indexOfLast - limit;
  const currentProducts = products.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(products.length / limit);



  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />

        {/* Khu vực tìm kiếm và lọc - đồng bộ với trang danh mục */}
        <div className={styles.searchProduct}>
          <div className={styles.spaceBetween}>
            <h2 className={styles.userListTitle}> Trang nhập hàng </h2>
          </div>
        </div>

        <div className={styles.productManager}>
          {/* Bên trái */}
          <div className={styles.leftPanel}>
            <h3></h3>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className={styles.searchInput}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <select
              className={styles.select}
              value={selectedParent}
              onChange={(e) => {
                const selected = e.target.value;
                setSelectedParent(selected);

                if (!selected) {
                  setSelectedChild("");
                  setChildCategories([]);
                  setFilterChild("");
                  fetchProducts(); 
                }
              }}
            >
              <option value="">Danh mục</option>
              {parentCategories.map((cat: any) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              className={styles.select}
              value={filterChild}
              onChange={(e) => {
                console.log("Chọn danh mục con (lọc):", e.target.value);
                setFilterChild(e.target.value);
              }}
            >
              <option value="">Danh mục con</option>
              {childCategories.map((child: any) => (
                <option key={child._id} value={child._id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bên phải */}
          <div className={styles.rightPanel}>
            <table className={styles.productTable}>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Số lượng</th>
                  <th>Tình trạng</th>
                  <th>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {products.filter((product: any) => {
                  const totalQty = getTotalQuantity(product.variants);

                  if (stockFilter === "available") return totalQty >= 50;
                  if (stockFilter === "low") return totalQty > 0 && totalQty < 50;
                  if (stockFilter === "out") return totalQty === 0;
                  return true;
                }).length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "1rem" }}>
                      Không có sản phẩm nào trong danh mục này.
                    </td>
                  </tr>
                ) : (
                  currentProducts
                    .filter((product: any) => {
                      const totalQty = getTotalQuantity(product.variants);

                      if (stockFilter === "available") return totalQty >= 50;
                      if (stockFilter === "low") return totalQty > 0 && totalQty < 50;
                      if (stockFilter === "out") return totalQty === 0;
                      return true;
                    })
                    .map((product: any) => (
                      <tr key={product._id}>
                        <td>
                          <div className={styles.productInfo}>
                            <img
                              src={product.images?.[0]}
                              alt={product.name}
                              className={styles.productImage}
                            />
                            <div className={styles.productDetails}>
                              <div className={styles.productName}>{product.name}</div>
                              <div className={styles.productDesc}>
                                {expandedRows.includes(product._id) ? (
                                  <>
                                    {product.description}
                                    <button
                                      className={styles.descBtn}
                                      onClick={() => handleToggleDesc(product._id)}
                                    >
                                      Thu gọn
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    {product.description.length > 80
                                      ? product.description.slice(0, 80) + "..."
                                      : product.description}
                                    {product.description.length > 80 && (
                                      <button
                                        className={styles.descBtn}
                                        onClick={() => handleToggleDesc(product._id)}
                                      >
                                        Xem thêm
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>{product.category_id?.categoryName}</td>
                        <td>{getTotalQuantity(product.variants)}</td>
                        <td>
                          <span className={getProductStatusClass(product.variants)}>
                            {getProductStatus(product.variants)}
                          </span>
                        </td>
                        <td>
                          <button
                            className={styles.actionBtn}
                            title="Sửa"

                          >
                            asd
                          </button>

                        </td>
                      </tr>
                    ))
                )}
              </tbody>
              
            </table>
            <div className={styles.pagination}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Trang trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={currentPage === i + 1 ? styles.activePage : ""}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Trang sau
                </button>
              </div>
          </div>
        </div>
      </section>
    </main>
  );
}