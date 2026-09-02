type AuthFieldProps = {
  id: string;
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  placeholder?: string;
  error?: string;
};

export function AuthField({
  id,
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  error,
}: AuthFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-800">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 aria-[invalid=true]:border-rose-400 aria-[invalid=true]:focus:border-rose-500 aria-[invalid=true]:focus:ring-rose-500/10"
      />
      {error ? (
        <p id={errorId} className="mt-2 text-sm text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
