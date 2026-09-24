"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  Loader2,
  Save,
  X,
} from "lucide-react";

import {
  CreateProductPayload,
  Product,
} from "@/types/product";

interface ProductModalProps {
  open: boolean;
  product?: Product | null;
  loading?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (
    values: CreateProductPayload
  ) => Promise<void>;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  price?: string;
  stock?: string;
}

const DEFAULT_VALUES: CreateProductPayload = {
  title: "",
  description: "",
  category: "",
  price: 0,
  stock: 0,
};

export default function ProductModal({
  open,
  product,
  loading = false,
  error = "",
  onClose,
  onSubmit,
}: ProductModalProps) {
  const isEdit = Boolean(product);

  const [values, setValues] =
    useState<CreateProductPayload>(
      DEFAULT_VALUES
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  useEffect(() => {
    if (!open) return;

    if (product) {
      setValues({
        title: product.title,
        description: product.description,
        category: product.category,
        price: product.price,
        stock: product.stock,
      });
    } else {
      setValues(DEFAULT_VALUES);
    }

    setErrors({});
  }, [open, product]);

  /*
   * Prevent background scrolling while modal
   * is open.
   */
  useEffect(() => {
    if (!open) return;

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [open]);

  /*
   * Close modal with Escape.
   */
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape" &&
        !loading
      ) {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, loading, onClose]);

  if (!open) {
    return null;
  }

  const updateField = <
    K extends keyof CreateProductPayload
  >(
    field: K,
    value: CreateProductPayload[K]
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!values.title.trim()) {
      nextErrors.title =
        "Product title is required.";
    }

    if (!values.description.trim()) {
      nextErrors.description =
        "Description is required.";
    }

    if (!values.category.trim()) {
      nextErrors.category =
        "Category is required.";
    }

    if (
      !Number.isFinite(values.price) ||
      values.price < 0
    ) {
      nextErrors.price =
        "Price must be 0 or greater.";
    }

    if (
      !Number.isInteger(values.stock) ||
      values.stock < 0
    ) {
      nextErrors.stock =
        "Stock must be a whole number 0 or greater.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    if (!validate()) return;

    await onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category.trim(),
      price: Number(values.price),
      stock: Number(values.stock),
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#e2e8f0] px-5 py-4 sm:px-6">
          <div>
            <h2
              id="product-modal-title"
              className="text-lg font-bold tracking-tight text-[#0f172a]"
            >
              {isEdit
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <p className="mt-0.5 text-xs text-[#64748b]">
              {isEdit
                ? "Update the product information below."
                : "Add a new product to your inventory."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#64748b] transition hover:bg-slate-100 hover:text-[#0f172a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="min-h-0 overflow-y-auto"
        >
          <div className="space-y-5 p-5 sm:p-6">
            {/* API error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Product information */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-[#0f172a]">
                Product Information
              </h3>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label
                    htmlFor="product-title"
                    className="mb-1.5 block text-sm font-medium text-[#334155]"
                  >
                    Title
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="product-title"
                    type="text"
                    value={values.title}
                    onChange={(event) =>
                      updateField(
                        "title",
                        event.target.value
                      )
                    }
                    placeholder="e.g. iPhone 15 Pro"
                    disabled={loading}
                    className={`
                      h-11 w-full rounded-xl border px-3.5 text-sm text-[#0f172a] outline-none transition placeholder:text-[#94a3b8]
                      ${
                        errors.title
                          ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                          : "border-[#e2e8f0] focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-50"
                      }
                      disabled:cursor-not-allowed disabled:bg-slate-50
                    `}
                  />

                  {errors.title && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="product-description"
                    className="mb-1.5 block text-sm font-medium text-[#334155]"
                  >
                    Description
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <textarea
                    id="product-description"
                    value={values.description}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Describe the product..."
                    rows={4}
                    disabled={loading}
                    className={`
                      w-full resize-none rounded-xl border px-3.5 py-3 text-sm text-[#0f172a] outline-none transition placeholder:text-[#94a3b8]
                      ${
                        errors.description
                          ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                          : "border-[#e2e8f0] focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-50"
                      }
                      disabled:cursor-not-allowed disabled:bg-slate-50
                    `}
                  />

                  {errors.description && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="product-category"
                    className="mb-1.5 block text-sm font-medium text-[#334155]"
                  >
                    Category
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="product-category"
                    type="text"
                    value={values.category}
                    onChange={(event) =>
                      updateField(
                        "category",
                        event.target.value
                      )
                    }
                    placeholder="e.g. smartphones"
                    disabled={loading}
                    className={`
                      h-11 w-full rounded-xl border px-3.5 text-sm text-[#0f172a] outline-none transition placeholder:text-[#94a3b8]
                      ${
                        errors.category
                          ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                          : "border-[#e2e8f0] focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-50"
                      }
                      disabled:cursor-not-allowed disabled:bg-slate-50
                    `}
                  />

                  {errors.category && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-[#0f172a]">
                Pricing & Inventory
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Price */}
                <div>
                  <label
                    htmlFor="product-price"
                    className="mb-1.5 block text-sm font-medium text-[#334155]"
                  >
                    Price
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#64748b]">
                      $
                    </span>

                    <input
                      id="product-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={values.price}
                      onChange={(event) =>
                        updateField(
                          "price",
                          Number(
                            event.target.value
                          )
                        )
                      }
                      disabled={loading}
                      className={`
                        h-11 w-full rounded-xl border pl-8 pr-3.5 text-sm text-[#0f172a] outline-none transition
                        ${
                          errors.price
                            ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                            : "border-[#e2e8f0] focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-50"
                        }
                        disabled:cursor-not-allowed disabled:bg-slate-50
                      `}
                    />
                  </div>

                  {errors.price && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.price}
                    </p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label
                    htmlFor="product-stock"
                    className="mb-1.5 block text-sm font-medium text-[#334155]"
                  >
                    Stock
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="product-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={values.stock}
                    onChange={(event) =>
                      updateField(
                        "stock",
                        Number(
                          event.target.value
                        )
                      )
                    }
                    disabled={loading}
                    className={`
                      h-11 w-full rounded-xl border px-3.5 text-sm text-[#0f172a] outline-none transition
                      ${
                        errors.stock
                          ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                          : "border-[#e2e8f0] focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-50"
                      }
                      disabled:cursor-not-allowed disabled:bg-slate-50
                    `}
                  />

                  {errors.stock && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.stock}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e2e8f0] bg-[#f8fafc] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 rounded-xl border border-[#e2e8f0] bg-white px-4 text-sm font-semibold text-[#475569] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />

                  {isEdit
                    ? "Save Changes"
                    : "Create Product"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}