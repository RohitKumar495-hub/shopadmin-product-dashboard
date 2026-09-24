"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

import { CreateProductPayload } from "@/types/product";

interface ProductFormProps {
  initialValues?: Partial<CreateProductPayload>;
  submitLabel?: string;
  loading?: boolean;
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

export default function ProductForm({
  initialValues,
  submitLabel = "Create Product",
  loading = false,
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] =
    useState<CreateProductPayload>({
      ...DEFAULT_VALUES,
      ...initialValues,
    });

  const [errors, setErrors] =
    useState<FormErrors>({});

  /*
   * Update form when edit data arrives.
   */
  useEffect(() => {
    if (initialValues) {
      setValues({
        ...DEFAULT_VALUES,
        ...initialValues,
      });
    }
  }, [initialValues]);

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
        "Product description is required.";
    }

    if (!values.category.trim()) {
      nextErrors.category =
        "Product category is required.";
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

    if (loading) {
      return;
    }

    if (!validate()) {
      return;
    }

    // API success/error notifications are handled by the parent
    // component through the global Sonner toast system.
    await onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category.trim(),
      price: Number(values.price),
      stock: Number(values.stock),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Basic information */}
      <section className="rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
        <div className="border-b border-[#e2e8f0] px-5 py-4 sm:px-6">
          <h2 className="text-sm font-semibold text-[#0f172a]">
            Basic Information
          </h2>

          <p className="mt-1 text-xs text-[#64748b]">
            Enter the basic details for this product.
          </p>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-[#334155]"
            >
              Product Title
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              id="title"
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
                h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-[#0f172a] outline-none transition placeholder:text-[#94a3b8]
                ${
                  errors.title
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                    : "border-[#e2e8f0] focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-50"
                }
                disabled:cursor-not-allowed disabled:bg-slate-50
              `}
            />

            {errors.title && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-[#334155]"
            >
              Description
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <textarea
              id="description"
              value={values.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              placeholder="Describe the product..."
              rows={2}
              disabled={loading}
              className={`
                w-full resize-none rounded-xl border bg-white px-3.5 py-3 text-sm text-[#0f172a] outline-none transition placeholder:text-[#94a3b8]
                ${
                  errors.description
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                    : "border-[#e2e8f0] focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-50"
                }
                disabled:cursor-not-allowed disabled:bg-slate-50
              `}
            />

            {errors.description && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.description}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-[#334155]"
            >
              Category
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              id="category"
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
                h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-[#0f172a] outline-none transition placeholder:text-[#94a3b8]
                ${
                  errors.category
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                    : "border-[#e2e8f0] focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-50"
                }
                disabled:cursor-not-allowed disabled:bg-slate-50
              `}
            />

            {errors.category && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.category}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Inventory */}
      <section className="rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
        <div className="border-b border-[#e2e8f0] px-5 py-4 sm:px-6">
          <h2 className="text-sm font-semibold text-[#0f172a]">
            Pricing & Inventory
          </h2>

          <p className="mt-1 text-xs text-[#64748b]">
            Set the selling price and available stock.
          </p>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-medium text-[#334155]"
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
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                onChange={(event) =>
                  updateField(
                    "price",
                    Number(event.target.value)
                  )
                }
                disabled={loading}
                className={`
                  h-11 w-full rounded-xl border bg-white pl-8 pr-3.5 text-sm text-[#0f172a] outline-none transition
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
              <p className="mt-1.5 text-xs text-red-600">
                {errors.price}
              </p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label
              htmlFor="stock"
              className="mb-2 block text-sm font-medium text-[#334155]"
            >
              Stock
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              id="stock"
              type="number"
              min="0"
              step="1"
              value={values.stock}
              onChange={(event) =>
                updateField(
                  "stock",
                  Number(event.target.value)
                )
              }
              disabled={loading}
              className={`
                h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-[#0f172a] outline-none transition
                ${
                  errors.stock
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                    : "border-[#e2e8f0] focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-50"
                }
                disabled:cursor-not-allowed disabled:bg-slate-50
              `}
            />

            {errors.stock && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.stock}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/products"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 text-sm font-semibold text-[#475569] transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Cancel
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2
                size={17}
                className="animate-spin"
              />

              Saving...
            </>
          ) : (
            <>
              <Save size={17} />

              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}