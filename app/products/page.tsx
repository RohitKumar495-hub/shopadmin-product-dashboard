"use client";



import Link from "next/link";
import { useRouter } from "next/navigation";



import axios from "axios";

import { toast } from "sonner";

import {

    AlertCircle,

    AlertTriangle,

    Edit3,

    ChevronLeft,

    ChevronRight,

    ImageOff,

    Loader2,

    Plus,

    Search,

    SlidersHorizontal,

    Trash2,

} from "lucide-react";

import {

    useCallback,

    useEffect,

    useMemo,

    useState,

} from "react";



import DashboardShell from "@/components/layouts/DashboardShell";

import { useDebounce } from "@/hooks/useDebounce";

import { productService } from "@/services/product.service";

import { CreateProductPayload, Product } from "@/types/product";

import ProductModal from "@/components/products/ProductModal";



type SortOption =

    | "default"

    | "price-asc"

    | "price-desc"

    | "rating-desc"

    | "title-asc";



const PAGE_SIZES = [10, 20, 50];



const VALID_SORTS: SortOption[] = [

    "default",

    "price-asc",

    "price-desc",

    "rating-desc",

    "title-asc",

];



function isValidSort(value: string): value is SortOption {

    return VALID_SORTS.includes(value as SortOption);

}



function getValidPage(value: string | null) {

    const page = Number(value);



    if (!Number.isInteger(page) || page < 1) {

        return 1;

    }



    return page;

}



function getValidPageSize(value: string | null) {

    const size = Number(value);



    if (!PAGE_SIZES.includes(size)) {

        return 10;

    }



    return size;

}



