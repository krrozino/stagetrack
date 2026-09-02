import type { AuthActionState } from "../types";

type AuthMessageProps = {
  state: AuthActionState;
  notice?: string;
};

export function AuthMessage({ state, notice }: AuthMessageProps) {
  const message = state.message ?? notice;

  if (!message) {
    return null;
  }

  const isError = state.status === "error";
  const isSuccess = state.status === "success" || Boolean(notice);

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm leading-6 ${
        isError
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : isSuccess
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      {message}
    </div>
  );
}
