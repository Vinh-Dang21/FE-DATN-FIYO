"use client";
import {
  Pencil,
  Trash2,
} from "lucide-react";
import styles from "./products.module.css";
import { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";

interface Variant {
  color: string;
  sizes: {
    size: string;
    quantity: number;
    sku?: string; // nếu có dùng SKU
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
  variants: Variant[]; // 👈 Thêm dòng này
}





export default function Product() {
  const [showAdd, setShowAdd] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [noProduct, setNoProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stockFilter, setStockFilter] = useState("");
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [selectedChild, setSelectedChild] = useState("");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [currentColor, setCurrentColor] = useState<string>("");
  const [sizeInput, setSizeInput] = useState<string>("");
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [sizes, setSizes] = useState<{ size: string; quantity: number }[]>([]);
  const [images, setImages] = useState<File[]>([]); // Mảng linh hoạt, không cố định 4 phần tử
  const [previews, setPreviews] = useState<string[]>([]);
  const [productName, setProductName] = useState("");
  const [sale, setSale] = useState<string>("");
  const [saleCount, setSaleCount] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [material, setMaterial] = useState("");
  const [description, setDescription] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [filterChild, setFilterChild] = useState(""); // cho bộ lọc
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const [editingSizeIndex, setEditingSizeIndex] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [imageWarning, setImageWarning] = useState("");



  const handleEditProduct = async (product: Product) => {
    const categoryId = product.category_id?.categoryId;

    // 1. Tìm danh mục cha tương ứng
    let foundParent: Category | undefined;

    for (const parent of parentCategories) {
      try {
        const res = await fetch(`https://fiyo.click/api/category/children/${parent._id}`);
        const children = await res.json();

        const match = children.find((child: Category) => child._id === categoryId);
        if (match) {
          foundParent = parent;
          setChildCategories(children); // set danh mục con
          break;
        }
      } catch (error) {
        console.error("Lỗi khi fetch danh mục con:", error);
      }
    }

    if (foundParent) {
      setSelectedParent(foundParent._id); // set danh mục cha
      setSelectedChild(categoryId || ""); // set danh mục con
    } else {
      console.warn("⚠️ Không tìm thấy danh mục cha phù hợp");
    }

    // Gán các giá trị khác vào form
    setEditProduct(product);
    setEditingProductId(product._id);
    setShowAdd(true);
    setProductName(product.name);
    setPrice(product.price?.toString() || "");
    setSale(product.sale?.toString() || "");
    setSaleCount(product.sale_count?.toString() || "");
    setMaterial(product.material || "");
    setDescription(product.description);
    setVariants(product.variants || []);
    setPreviews(product.images || []);

  };


  const handleToggleDesc = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };
  const handleMultipleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const updatedImages = [...images, ...newFiles];
    setImages(updatedImages);

    const updatedPreviews = updatedImages.map((file) =>
      file instanceof File ? URL.createObjectURL(file) : file
    );
    setPreviews(updatedPreviews);

    if (updatedImages.length > 4) {
      setImageWarning("Bạn đã chọn hơn 4 ảnh. Vui lòng xóa bớt.");
    } else {
      setImageWarning("");
    }
  };



  const resetForm = () => {
    setShowAdd(false);
    setEditProduct(null);
    setVariants([]);
    setImages([]);
    setPreviews([]);
    setSizes([]);
    setCurrentColor("");
    setProductName("");
    setSale("");
    setSaleCount("");
    setPrice("");
    setMaterial("");
    setDescription("");
    setSelectedParent("");
    setSelectedChild("");
  };

  const handleSubmit = async () => {
    const hasNewImages = images.filter(Boolean).length > 0;
    const hasOldImages = previews && previews.length > 0;
    const totalImageCount = (images.filter(Boolean).length || 0) + (previews?.length || 0);
    const filteredImages = images.filter((img) => img !== null);
    if (!productName.trim()) {
      alert("Tên sản phẩm không được để trống!");
      return;
    }

    const isDuplicateName = products.some(
      (product) =>
        product.name.trim().toLowerCase() === productName.trim().toLowerCase() &&
        product._id !== editProduct?._id
    );


    if (isDuplicateName) {
      alert("Tên sản phẩm đã tồn tại. Vui lòng chọn tên khác.");
      return;
    }


    if (!price.trim()) {
      alert("Vui lòng nhập giá sản phẩm!");
      return;
    }


    if (!selectedChild) {
      alert("Vui lòng chọn danh mục!");
      return;
    }

    if (!description.trim()) {
      alert("Mô tả sản phẩm không được để trống!");
      return;
    }


    if (!hasNewImages && !hasOldImages) {
      alert("Vui lòng thêm ảnh cho sản phẩm");
      return;
    }

    const parsedPrice = parseInt(price || "0");
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      alert("Giá không hợp lệ! Vui lòng nhập số và không âm.");
      return;
    }

    const parsedSale = parseInt(sale || "0");
    if (isNaN(parsedSale) || parsedSale < 0) {
      alert("Giá khuyến mãi không hợp lệ! Vui lòng nhập số và không âm.");
      return;
    }

    // Kiểm tra giá khuyến mãi không được cao hơn giá gốc
    if (parsedSale > parsedPrice) {
      alert("Giá khuyến mãi không được cao hơn giá sản phẩm!");
      return;
    }

    const parsedSaleCount = parseInt(saleCount || "0");
    if (isNaN(parsedSaleCount) || parsedSaleCount < 0) {
      alert("Số lượng đã bán không hợp lệ! Vui lòng nhập số và không âm.");
      return;
    }


    const formData = new FormData();

    const validImages = images.filter(Boolean);
    // Nếu có ảnh mới => gửi cả ảnh mới và giữ lại ảnh cũ
    if (editProduct && validImages.length === 0) {
      // Gửi lại ảnh cũ
      previews.forEach((link) => {
        if (link) formData.append("images", link);
      });
    } else {
      // Thêm mới thì chỉ gửi ảnh file
      validImages.forEach((img) => {
        if (img) formData.append("images", img);
      });
    }


    formData.append("name", productName);
    formData.append("price", parsedPrice.toString());
    formData.append("sale", parsedSale.toString());
    formData.append("sale_count", parsedSaleCount.toString());
    formData.append("description", description);
    formData.append("category_id", selectedChild);
    formData.append("shop_id", "1");
    formData.append("variants", JSON.stringify(variants));
    formData.append("material", material);

    // Tính tổng quantity từ tất cả variants
    const totalQuantity = variants.reduce((total, variant) => {
      return total + variant.sizes.reduce((sum, size) => sum + size.quantity, 0);
    }, 0);

    // Nếu không có variants hoặc tổng quantity bằng 0 => ẩn
    const isHiddenFlag = variants.length === 0 || totalQuantity === 0;
    formData.append("isHidden", isHiddenFlag.toString());


    try {
      const url = editProduct
        ? `https://fiyo.click/api/products/update/${editProduct._id}`
        : `https://fiyo.click/api/products/create`;

      const method = editProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const result = await response.json();
      console.log("Kết quả phản hồi:", result);

      if (result.status) {
        alert(editProduct ? "Sửa sản phẩm thành công!" : "Thêm sản phẩm thành công!");

        // Reset form
        resetForm();

        // Gọi lại API danh sách
        const fetchAgain = await fetch("https://fiyo.click/api/products");
        const reload = await fetchAgain.json();
        setProducts(reload.products || []);
      } else {
        alert((editProduct ? "Cập nhật sản phẩm thất bại" : "Thêm sản phẩm thất bại"));
      }
    } catch (error) {
      console.error("Lỗi gửi dữ liệu:", error);
      alert("Lỗi khi gửi dữ liệu");
    }
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
        const products = data.slice(1);
        setProducts(products);
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
    const fetchProducts = async () => {
      try {
        let url = "https://fiyo.click/api/products";

        if (filterChild) {
          url = `https://fiyo.click/api/products/category/${filterChild}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 1 && data[0].status === true) {
          const products = data.slice(1);
          setProducts(products);
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

    fetchProducts();
  }, [filterChild]);


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

  const isAvailable = (variants: any[]) => {
    return getTotalQuantity(variants) > 0;
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

  const handleChangeVisibility = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`https://fiyo.click/api/products/${id}/visibility`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isHidden: !currentStatus }),
      });

      if (!res.ok) throw new Error("Không thể cập nhật trạng thái hiển thị");

      const updated = await res.json();
      alert(updated.message || "Cập nhật thành công");

      fetchProducts(); // Reload lại danh sách
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Đã xảy ra lỗi khi cập nhật hiển thị");
    }
  };


  const handlePickColor = async () => {
    if (!("EyeDropper" in window)) {
      alert("Trình duyệt không hỗ trợ EyeDropper");
      return;
    }
    const eyeDropper = new (window as any).EyeDropper();
    try {
      const result = await eyeDropper.open();
      setCurrentColor(result.sRGBHex);
    } catch (err) {
      console.error("Lỗi EyeDropper:", err);
    }
  };

  const handleSaveSize = () => {
    const trimmedSize = sizeInput.trim();
    if (!trimmedSize || quantityInput <= 0) return;

    const isDuplicate = sizes.some(
      (s, i) =>
        s.size.toLowerCase() === trimmedSize.toLowerCase() &&
        i !== editingSizeIndex
    );
    if (isDuplicate) {
      alert("Size này đã được thêm rồi!");
      return;
    }

    let updatedSizes = [...sizes];

    if (editingSizeIndex !== null) {
      updatedSizes[editingSizeIndex] = { size: trimmedSize, quantity: quantityInput };
    } else {
      updatedSizes.push({ size: trimmedSize, quantity: quantityInput });
    }

    setSizes(updatedSizes);
    setSizeInput("");
    setQuantityInput(1);
    setEditingSizeIndex(null); // reset mode sửa
  };


  const handleAddVariant = () => {
    if (!currentColor) {
      alert("Chưa chọn màu");
      return;
    }
    if (sizes.length === 0) {
      alert("Chưa thêm size");
      return;
    }

    // Lấy mã màu từ chuỗi "TênMàu MãMàu" → ví dụ: "Trắng SW001"
    const colorParts = currentColor.trim().split(" ");
    const colorCode = colorParts[colorParts.length - 1]; // SW001

    // Thêm sku cho từng size
    const updatedSizes = sizes.map((s) => ({
      ...s,
      sku: `${colorCode}-${s.size}`, // ví dụ: SW001-104
    }));

    const newVariant: Variant = {
      color: currentColor,
      sizes: updatedSizes,
    };

    console.log("Biến thể mới được thêm:", newVariant);

    setVariants((prev) => {
      const updated = [...prev, newVariant];
      console.log("Danh sách biến thể hiện tại:", updated);
      return updated;
    });

    // Reset sau khi thêm
    setCurrentColor("");
    setSizes([]);
  };

  const handleEditVariant = (index: number) => {
    const variant = variants[index];
    setCurrentColor(variant.color);
    setSizes(variant.sizes.map(({ size, quantity }) => ({ size, quantity })));
    setEditingVariantIndex(index); // Đánh dấu đang sửa
  };

  const handleDeleteVariant = (index: number) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  const handleUpdateVariant = () => {
    if (editingVariantIndex === null) return;

    if (!currentColor) {
      alert("Chưa chọn màu");
      return;
    }

    if (sizes.length === 0) {
      alert("Chưa thêm size");
      return;
    }

    const updatedVariant: Variant = {
      color: currentColor,
      sizes,
    };

    const newVariants = [...variants];
    newVariants[editingVariantIndex] = updatedVariant;

    setVariants(newVariants);
    setCurrentColor("");
    setSizes([]);
    setEditingVariantIndex(null); // reset mode sửa
  };
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
  const handleRemoveImage = (indexToRemove: number) => {
    const filteredImages = images.filter((_, idx) => idx !== indexToRemove);
    setImages(filteredImages);

    const filteredPreviews = previews.filter((_, idx) => idx !== indexToRemove);
    setPreviews(filteredPreviews);

    if (filteredImages.length <= 4) {
      setImageWarning(""); // Xóa cảnh báo khi còn 4 ảnh trở xuống
    }
  };



  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />
        {/* Bộ lọc */}
        <div className={styles.filterProduct}>
          <div className={styles.filterBar}>
            <h2 className={styles.sectionTitle}>Lọc sản phẩm </h2>
            <div className={styles.selectRow}>
              <select
                className={styles.select}
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="">Tình trạng</option>
                <option value="available">Còn hàng</option>
                <option value="low">Sắp hết</option>
                <option value="out">Hết hàng</option>
              </select>
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
                    fetchProducts(); // <-- Gọi lại hàm fetchProducts để lấy toàn bộ sản phẩm
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
          </div>
        </div>

        {/* Thanh tìm kiếm + Thêm sản phẩm */}
        <div className={styles.searchProduct}>
          <div className={styles.searchAddBar}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className={styles.searchInput}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(); // Gọi hàm tìm kiếm khi nhấn Enter
                }
              }}
            />

            <button
              className={styles.addButton}
              onClick={() => setShowAdd(true)}
            >
              + Thêm sản phẩm
            </button>
          </div>
        </div>
        {showAdd && (
          <div className={styles.addProductForm}>
            <h2 className={styles.addProductTitle}>
              {editProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
            </h2>


            {/* Hàng 1: Tên sản phẩm & Giá */}
            <div className={styles.row}>
              <input
                className={styles.input}
                type="text"
                placeholder="Tên sản phẩm"
                name="name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <input
                className={styles.input}
                type="number"
                placeholder="Giá bán"
                name="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            {/* Hàng mới: Sale, Sale Count, Material */}
            <div className={styles.row}>
              {/* Material input bên trái */}
              <input
                className={styles.inputMaterial}
                type="text"
                placeholder="Chất liệu (material)"
                name="material"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />

              {/* Sale và Sale count cùng trong 1 div */}
              <div className={styles.saleGroup}>
                <input
                  className={styles.inputHalf}
                  type="number"
                  placeholder="Giảm giá - sale (VND)"
                  name="sale"
                  value={sale}
                  onChange={(e) => setSale(e.target.value)}
                />
                <input
                  className={styles.inputHalf}
                  type="number"
                  placeholder="Đã bán (mặc định là 0)"
                  name="sale_count"
                  value={saleCount}
                  onChange={(e) => setSaleCount(e.target.value)}
                />
              </div>
            </div>
            {/* Hàng 2: Danh mục*/}
            <div className={styles.row}>
              <select
                className={styles.input}
                value={selectedParent}
                onChange={(e) => {
                  const parentId = e.target.value;
                  setSelectedParent(parentId);
                  setSelectedChild(""); // reset danh mục con khi chọn lại cha
                }}
              >
                <option value="">-- Chọn danh mục cha --</option>
                {parentCategories.map((parent) => (
                  <option key={parent._id} value={parent._id}>
                    {parent.name}
                  </option>
                ))}
              </select>
              <select
                className={styles.input}
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                disabled={!selectedParent}
              >
                <option value="">-- Chọn danh mục con --</option>
                {childCategories.map((child) => (
                  <option key={child._id} value={child._id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Hàng 3: Ảnh */}
            <div className={styles.rowColumn}>
              <label>Chọn ảnh sản phẩm:</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultipleImages}
              />
              {imageWarning && <p className={styles.imageWarning}>{imageWarning}</p>}

              <div className={styles.imageGrid}>
                {previews.map((preview, index) => (
                  <div key={index} className={styles.imageSlot} style={{ position: "relative" }}>
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className={styles.imagePreview}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        background: "rgba(0,0,0,0.6)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: 24,
                        height: 24,
                        cursor: "pointer",
                        fontWeight: "bold",
                        lineHeight: "20px",
                        textAlign: "center",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>


            {/* Hàng 4: Variants */}
            <div className={styles.variantSection}>
              <h3>Thêm biến thể sản phẩm</h3>
              {/* Chọn màu */}
              <div className={styles.rowvarian}>
                <label>Màu sắc:</label>
                <input type="color" value={currentColor} onChange={(e) => setCurrentColor(e.target.value)} />
                <button type="button" onClick={handlePickColor}>Chọn màu</button>
              </div>

              {/* Nhập size và số lượng */}
              <div className={styles.rowvarian}>
                <input
                  type="text"
                  placeholder="Size (VD: M)"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Số lượng"
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(Number(e.target.value))}
                />
                <button type="button" onClick={handleSaveSize}>
                  {editingSizeIndex !== null ? "Lưu size" : "Thêm size"}
                </button>
              </div>

              {/* Danh sách size đã thêm */}
              <div className={styles.showvarian}>
                {sizes.map((s, index) => (
                  <div key={index} className={styles.sizeRow}>
                    <span className={styles.sizeText}>Size: {s.size} - SL: {s.quantity}</span>
                    <div className={styles.buttonGroup}>
                      <button className={styles.editButton} onClick={() => {
                        setSizeInput(s.size);
                        setQuantityInput(s.quantity);
                        setEditingSizeIndex(index);
                      }}>
                        sửa
                      </button>
                      <button className={styles.deleteButton} onClick={() => {
                        const newSizes = [...sizes];
                        newSizes.splice(index, 1);
                        setSizes(newSizes);
                      }}>
                        xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Thêm variant */}
              {/* Thêm hoặc Lưu variant */}
              {editingVariantIndex !== null ? (
                <button
                  className={styles.addvarian}
                  type="button"
                  onClick={handleUpdateVariant}
                >
                  Lưu biến thể
                </button>
              ) : (
                <button
                  className={styles.addvarian}
                  type="button"
                  onClick={handleAddVariant}
                >
                  + Thêm biến thể
                </button>
              )}

              {/* Hiển thị các variant đã thêm */}
              <div className={styles.variantSizeList}>
                {variants.map((v, index) => (
                  <div className={styles.variantRow} key={index}>
                    <div className={styles.colorBlock}>
                      <span
                        className={styles.colorCircle}
                        style={{ backgroundColor: v.color }}
                      ></span>
                      <strong>Màu: {v.color}</strong>
                    </div>

                    <ul className={styles.sizeList}>
                      {v.sizes.map((s, i) => (
                        <li key={i}>
                          <strong>Size:</strong> {s.size} – <strong>SL:</strong> {s.quantity}
                        </li>
                      ))}
                    </ul>

                    {/* Nút thao tác cho biến thể */}
                    <div className={styles.buttonGroup}>
                      <button
                        className={styles.editButton}
                        onClick={() => handleEditVariant(index)}
                      >
                        Sửa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Hàng 6: Mô tả sản phẩm */}
            <div className={styles.row}>
              <textarea
                className={styles.input}
                placeholder="Mô tả"
                name="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Hàng 8: Nút Thêm bên phải */}
            <div className={styles.row} style={{ justifyContent: "flex-end" }}>
              <button className={styles.addButton} type="button" onClick={handleSubmit}>
                {editProduct ? "Cập nhật" : "Thêm"}
              </button>
            </div>

            {/* Hàng 9: Nút Đóng ở giữa */}
            <div className={styles.row} style={{ justifyContent: "center" }}>
              <button
                className={styles.closeBtn}
                onClick={resetForm}
                type="button"
              >
                Đóng
              </button>
            </div>

          </div>

        )}
        <div className={styles.productList}>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đóng/Mở bán</th>
                <th>Danh mục</th>
                <th>Giá</th>
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
                products
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
                      <td>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={!product.isHidden}
                            onChange={() => handleChangeVisibility(product._id, product.isHidden)}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </td>

                      <td>{product.category_id?.categoryName}</td>
                      <td>{product.price.toLocaleString()} VND</td>
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
                          onClick={() => handleEditProduct(product)}
                        >
                          <Pencil size={20} />
                        </button>

                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
