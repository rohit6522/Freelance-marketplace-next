"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import { FieldError, FormAlert, SquareCheckbox } from "@/components/auth/FormParts";
import * as orderService from "@/services/orderService";
import { applyApiErrors } from "@/lib/forms";
import { cn, formatMoney, formatPrice } from "@/lib/utils";

export default function CheckoutForm({ summary }) {
  const { gigId, slug, title, image, seller, tier, pkg } = summary;
  const [order, setOrder] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { requirements: "", acknowledge: false }, mode: "onTouched" });

  const requirements = watch("requirements");
  const acknowledged = watch("acknowledge");

  const onSubmit = async (values) => {
    setFormErrors([]);
    try {
      const res = await orderService.createOrder({
        gigId,
        tier,
        requirements: values.requirements.trim(),
      });
      setOrder(res.data.order);
      toast.success("Order placed successfully");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setFormErrors(applyApiErrors(err, setError, { requirements: "requirements" }));
    }
  };

  /* ------------------------------ Success ------------------------------ */
  if (order) {
    return (
      <div className="max-w-3xl mx-auto px-margin-sm lg:px-margin py-space-xl">
        <div className="bg-surface-container-lowest border border-outline-variant shadow-[2px_2px_0px_#0b1c30] p-space-md sm:p-space-lg lg:p-space-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary-fixed border border-primary mb-space-sm">
            <Icon name="check_circle" filled className="text-primary text-sm" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-primary-fixed font-semibold">
              ORDER PLACED
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Order {order.orderNumber}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 mb-space-lg">
            Your simulated payment of <strong className="text-on-surface">{formatMoney(order.amount)}</strong> is held in
            demo escrow. {seller.name} will see your order and can accept or reject it. Status:{" "}
            <strong className="text-on-surface uppercase">{order.status.replace("_", " ")}</strong>.
          </p>

          <div className="border border-outline-variant mb-space-lg">
            <div className="bg-surface-container-low px-space-md py-space-xs font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant font-bold">
              MILESTONE PLAN (FUNDS RELEASED AFTER YOUR APPROVAL)
            </div>
            <ul className="divide-y divide-outline-variant">
              {order.milestones.map((milestone, index) => (
                <li key={milestone._id} className="flex items-center justify-between gap-space-md px-space-md py-space-sm">
                  <div className="min-w-0">
                    <p className="font-label-md text-label-md text-on-surface">
                      {index + 1}. {milestone.title}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{milestone.description}</p>
                  </div>
                  <span className="font-code-sm text-code-sm text-on-surface font-bold whitespace-nowrap">
                    {formatMoney(milestone.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-space-sm">
            <Link
              href={`/orders?id=${order._id}`}
              className="flex-1 text-center bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider py-space-sm font-bold border border-primary hover:bg-primary-container transition-colors"
            >
              View My Orders
            </Link>
            <Link
              href="/gigs"
              className="flex-1 text-center bg-surface-container-lowest text-on-surface font-label-md text-label-md uppercase tracking-wider py-space-sm font-bold border border-on-surface hover:bg-surface-container-high transition-colors"
            >
              Keep Browsing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------ Checkout ------------------------------ */
  return (
    <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
      <Link
        href={`/gigs/${slug}`}
        className="inline-flex items-center gap-1 font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant hover:text-primary mb-space-md"
      >
        <Icon name="arrow_back" className="text-sm" />
        Back to gig
      </Link>

      <div className="inline-flex items-center gap-space-xs bg-surface-container-high px-space-xs py-0.5 mb-space-sm ml-space-sm">
        <span className="w-1.5 h-1.5 bg-primary" />
        <span className="font-code-sm text-code-sm text-on-surface font-semibold tracking-widest uppercase">
          Checkout // Simulated payment
        </span>
      </div>
      <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight uppercase mb-space-lg">
        Place your order
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Requirements form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant shadow-[2px_2px_0px_#0b1c30] p-space-md sm:p-space-lg space-y-space-md"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="requirements" className="block font-label-md text-label-md text-on-surface">
                Project requirements <span className="text-primary font-bold">*</span>
              </label>
              <span className="font-code-sm text-code-sm text-on-surface-variant">{requirements.length}/3000</span>
            </div>
            <textarea
              id="requirements"
              rows={9}
              maxLength={3000}
              placeholder="Describe your goals, target users, references, brand assets and deadlines..."
              aria-invalid={errors.requirements ? "true" : undefined}
              className={cn(
                "w-full px-space-md py-2.5 bg-surface-container-lowest border text-on-surface font-body-md text-body-md focus:border-2 focus:border-on-surface focus:outline-none resize-y",
                errors.requirements ? "border-error" : "border-outline"
              )}
              {...register("requirements", {
                required: "Please describe your project",
                validate: (v) => v.trim().length >= 10 || "Requirements must be at least 10 characters",
                maxLength: { value: 3000, message: "Requirements cannot exceed 3000 characters" },
              })}
            />
            <FieldError message={errors.requirements?.message} />
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              The seller reviews this before accepting your order.
            </p>
          </div>

          <div className="bg-surface-container-low border border-outline-variant p-space-md">
            <div className="flex items-start gap-space-sm">
              <Icon name="shield" filled className="text-primary text-xl" />
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                <strong className="text-on-surface">This is a demo checkout.</strong> No card details are collected and no
                real money is charged. Your payment is recorded as held in a simulated escrow and released milestone by
                milestone as you approve the work.
              </p>
            </div>
          </div>

          <SquareCheckbox
            id="ack-chk"
            checked={acknowledged}
            error={errors.acknowledge?.message}
            registration={register("acknowledge", { required: "Please confirm that you understand the payment is simulated" })}
          >
            I understand this payment is simulated and no real money is charged.
          </SquareCheckbox>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-space-lg bg-primary-container text-on-primary font-headline-sm text-headline-sm uppercase tracking-wide border border-primary-container hover:bg-primary transition-none shadow-[2px_2px_0px_#0b1c30] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-space-sm disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? "Placing order..." : `Place Order (Simulated) · ${formatPrice(pkg.price)}`}</span>
            <Icon name={isSubmitting ? "sync" : "arrow_forward"} className={cn("text-lg", isSubmitting && "animate-spin")} />
          </button>

          {formErrors.length > 0 && (
            <FormAlert variant="error">
              {formErrors.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </FormAlert>
          )}
        </form>

        {/* Order summary */}
        <aside className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant lg:sticky lg:top-24">
          <div className="bg-surface-container-low px-space-md py-space-xs font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant font-bold">
            ORDER SUMMARY
          </div>

          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="w-full h-40 object-cover border-b border-outline-variant" />
          )}

          <div className="p-space-md space-y-space-md">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold line-clamp-2">{title}</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">by {seller.name}</p>
            </div>

            <div className="bg-surface-container-low p-space-md">
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-label-md text-label-md uppercase text-on-surface font-bold">{pkg.name} Package</span>
                <span className="font-code-sm text-code-sm text-primary font-bold">{formatPrice(pkg.price)}</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">{pkg.description}</p>
              <div className="font-code-sm text-code-sm text-on-surface-variant space-y-1">
                <div className="flex justify-between">
                  <span>DELIVERY</span>
                  <span className="text-on-surface font-bold">
                    {pkg.deliveryDays} {pkg.deliveryDays === 1 ? "DAY" : "DAYS"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>REVISIONS</span>
                  <span className="text-on-surface font-bold">
                    {pkg.unlimitedRevisions ? "UNLIMITED" : pkg.revisions}
                  </span>
                </div>
              </div>
              {(pkg.features ?? []).length > 0 && (
                <ul className="mt-space-sm space-y-space-xs font-body-sm text-body-sm text-on-surface">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-primary text-on-primary flex items-center justify-center font-bold text-label-sm shrink-0">
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="font-code-sm text-code-sm space-y-1 border-t border-outline-variant pt-space-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>PACKAGE PRICE</span>
                <span>{formatMoney(pkg.price)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>PLATFORM FEE</span>
                <span>{formatMoney(0)}</span>
              </div>
              <div className="flex justify-between text-on-surface font-bold text-body-md pt-space-xs">
                <span>TOTAL (SIMULATED)</span>
                <span>{formatMoney(pkg.price)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}