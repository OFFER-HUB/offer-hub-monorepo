import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/Input";

interface ParameterInputProps {
  name: string;
  type: "string" | "number" | "select";
  required: boolean;
  description: string;
  placeholder?: string;
  options?: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ParameterInput({
  name,
  type,
  required,
  description,
  placeholder,
  options,
  value,
  onChange,
  error,
}: ParameterInputProps) {
  const inputId = `param-${name}`;
  const labelId = `${inputId}-label`;
  const descriptionId = `${inputId}-description`;

  const inputClasses = cn(
    "px-3 py-2.5 text-sm font-medium",
    "border border-transparent"
  );

  return (
    <div className="space-y-1.5">
      <div id={labelId} className="flex items-center gap-2">
        <label htmlFor={inputId} className="text-sm font-semibold font-mono text-content-primary">
          {name}
        </label>
        <span
          className={cn(
            "text-xs font-medium px-1.5 py-0.5 rounded",
            required ? "text-theme-error bg-theme-error/10" : "text-content-secondary bg-content-muted/10"
          )}
        >
          {required ? "required" : "optional"}
        </span>
      </div>
      <p id={descriptionId} className="text-xs text-content-secondary">
        {description}
      </p>

      {type === "select" && options ? (
        <select
          id={inputId}
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
          aria-invalid={error ? "true" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-xl px-3 py-2.5 text-sm font-medium",
            "bg-bg-sunken shadow-neu-sunken-subtle",
            "text-content-primary",
            "border border-transparent transition-all duration-200",
            "focus-visible:outline-2 focus-visible:outline-theme-primary focus-visible:outline-offset-2",
            "focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-0",
            error && "ring-2 ring-theme-error"
          )}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <Input
          id={inputId}
          labelledBy={labelId}
          aria-describedby={descriptionId}
          type={type === "number" ? "number" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          error={error}
          hideWrapper
          className={inputClasses}
        />
      )}
      {error && type === "select" && (
        <span id={`${inputId}-error`} className="text-sm text-theme-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
