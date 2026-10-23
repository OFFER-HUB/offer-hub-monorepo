import type { ChangeEventHandler } from "react";

export function HoneypotField({ id, value, onChange }: {
  id: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
      <label htmlFor={id}>Leave this field empty</label>
      <input id={id} name="website" type="text" value={value} onChange={onChange}
        tabIndex={-1} autoComplete="off" />
    </div>
  );
}
