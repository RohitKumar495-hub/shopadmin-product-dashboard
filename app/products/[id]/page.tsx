"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ImageOff,
  Loader2,
  Package,
  ShieldCheck,
  Star,
  Trash2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import DashboardShell from "@/components/layouts/DashboardShell";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product";
import ProductModal from "@/components/products/ProductModal";

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const productId = useMemo(() => {
    const value = Number(params?.id);

    if (!Number.isInteger(value) || value <= 0) {
      return null;
    }

    return value;
  }, [params?.id]);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    const controller = new AbortController();

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");
        setNotFound(false);

        const data = await productService.getProductById(
          productId,
          controller.signal
        );

        if (!data || !data.id) {
          setNotFound(true);
          return;
        }

        setProduct(data);
        setActiveImage(0);
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        const status = (
          requestError as {
            response?: { status?: number };
          }
        )?.response?.status;

        if (status === 404) {
          setNotFound(true);
        } else {
          console.error(
            "Failed to load product details:",
            requestError
          );
          setError(
            "Unable to load this product. Please try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => controller.abort();
  }, [productId]);

  const images = product?.images?.length
    ? product.images
    : product?.thumbnail
      ? [product.thumbnail]
      : [];

  const handlePreviousImage = () => {
    if (images.length <= 1) return;

    setActiveImage((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  };

  const handleNextImage = () => {
    if (images.length <= 1) return;

    setActiveImage((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  };

  const handleDelete = async () => {
    if (!product || deleteLoading) return;

    try {
      setDeleteLoading(true);

      await productService.deleteProduct(product.id);

      toast.success("Product deleted successfully");
      router.push("/products");
    } catch (requestError) {
      console.error("Product deletion failed:", requestError);
      toast.error(
        "Unable to delete the product. Please try again."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = async (
    values: Parameters<
      NonNullable<React.ComponentProps<typeof ProductModal>["onSubmit"]>
    >[0]
  ) => {
    if (!product || editLoading) return;

    try {
      setEditLoading(true);

      const updatedProduct =
        await productService.updateProduct(
          product.id,
          values
        );

      setProduct((current) =>
        current
          ? {
              ...current,
              ...updatedProduct,
              ...values,
            }
          : current
      );

      toast.success("Product updated successfully");
      setEditOpen(false);
    } catch (requestError) {
      console.error("Product update failed:", requestError);
      toast.error(
        "Unable to update the product. Please try again."
      );
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-[1400px]">
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2
                size={28}
                className="animate-spin text-[#4f46e5]"
              />
              <p className="text-sm text-[#64748b]">
                Loading product details...
              </p>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (notFound) {
    return (
      <DashboardShell>
        <div className="mx-auto flex min-h-[70vh] max-w-[700px] items-center justify-center">
          <div className="w-full rounded-2xl border border-[#e2e8f0] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-[#64748b]">
              <Package size={26} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-[#0f172a]">
              Product not found
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748b]">
              The product ID in the URL is invalid or the product
              could not be found.
            </p>

            <button
              type="button"
              onClick={() => router.push("/products")}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#4f46e5] px-4 text-sm font-semibold text-white transition hover:bg-[#4338ca]"
            >
              <ArrowLeft size={16} />
              Back to Products
            </button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error || !product) {
    return (
      <DashboardShell>
        <div className="mx-auto flex min-h-[70vh] max-w-[700px] items-center justify-center">
          <div className="w-full rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#dc2626]">
              <ImageOff size={26} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-[#0f172a]">
              Failed to load product
            </h1>

            <p className="mt-2 text-sm text-[#64748b]">
              {error || "Something went wrong."}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-[#4f46e5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4338ca]"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const stockLabel =
    product.stock === 0
      ? "Out of stock"
      : product.stock <= 10
        ? `Low stock (${product.stock} units)`
        : `In stock (${product.stock} units)`;

  const stockClass =
    product.stock === 0
      ? "bg-red-50 text-red-600"
      : product.stock <= 10
        ? "bg-amber-50 text-amber-600"
        : "bg-emerald-50 text-emerald-600";

  return (
    <DashboardShell>
      <div className="mx-auto max-w-[1400px] pb-10">
        {/* Breadcrumb / back */}
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#64748b] transition hover:text-[#4f46e5]"
        >
          <ArrowLeft size={17} />
          Back to Products
        </button>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold capitalize text-[#4f46e5]">
                {product.category}
              </span>

              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${stockClass}`}
              >
                {stockLabel}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
              {product.title}
            </h1>

            <p className="mt-1 text-sm text-[#64748b]">
              Product ID #{product.id}
              {product.sku ? ` · SKU ${product.sku}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 text-sm font-semibold text-[#475569] shadow-sm transition hover:bg-slate-50 hover:text-[#0f172a]"
            >
              <Edit3 size={16} />
              Edit Product
            </button>

            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#dc2626] px-4 text-sm font-semibold text-white transition hover:bg-[#b91c1c]"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        {/* Main product section */}
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          {/* Gallery */}
          <section className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-4 md:grid-cols-[88px_minmax(0,1fr)]">
              <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col">
                {images.length > 0 ? (
                  images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-50 transition ${
                        activeImage === index
                          ? "border-[#4f46e5]"
                          : "border-transparent hover:border-slate-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 text-[#94a3b8]">
                    <ImageOff size={20} />
                  </div>
                )}
              </div>

              <div className="relative order-1 min-h-[360px] overflow-hidden rounded-2xl bg-[#f8fafc] md:order-2 sm:min-h-[500px]">
                {images[activeImage] ? (
                  <img
                    src={images[activeImage]}
                    alt={product.title}
                    className="h-full w-full object-contain p-6 sm:p-10"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#94a3b8]">
                    <ImageOff size={42} />
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePreviousImage}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#e2e8f0] bg-white/95 text-[#475569] shadow-sm transition hover:bg-white"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextImage}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#e2e8f0] bg-white/95 text-[#475569] shadow-sm transition hover:bg-white"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Summary */}
          <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
              Product Overview
            </p>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-sm font-semibold text-amber-700">
                <Star size={15} fill="currentColor" />
                {product.rating.toFixed(1)}
              </div>

              <span className="text-sm text-[#64748b]">
                {product.reviews?.length ?? 0} reviews
              </span>
            </div>

            <div className="mt-6">
              <p className="text-3xl font-bold tracking-tight text-[#0f172a]">
                ${product.price.toFixed(2)}
              </p>

              {product.discountPercentage > 0 && (
                <p className="mt-1 text-sm text-emerald-600">
                  {product.discountPercentage.toFixed(1)}% discount
                </p>
              )}
            </div>

            <div className="my-6 h-px bg-[#e2e8f0]" />

            <h2 className="text-sm font-semibold text-[#0f172a]">
              Description
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#64748b]">
              {product.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoTile
                label="Brand"
                value={product.brand || "—"}
              />
              <InfoTile
                label="Category"
                value={product.category}
                capitalize
              />
              <InfoTile
                label="SKU"
                value={product.sku || "—"}
              />
              <InfoTile
                label="Weight"
                value={
                  product.weight !== undefined
                    ? `${product.weight} g`
                    : "—"
                }
              />
            </div>
          </section>
        </div>

        {/* Product information */}
        <section className="mt-5 rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
          <div className="border-b border-[#e2e8f0] px-5 py-4 sm:px-6">
            <h2 className="text-sm font-semibold text-[#0f172a]">
              Product Information
            </h2>
            <p className="mt-1 text-xs text-[#64748b]">
              Additional inventory, shipping and policy details.
            </p>
          </div>

          <div className="grid gap-px bg-[#e2e8f0] sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem
              label="Availability"
              value={product.availabilityStatus || "—"}
            />
            <DetailItem
              label="Minimum Order"
              value={
                product.minimumOrderQuantity
                  ? `${product.minimumOrderQuantity} units`
                  : "—"
              }
            />
            <DetailItem
              label="Warranty"
              value={product.warrantyInformation || "—"}
            />
            <DetailItem
              label="Shipping"
              value={product.shippingInformation || "—"}
            />
            <DetailItem
              label="Return Policy"
              value={product.returnPolicy || "—"}
            />
            <DetailItem
              label="Tags"
              value={
                product.tags?.length
                  ? product.tags.join(", ")
                  : "—"
              }
            />
          </div>
        </section>

        {/* Reviews */}
        <section className="mt-5 rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-[#e2e8f0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-sm font-semibold text-[#0f172a]">
                Reviews
              </h2>
              <p className="mt-1 text-xs text-[#64748b]">
                Customer feedback for this product.
              </p>
            </div>

            <span className="text-xs font-medium text-[#64748b]">
              {product.reviews?.length ?? 0} reviews
            </span>
          </div>

          {product.reviews?.length ? (
            <div className="divide-y divide-[#f1f5f9]">
              {product.reviews.map((review, index) => (
                <div
                  key={`${review.reviewerEmail}-${index}`}
                  className="px-5 py-5 sm:px-6"
                >
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-[#4f46e5]">
                      {review.reviewerName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#0f172a]">
                            {review.reviewerName}
                          </p>

                          <div className="mt-1 flex items-center gap-1">
                            {Array.from({ length: 5 }).map(
                              (_, starIndex) => (
                                <Star
                                  key={starIndex}
                                  size={13}
                                  className={
                                    starIndex <
                                    review.rating
                                      ? "text-amber-400"
                                      : "text-slate-200"
                                  }
                                  fill={
                                    starIndex <
                                    review.rating
                                      ? "currentColor"
                                      : "none"
                                  }
                                />
                              )
                            )}

                            <span className="ml-1 text-xs font-medium text-[#64748b]">
                              {review.rating}/5
                            </span>
                          </div>
                        </div>

                        <span className="text-xs text-[#94a3b8]">
                          {new Date(
                            review.date
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-[#64748b]">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-[#475569]">
                No reviews available
              </p>
              <p className="mt-1 text-xs text-[#94a3b8]">
                This product does not have any customer reviews yet.
              </p>
            </div>
          )}
        </section>

        {/* Small feature row */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Feature
            icon={<ShieldCheck size={18} />}
            title="Secure management"
            text="Product data is managed through the admin dashboard."
          />
          <Feature
            icon={<Truck size={18} />}
            title="Shipping information"
            text={product.shippingInformation || "Not available"}
          />
          <Feature
            icon={<Package size={18} />}
            title="Inventory"
            text={`${product.stock} units currently available`}
          />
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#dc2626]">
                <Trash2 size={20} />
              </div>

              <div>
                <h2 className="text-base font-bold text-[#0f172a]">
                  Delete product?
                </h2>
                <p className="mt-1.5 text-sm leading-6 text-[#64748b]">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-[#334155]">
                    {product.title}
                  </span>
                  ?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteOpen(false)}
                className="rounded-xl border border-[#e2e8f0] px-4 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b91c1c] disabled:opacity-60"
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

      {/* Edit modal */}
      {editOpen && (
        <ProductModal
          open={editOpen}
          product={product}
          loading={editLoading}
          onClose={() => {
            if (!editLoading) {
              setEditOpen(false);
            }
          }}
          onSubmit={handleEdit}
        />
      )}
    </DashboardShell>
  );
}

function InfoTile({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94a3b8]">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-semibold text-[#334155] ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94a3b8]">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#475569]">
        {value}
      </p>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#4f46e5]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#0f172a]">
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-[#64748b]">
          {text}
        </p>
      </div>
    </div>
  );
}
