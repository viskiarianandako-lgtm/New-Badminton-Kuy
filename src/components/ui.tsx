"use client";

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "danger";
  loading?: boolean;
  icon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", loading, icon, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-pill px-6 py-3.5 text-base font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants = {
      primary: "bg-brand-primary text-on-brand-primary hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20",
      secondary: "bg-brand-secondary text-on-brand-secondary hover:bg-brand-secondary/80",
      outline: "border-2 border-borderStrong text-onSurface hover:bg-surface-tertiary bg-transparent",
      danger: "bg-error text-white hover:bg-error/90",
    };

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

// ---------------------------------------------------------------------------
// TextField
// ---------------------------------------------------------------------------
type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-onSurface">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full rounded-md border border-border bg-surface-tertiary px-4 py-3 text-base text-onSurface placeholder:text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all",
            error && "border-error",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  }
);
TextField.displayName = "TextField";

// ---------------------------------------------------------------------------
// TextArea
// ---------------------------------------------------------------------------
type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-onSurface">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full rounded-md border border-border bg-surface-tertiary px-4 py-3 text-base text-onSurface placeholder:text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all min-h-[100px]",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
TextArea.displayName = "TextArea";

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: { label: string; value: string }[];
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-onSurface">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full rounded-md border border-border bg-surface-tertiary px-4 py-3 text-base text-onSurface focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
Select.displayName = "Select";

// ---------------------------------------------------------------------------
// Segmented Control
// ---------------------------------------------------------------------------
type SegmentedProps<T extends string> = {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  testID?: string;
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  testID,
}: SegmentedProps<T>) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-pill bg-brand-tertiary p-1"
      data-testid={testID}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          data-testid={`${testID}-${opt.value}`}
          onClick={() => onChange(opt.value)}
          className={clsx(
            "flex-1 rounded-pill px-4 py-2.5 text-sm font-bold transition-all",
            opt.value === value
              ? "bg-brand-primary text-on-brand-primary shadow-md"
              : "text-on-brand-tertiary hover:text-onSurface"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------
type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  testID?: string;
};

export function Stepper({ value, onChange, min = 1, max = 30, testID }: StepperProps) {
  return (
    <div className="flex items-center gap-4" data-testid={testID}>
      <button
        type="button"
        data-testid={`${testID}-minus`}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-surface-tertiary transition-all hover:bg-surface-tertiary/80 active:scale-95"
      >
        <span className="text-xl font-bold text-onSurface">−</span>
      </button>
      <span
        className="min-w-[40px] text-center text-2xl font-extrabold text-onSurface"
        data-testid={`${testID}-value`}
      >
        {value}
      </span>
      <button
        type="button"
        data-testid={`${testID}-plus`}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-primary text-on-brand-primary transition-all hover:bg-brand-primary/90 active:scale-95"
      >
        <span className="text-xl font-bold">+</span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------
type BadgeProps = {
  label: string;
  tone?: "success" | "warning" | "brand" | "neutral";
};

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const tones = {
    success: "bg-green-100 text-success",
    warning: "bg-yellow-100 text-yellow-800",
    brand: "bg-brand-secondary text-on-brand-secondary",
    neutral: "bg-surface-tertiary text-on-surface-tertiary",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold",
        tones[tone]
      )}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------
type AvatarProps = {
  name: string;
  size?: number;
};

export function Avatar({ name, size = 40 }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className="flex items-center justify-center rounded-full bg-brand-tertiary font-extrabold text-on-brand-tertiary"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials || "?"}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------
type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-border bg-surface-secondary p-6 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading / Empty states
// ---------------------------------------------------------------------------
export function Loader({ label }: { label?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8" data-testid="loader">
      <Loader2 size={32} className="animate-spin text-brand-primary" />
      {label && <p className="text-sm text-muted">{label}</p>}
    </div>
  );
}

export function EmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-8 text-center" data-testid="empty-state">
      <p className="text-lg font-extrabold text-onSurface">{title}</p>
      {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
    </div>
  );
}
