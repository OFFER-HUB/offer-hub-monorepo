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

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="flex items-center gap-2">
        <span
          className="text-sm font-semibold font-mono"
          style={{ color: "#19213D" }}
        >
          {name}
        </span>
        <span
          className="text-xs font-medium px-1.5 py-0.5 rounded"
          style={{
            color: required ? "#dc2626" : "#6D758F",
            background: required ? "rgba(220,38,38,0.08)" : "rgba(109,117,143,0.08)",
          }}
        >
          {required ? "required" : "optional"}
        </span>
      </label>
      <p className="text-xs" style={{ color: "#6D758F" }}>
        {description}
      </p>

      {type === "select" && options ? (
        <select
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-xl border px-3 py-2 text-sm",
            "outline-none transition-all duration-200",
            "focus:ring-2 focus:ring-[#149A9B] focus:border-transparent"
          )}
          style={{ borderColor: "#e5e7eb", color: "#19213D" }}
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
          className={cn(
            "w-full rounded-xl border px-3 py-2 text-sm",
            "outline-none transition-all duration-200",
            "focus:ring-2 focus:ring-[#149A9B] focus:border-transparent"
          )}
          style={{ borderColor: "#e5e7eb", color: "#19213D" }}
        />
      )}
    </div>
  );
}
