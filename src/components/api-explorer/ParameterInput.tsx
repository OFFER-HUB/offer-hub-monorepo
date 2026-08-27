import { cn } from "@/lib/cn";

interface ParameterInputProps {
  name: string;
  type: "string" | "number" | "select";
  required: boolean;
  description: string;
  placeholder?: string;
  options?: string[];
  value: string;
  onChange: (value: string) => void;
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
}: ParameterInputProps) {
  const inputId = `param-${name}`;

  const inputClasses = cn(
    "w-full rounded-xl px-3 py-2.5 text-sm font-medium",
    "bg-bg-sunken shadow-neu-sunken-subtle",
    "text-content-primary placeholder:text-content-muted",
    "border border-transparent transition-shadow duration-200",
    "focus-visible:outline-2 focus-visible:outline-theme-primary focus-visible:outline-offset-2",
    "focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-0"
  );

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="flex items-center gap-2">
        <span className="text-sm font-semibold font-mono text-content-primary">
          {name}
        </span>
        <span
          className={cn(
            "text-xs font-medium px-1.5 py-0.5 rounded",
            required ? "text-theme-error bg-theme-error/10" : "text-content-secondary bg-content-muted/10"
          )}
        >
          {required ? "required" : "optional"}
        </span>
      </label>
      <p className="text-xs text-content-secondary">
        {description}
      </p>

      {type === "select" && options ? (
        <select
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          type={type === "number" ? "number" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}
    </div>
  );
}
