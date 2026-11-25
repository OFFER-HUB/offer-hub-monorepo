import { Field } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";

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
  /** Scopes the generated id to the owning operation - every panel is kept
   * mounted (just collapsed) while the page is open, so a bare `param-${name}`
   * id collides across the many endpoints that share a parameter name like
   * "id" or "limit". */
  idPrefix: string;
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
  idPrefix,
}: ParameterInputProps) {
  const inputId = `param-${idPrefix}-${name}`;
  const shared = {
    id: inputId,
    label: name,
    // Parameter names are case-sensitive identifiers: mono, no uppercase.
    labelClassName: "font-mono text-sm normal-case tracking-normal",
    labelExtra: (
      <StatusBadge variant={required ? "danger" : "default"}>
        {required ? "required" : "optional"}
      </StatusBadge>
    ),
    hint: description,
    error,
    className: "font-mono text-sm",
  };

  if (type === "select" && options) {
    return (
      <Field {...shared} as="select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </Field>
    );
  }

  return (
    <Field
      {...shared}
      type={type === "number" ? "number" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}