export default function ProductsPage() {

    const [products, setProducts] = useState<Product[]>([]);

    const [total, setTotal] = useState(0);

    const router = useRouter();

    const [page, setPage] = useState(1);

    const [pageSize, setPageSize] = useState(10);



    const [search, setSearch] = useState("");

    const debouncedSearch = useDebounce(search, 500);



    const [category, setCategory] = useState("all");

    const [categories, setCategories] = useState<string[]>([]);



    const [sort, setSort] =

        useState<SortOption>("default");



    const [loading, setLoading] = useState(true);

    const [categoryLoading, setCategoryLoading] =

        useState(true);

    const [error, setError] = useState("");

    const [productModalOpen, setProductModalOpen] =

        useState(false);



    const [editingProduct, setEditingProduct] =

        useState<Product | null>(null);



    const [mutationLoading, setMutationLoading] =

        useState(false);



    const [deleteProduct, setDeleteProduct] =

        useState<Product | null>(null);



    const [deleteLoading, setDeleteLoading] =

        useState(false);

    /*

     * Read filters from URL on first render.

     */

    useEffect(() => {

        const params = new URLSearchParams(

            window.location.search

        );



        const urlPage = getValidPage(

            params.get("page")

        );



        const urlLimit = getValidPageSize(

            params.get("limit")

        );



        const urlSearch =

            params.get("search") ?? "";



        const urlCategory =

            params.get("category") ?? "all";



        const urlSort = params.get("sort") ?? "default";



        setPage(urlPage);

        setPageSize(urlLimit);

        setSearch(urlSearch);



        setCategory(

            urlCategory.trim()

                ? urlCategory

                : "all"

        );



        setSort(

            isValidSort(urlSort)

                ? urlSort

                : "default"

        );

    }, []);



    /*

     * Keep URL synchronized with the current state.

     */

    useEffect(() => {

        const params = new URLSearchParams();



        params.set("page", String(page));

        params.set("limit", String(pageSize));



        if (debouncedSearch.trim()) {

            params.set(

                "search",

                debouncedSearch.trim()

            );

        }



        if (category !== "all" && !debouncedSearch.trim()) {

            params.set("category", category);

        }



        if (sort !== "default") {

            params.set("sort", sort);

        }



        const queryString = params.toString();



        window.history.replaceState(

            null,

            "",

            queryString

                ? `/products?${queryString}`

                : "/products"

        );

    }, [

        page,

        pageSize,

        debouncedSearch,

        category,

        sort,

    ]);



    /*

     * Load categories.

     */

    useEffect(() => {

        const controller = new AbortController();



        const loadCategories = async () => {

            try {

                setCategoryLoading(true);



                const data =

                    await productService.getCategories(

                        controller.signal

                    );



                setCategories(data);

            } catch (error) {

                /*

                 * Axios throws CanceledError when the

                 * AbortController cancels a request.

                 *

                 * This is expected and should not be

                 * treated as a real error.

                 */

                if (axios.isCancel(error)) {

                    return;

                }



                console.error(

                    "Failed to load categories:",

                    error

                );

            } finally {

                if (!controller.signal.aborted) {

                    setCategoryLoading(false);

                }

            }

        };



        loadCategories();



        return () => {

            controller.abort();

        };

    }, []);



    /*

     * Fetch products.

     */

    const fetchProducts = useCallback(

        async (signal: AbortSignal) => {

            try {

                setLoading(true);

                setError("");



                const skip =

                    (page - 1) * pageSize;



                let data;



                /*

                 * Search has priority.

                 *

                 * DummyJSON does not support combining

                 * search and category filtering.

                 */

                if (debouncedSearch.trim()) {

                    data =

                        await productService.searchProducts(

                            debouncedSearch.trim(),

                            pageSize,

                            skip,

                            signal

                        );

                }



                /*

                 * Category filtering.

                 */

                else if (category !== "all") {

                    data =

                        await productService.getProductsByCategory(

                            category,

                            pageSize,

                            skip,

                            signal

                        );

                }



                /*

                 * Normal product listing.

                 */

                else {

                    data =

                        await productService.getProducts(

                            pageSize,

                            skip,

                            signal

                        );

                }



                /*

                 * Don't update state if this request

                 * was cancelled.

                 */

                if (signal.aborted) {

                    return;

                }



                setProducts(data.products);

                setTotal(data.total);

            } catch (error) {

                /*

                 * Cancellation is expected when:

                 *

                 * - search changes

                 * - page changes

                 * - filter changes

                 * - component unmounts

                 */

                if (axios.isCancel(error)) {

                    return;

                }



                console.error(

                    "Failed to fetch products:",

                    error

                );



                setError(

                    "We couldn't load the products. Please try again."

                );

            } finally {

                if (!signal.aborted) {

                    setLoading(false);

                }

            }

        },

        [

            page,

            pageSize,

            debouncedSearch,

            category,

        ]

    );



    /*

     * Run product request whenever the relevant

     * state changes.

     */

    useEffect(() => {

        const controller = new AbortController();



        fetchProducts(controller.signal);



        return () => {

            controller.abort();

        };

    }, [fetchProducts]);



    /*

     * Search.

     */

    const handleSearchChange = (

        value: string

    ) => {

        setSearch(value);

        setPage(1);

    };



    /*

     * Category.

     *

     * When category changes, reset pagination.

     */

    const handleCategoryChange = (

        value: string

    ) => {

        setCategory(value);

        setPage(1);

    };



    /*

     * Page size.

     */

    const handlePageSizeChange = (

        value: number

    ) => {

        setPageSize(value);

        setPage(1);

    };



    /*

     * Sorting.

     */

    const handleSortChange = (

        value: SortOption

    ) => {

        setSort(value);

        setPage(1);

    };



    /*

     * Retry.

     */

    const handleRetry = () => {

        const controller =

            new AbortController();



        fetchProducts(controller.signal);

    };



    /*

     * Open Add Product modal.

     */

    const handleAddProduct = () => {

        setEditingProduct(null);

        setProductModalOpen(true);

    };



    /*

     * Open Edit Product modal.

     */

    const handleEditProduct = (product: Product) => {

        setEditingProduct(product);

        setProductModalOpen(true);

    };



    /*

     * Close Product modal.

     */

    const handleCloseProductModal = () => {

        if (mutationLoading) {

            return;

        }



        setProductModalOpen(false);

        setEditingProduct(null);

    };



    /*

     * Create or update a product.

     *

     * DummyJSON accepts mutations but does not persist

     * them permanently, so we immediately update the

     * current UI state as well.

     */

    const handleProductSubmit = async (

        values: CreateProductPayload

    ) => {

        if (mutationLoading) {

            return;

        }



        const isEditing = Boolean(editingProduct);



        try {

            setMutationLoading(true);



            if (editingProduct) {

                const updatedProduct =

                    await productService.updateProduct(

                        editingProduct.id,

                        values

                    );



                setProducts((currentProducts) =>

                    currentProducts.map((product) =>

                        product.id === editingProduct.id

                            ? {

                                ...product,

                                ...updatedProduct,

                                ...values,

                            }

                            : product

                    )

                );



                toast.success("Product updated successfully");

            } else {

                const newProduct =

                    await productService.createProduct(values);



                const productForUi: Product = {

                    ...newProduct,

                    ...values,

                };



                setProducts((currentProducts) => [

                    productForUi,

                    ...currentProducts,

                ]);



                setTotal((currentTotal) => currentTotal + 1);



                toast.success("Product created successfully");

            }



            setProductModalOpen(false);

            setEditingProduct(null);

        } catch (error) {

            console.error(

                "Product mutation failed:",

                error

            );



            toast.error(

                isEditing

                    ? "Unable to update the product. Please try again."

                    : "Unable to create the product. Please try again."

            );

        } finally {

            setMutationLoading(false);

        }

    };



    const handleDeleteProduct = async () => {

        if (!deleteProduct || deleteLoading) {

            return;

        }



        try {

            setDeleteLoading(true);



            await productService.deleteProduct(deleteProduct.id);



            setProducts((currentProducts) =>

                currentProducts.filter(

                    (product) => product.id !== deleteProduct.id

                )

            );



            setTotal((currentTotal) =>

                Math.max(0, currentTotal - 1)

            );



            toast.success("Product deleted successfully");

            setDeleteProduct(null);

        } catch (error) {

            console.error("Product deletion failed:", error);

            toast.error(

                "Unable to delete the product. Please try again."

            );

        } finally {

            setDeleteLoading(false);

        }

    };



    /*

     * Sort currently loaded products.

     */

    const sortedProducts = useMemo(() => {

        const result = [...products];



        switch (sort) {

            case "price-asc":

                return result.sort(

                    (a, b) => a.price - b.price

                );



            case "price-desc":

                return result.sort(

                    (a, b) => b.price - a.price

                );



            case "rating-desc":

                return result.sort(

                    (a, b) => b.rating - a.rating

                );



            case "title-asc":

                return result.sort((a, b) =>

                    a.title.localeCompare(b.title)

                );



            default:

                return result;

        }

    }, [products, sort]);



    /*

     * Pagination calculations.

     */

    const totalPages =

        total > 0

            ? Math.ceil(total / pageSize)

            : 0;



    /*

     * Protect against invalid URLs such as:

     *

     * /products?page=999999

     */

    useEffect(() => {

        if (

            totalPages > 0 &&

            page > totalPages

        ) {

            setPage(totalPages);

        }

    }, [page, totalPages]);



    const startItem =

        total === 0

            ? 0

            : (page - 1) * pageSize + 1;



    const endItem =

        total === 0

            ? 0

            : Math.min(page * pageSize, total);



    /*

     * Generate pagination buttons.

     */

    const pageNumbers = useMemo(() => {

        if (totalPages <= 0) {

            return [];

        }



        if (totalPages <= 7) {

            return Array.from(

                { length: totalPages },

                (_, index) => index + 1

            );

        }



        const pages: (number | string)[] = [];



        pages.push(1);



        if (page > 4) {

            pages.push("left-ellipsis");

        }



        const start = Math.max(

            2,

            page - 1

        );



        const end = Math.min(

            totalPages - 1,

            page + 1

        );



        for (

            let current = start;

            current <= end;

            current++

        ) {

            pages.push(current);

        }



        if (page < totalPages - 3) {

            pages.push("right-ellipsis");

        }



        pages.push(totalPages);



        return pages;

    }, [page, totalPages]);



    return (

        <DashboardShell>

            <div className="mx-auto max-w-[1600px]">

                {/* --------------------------------

            Header

        -------------------------------- */}

                {/* --------------------------------
    Header
-------------------------------- */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
                            Products
                        </h1>

                        <p className="mt-1 text-sm text-[#64748b]">
                            Manage your product inventory
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddProduct}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#4338ca]"
                    >
                        <Plus size={17} />
                        Add Product
                    </button>
                </div>



                {/* --------------------------------

            Filters

        -------------------------------- */}

                <div className="mb-4 rounded-2xl border border-[#e2e8f0] bg-white p-3 shadow-sm">

                    <div className="flex flex-col gap-3 lg:flex-row">

                        {/* Search */}

                        <div className="relative min-w-0 flex-1">

                            <Search

                                size={17}

                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"

                            />



                            <input

                                type="search"

                                value={search}

                                onChange={(event) =>

                                    handleSearchChange(

                                        event.target.value

                                    )

                                }

                                placeholder="Search products..."

                                className="h-10 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] pl-10 pr-4 text-sm text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#4f46e5] focus:bg-white focus:ring-4 focus:ring-indigo-50"

                            />

                        </div>



                        {/* Category */}

                        <select

                            value={category}

                            disabled={

                                Boolean(

                                    debouncedSearch.trim()

                                ) || categoryLoading

                            }

                            onChange={(event) =>

                                handleCategoryChange(

                                    event.target.value

                                )

                            }

                            className="h-10 rounded-xl border border-[#e2e8f0] bg-white px-3 text-sm text-[#475569] outline-none transition focus:border-[#4f46e5] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-[#94a3b8]"

                        >

                            <option value="all">

                                {categoryLoading

                                    ? "Loading categories..."

                                    : "All Categories"}

                            </option>



                            {categories.map(

                                (categoryName) => (

                                    <option

                                        key={categoryName}

                                        value={categoryName}

                                    >

                                        {categoryName}

                                    </option>

                                )

                            )}

                        </select>



                        {/* Sort */}

                        <select

                            value={sort}

                            onChange={(event) =>

                                handleSortChange(

                                    event.target

                                        .value as SortOption

                                )

                            }

                            className="h-10 rounded-xl border border-[#e2e8f0] bg-white px-3 text-sm text-[#475569] outline-none transition focus:border-[#4f46e5]"

                        >

                            <option value="default">

                                Sort by

                            </option>



                            <option value="price-asc">

                                Price: Low to High

                            </option>



                            <option value="price-desc">

                                Price: High to Low

                            </option>



                            <option value="rating-desc">

                                Rating: High to Low

                            </option>



                            <option value="title-asc">

                                Title: A–Z

                            </option>

                        </select>



                        {/* Page size */}

                        <select

                            value={pageSize}

                            onChange={(event) =>

                                handlePageSizeChange(

                                    Number(

                                        event.target.value

                                    )

                                )

                            }

                            className="h-10 rounded-xl border border-[#e2e8f0] bg-white px-3 text-sm text-[#475569] outline-none transition focus:border-[#4f46e5]"

                        >

                            {PAGE_SIZES.map((size) => (

                                <option

                                    key={size}

                                    value={size}

                                >

                                    {size} / page

                                </option>

                            ))}

                        </select>



                        {/* Filter button */}

                        <button

                            type="button"

                            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] px-3 text-sm font-medium text-[#64748b] transition hover:bg-slate-50"

                        >

                            <SlidersHorizontal

                                size={16}

                            />



                            <span className="lg:hidden">

                                Filters

                            </span>

                        </button>

                    </div>



                    {/* Search/category explanation */}

                    {debouncedSearch.trim() && (

                        <div className="mt-3 flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-700">

                            <Search size={14} />



                            <span>

                                Category filtering is disabled while

                                searching because the product API does

                                not support both filters together.

                            </span>

                        </div>

                    )}

                </div>



                {/* --------------------------------

            Loading

        -------------------------------- */}

                {loading && (

                    <div className="rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">

                        <div className="flex min-h-[420px] flex-col items-center justify-center">

                            <Loader2

                                size={32}

                                className="animate-spin text-[#4f46e5]"

                            />



                            <p className="mt-4 text-sm font-medium text-[#334155]">

                                Loading products...

                            </p>



                            <p className="mt-1 text-xs text-[#94a3b8]">

                                Please wait while we fetch your

                                inventory.

                            </p>

                        </div>

                    </div>

                )}



                {/* --------------------------------

            Error

        -------------------------------- */}

                {!loading && error && (

                    <div className="rounded-2xl border border-red-100 bg-white shadow-sm">

                        <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">

                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">

                                <AlertCircle size={24} />

                            </div>



                            <h2 className="mt-4 text-base font-semibold text-[#0f172a]">

                                Something went wrong

                            </h2>



                            <p className="mt-1 max-w-sm text-sm text-[#64748b]">

                                {error}

                            </p>



                            <button

                                type="button"

                                onClick={handleRetry}

                                className="mt-5 rounded-xl bg-[#4f46e5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4338ca]"

                            >

                                Try again

                            </button>

                        </div>

                    </div>

                )}



                {/* --------------------------------

            Empty

        -------------------------------- */}

                {!loading &&

                    !error &&

                    sortedProducts.length === 0 && (

                        <div className="rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">

                            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">

                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[#64748b]">

                                    <ImageOff size={22} />

                                </div>



                                <h2 className="mt-4 text-base font-semibold text-[#0f172a]">

                                    No products found

                                </h2>



                                <p className="mt-1 text-sm text-[#64748b]">

                                    Try changing your search or

                                    filters.

                                </p>



                                {(search ||

                                    category !== "all") && (

                                        <button

                                            type="button"

                                            onClick={() => {

                                                setSearch("");

                                                setCategory("all");

                                                setPage(1);

                                            }}

                                            className="mt-5 rounded-xl border border-[#e2e8f0] px-4 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-slate-50"

                                        >

                                            Clear filters

                                        </button>

                                    )}

                            </div>

                        </div>

                    )}



                {/* --------------------------------

            Product table

        -------------------------------- */}

                {!loading &&

                    !error &&

                    sortedProducts.length > 0 && (

                        <>

                            {/* Desktop */}

                            <div className="hidden overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm md:block">

                                <div className="overflow-x-auto">

                                    <table className="w-full border-collapse">

                                        <thead>

                                            <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">

                                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">

                                                    Product

                                                </th>



                                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">

                                                    Category

                                                </th>



                                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">

                                                    Price

                                                </th>



                                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">

                                                    Rating

                                                </th>



                                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#64748b]">

                                                    Stock

                                                </th>



                                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#64748b]">

                                                    Actions

                                                </th>

                                            </tr>

                                        </thead>



                                        <tbody>

                                            {sortedProducts.map(

                                                (product) => (

                                                    <tr

                                                        key={product.id}

                                                        className="border-b border-[#f1f5f9] transition hover:bg-[#f8fafc]"

                                                    >

                                                        {/* Product */}

                                                        <td className="px-5 py-4">

                                                            <div className="flex items-center gap-3">

                                                                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-100">

                                                                    <img

                                                                        src={

                                                                            product.thumbnail

                                                                        }

                                                                        alt={

                                                                            product.title

                                                                        }

                                                                        className="h-full w-full object-cover"

                                                                    />

                                                                </div>



                                                                <div className="min-w-0">

                                                                    <Link

                                                                        href={`/products/${product.id}`}

                                                                        className="block max-w-[280px] truncate text-sm font-semibold text-[#0f172a] transition hover:text-[#4f46e5]"

                                                                    >

                                                                        {product.title}

                                                                    </Link>



                                                                    <p className="mt-0.5 text-xs text-[#94a3b8]">

                                                                        Product #

                                                                        {

                                                                            product.id

                                                                        }

                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </td>



                                                        {/* Category */}

                                                        <td className="px-5 py-4">

                                                            <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium capitalize text-[#4f46e5]">

                                                                {

                                                                    product.category

                                                                }

                                                            </span>

                                                        </td>



                                                        {/* Price */}

                                                        <td className="px-5 py-4 text-sm font-semibold text-[#0f172a]">

                                                            $

                                                            {product.price.toFixed(

                                                                2

                                                            )}

                                                        </td>



                                                        {/* Rating */}

                                                        <td className="px-5 py-4">

                                                            <span className="inline-flex items-center gap-1 text-sm font-medium text-[#334155]">

                                                                <span className="text-[#f59e0b]">

                                                                    ★

                                                                </span>



                                                                {typeof product.rating === "number"
                                                                    ? product.rating.toFixed(1)
                                                                    : "—"}

                                                            </span>

                                                        </td>



                                                        {/* Stock */}

                                                        <td className="px-5 py-4">

                                                            <span

                                                                className={`

                                  rounded-lg px-2.5 py-1 text-xs font-semibold

                                  ${product.stock ===

                                                                        0

                                                                        ? "bg-red-50 text-red-600"

                                                                        : product.stock <=

                                                                            10

                                                                            ? "bg-amber-50 text-amber-600"

                                                                            : "bg-emerald-50 text-emerald-600"

                                                                    }

                                `}

                                                            >

                                                                {product.stock ===

                                                                    0

                                                                    ? "Out of stock"

                                                                    : product.stock <=

                                                                        10

                                                                        ? `Low stock (${product.stock})`

                                                                        : `In stock (${product.stock})`}

                                                            </span>

                                                        </td>



                                                        {/* Actions */}

                                                        <td className="px-5 py-4 text-right">

                                                            <div className="flex items-center justify-end gap-1">

                                                                <button

                                                                    type="button"

                                                                    onClick={() =>

                                                                        handleEditProduct(product)

                                                                    }

                                                                    aria-label={`Edit ${product.title}`}

                                                                    title="Edit product"

                                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[#4f46e5] transition hover:bg-indigo-50 hover:text-[#4338ca]"

                                                                >

                                                                    <Edit3 size={17} />

                                                                </button>



                                                                <button

                                                                    type="button"

                                                                    onClick={() =>

                                                                        setDeleteProduct(product)

                                                                    }

                                                                    aria-label={`Delete ${product.title}`}

                                                                    title="Delete product"

                                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[#dc2626] transition hover:bg-red-50 hover:text-[#b91c1c]"

                                                                >

                                                                    <Trash2 size={17} />

                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                )

                                            )}

                                        </tbody>

                                    </table>

                                </div>



                                <Pagination

                                    page={page}

                                    totalPages={totalPages}

                                    startItem={startItem}

                                    endItem={endItem}

                                    total={total}

                                    pageNumbers={pageNumbers}

                                    onPageChange={setPage}

                                />

                            </div>



                            {/* --------------------------------

                  Mobile cards

              -------------------------------- */}

                            <div className="space-y-3 md:hidden">

                                {sortedProducts.map(

                                    (product) => (

                                        <div
                                            key={product.id}
                                            role="link"
                                            tabIndex={0}
                                            onClick={() => router.push(`/products/${product.id}`)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    router.push(`/products/${product.id}`);
                                                }
                                            }}
                                            className="cursor-pointer rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                        >

                                            <div className="flex gap-3">

                                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">

                                                    <img

                                                        src={

                                                            product.thumbnail

                                                        }

                                                        alt={product.title}

                                                        className="h-full w-full object-cover"

                                                    />

                                                </div>



                                                <div className="min-w-0 flex-1">

                                                    <div className="flex items-start justify-between gap-2">

                                                        <div className="min-w-0">

                                                            <h3 className="truncate text-sm font-semibold text-[#0f172a]">

                                                                {

                                                                    product.title

                                                                }

                                                            </h3>



                                                            <p className="mt-1 text-xs capitalize text-[#94a3b8]">

                                                                {

                                                                    product.category

                                                                }

                                                            </p>

                                                        </div>



                                                        <div className="flex shrink-0 items-center gap-1">

                                                            <button

                                                                type="button"

                                                                onClick={() =>

                                                                    handleEditProduct(product)

                                                                }

                                                                aria-label={`Edit ${product.title}`}

                                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#4f46e5] transition hover:bg-indigo-50"

                                                            >

                                                                <Edit3 size={16} />

                                                            </button>



                                                            <button

                                                                type="button"

                                                                onClick={() =>

                                                                    setDeleteProduct(product)

                                                                }

                                                                aria-label={`Delete ${product.title}`}

                                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#dc2626] transition hover:bg-red-50"

                                                            >

                                                                <Trash2 size={16} />

                                                            </button>

                                                        </div>

                                                    </div>



                                                    <div className="mt-4 flex items-center justify-between">

                                                        <div>

                                                            <p className="text-sm font-bold text-[#0f172a]">

                                                                $

                                                                {product.price.toFixed(

                                                                    2

                                                                )}

                                                            </p>



                                                            <p className="mt-1 text-xs">
                                                                <span className="text-[#f59e0b]">
                                                                    ★
                                                                </span>{" "}
                                                                {typeof product.rating === "number"
                                                                    ? product.rating.toFixed(1)
                                                                    : "—"}
                                                            </p>

                                                        </div>



                                                        <span

                                                            className={`

                                rounded-lg px-2.5 py-1 text-xs font-semibold

                                ${product.stock ===

                                                                    0

                                                                    ? "bg-red-50 text-red-600"

                                                                    : product.stock <=

                                                                        10

                                                                        ? "bg-amber-50 text-amber-600"

                                                                        : "bg-emerald-50 text-emerald-600"

                                                                }

                              `}

                                                        >

                                                            Stock:{" "}

                                                            {product.stock}

                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    )

                                )}



                                <Pagination

                                    page={page}

                                    totalPages={totalPages}

                                    startItem={startItem}

                                    endItem={endItem}

                                    total={total}

                                    pageNumbers={pageNumbers}

                                    onPageChange={setPage}

                                    mobile

                                />

                            </div>

                        </>

                    )}

            </div>



            {deleteProduct && (

                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">

                    <div

                        role="dialog"

                        aria-modal="true"

                        aria-labelledby="delete-product-title"

                        className="w-full max-w-md rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-2xl"

                    >

                        <div className="flex items-start gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#dc2626]">

                                <AlertTriangle size={21} />

                            </div>



                            <div className="min-w-0">

                                <h2

                                    id="delete-product-title"

                                    className="text-base font-bold text-[#0f172a]"

                                >

                                    Delete product?

                                </h2>

                                <p className="mt-1.5 text-sm leading-6 text-[#64748b]">

                                    Are you sure you want to delete{" "}

                                    <span className="font-semibold text-[#334155]">

                                        {deleteProduct.title}

                                    </span>

                                    ? This action cannot be undone.

                                </p>

                            </div>

                        </div>



                        <div className="mt-6 flex justify-end gap-3">

                            <button

                                type="button"

                                disabled={deleteLoading}

                                onClick={() => setDeleteProduct(null)}

                                className="rounded-xl border border-[#e2e8f0] px-4 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"

                            >

                                Cancel

                            </button>



                            <button

                                type="button"

                                disabled={deleteLoading}

                                onClick={handleDeleteProduct}

                                className="inline-flex items-center gap-2 rounded-xl bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"

                            >

                                {deleteLoading ? (

                                    <>

                                        <Loader2

                                            size={16}

                                            className="animate-spin"

                                        />

                                        Deleting...

                                    </>

                                ) : (

                                    <>

                                        <Trash2 size={16} />

                                        Delete

                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            )}



            <ProductModal

                open={productModalOpen}

                product={editingProduct}

                loading={mutationLoading}

                onClose={handleCloseProductModal}

                onSubmit={handleProductSubmit}

            />

        </DashboardShell>

    );

}



/* ========================================

   Pagination

\======================================== */



interface PaginationProps {

    page: number;

    totalPages: number;

    startItem: number;

    endItem: number;

    total: number;

    pageNumbers: (number | string)[];

    onPageChange: (page: number) => void;

    mobile?: boolean;

}



function Pagination({

    page,

    totalPages,

    startItem,

    endItem,

    total,

    pageNumbers,

    onPageChange,

    mobile = false,

}: PaginationProps) {

    return (

        <div

            className={`

        ${mobile

                    ? "flex flex-col gap-3"

                    : "flex items-center justify-between"

                }

        border-t border-[#e2e8f0] px-5 py-4

      `}

        >

            {/* Showing text */}

            <p className="text-xs text-[#64748b]">

                Showing{" "}

                <span className="font-semibold text-[#334155]">

                    {startItem}–{endItem}

                </span>{" "}

                of{" "}

                <span className="font-semibold text-[#334155]">

                    {total}

                </span>

            </p>



            {/* Controls */}

            <div className="flex items-center justify-end gap-1">

                {/* Previous */}

                <button

                    type="button"

                    disabled={

                        page <= 1 ||

                        totalPages === 0

                    }

                    onClick={() =>

                        onPageChange(

                            Math.max(1, page - 1)

                        )

                    }

                    className="flex h-8 items-center gap-1 rounded-lg border border-[#e2e8f0] px-2.5 text-xs font-medium text-[#64748b] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"

                >

                    <ChevronLeft size={14} />



                    {!mobile && "Previous"}

                </button>



                {/* Pages */}

                {pageNumbers.map(

                    (pageNumber, index) =>

                        typeof pageNumber === "string" ? (

                            <span

                                key={`${pageNumber}-${index}`}

                                className="flex h-8 w-7 items-center justify-center text-xs text-[#94a3b8]"

                            >

                                ...

                            </span>

                        ) : (

                            <button

                                key={pageNumber}

                                type="button"

                                onClick={() =>

                                    onPageChange(pageNumber)

                                }

                                className={`

                  h-8 w-8 rounded-lg text-xs font-semibold transition

                  ${pageNumber === page

                                        ? "bg-[#4f46e5] text-white shadow-sm"

                                        : "text-[#64748b] hover:bg-slate-100"

                                    }

                `}

                            >

                                {pageNumber}

                            </button>

                        )

                )}



                {/* Next */}

                <button

                    type="button"

                    disabled={

                        page >= totalPages ||

                        totalPages === 0

                    }

                    onClick={() =>

                        onPageChange(

                            Math.min(

                                totalPages,

                                page + 1

                            )

                        )

                    }

                    className="flex h-8 items-center gap-1 rounded-lg border border-[#e2e8f0] px-2.5 text-xs font-medium text-[#64748b] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"

                >

                    {!mobile && "Next"}



                    <ChevronRight size={14} />

                </button>

            </div>

        </div>

    );

}