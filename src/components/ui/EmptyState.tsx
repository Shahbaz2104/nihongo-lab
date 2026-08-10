import type { ReactNode } from "react";

interface Props {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, body, action }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-panel/50 px-6 py-12 text-center">
      {icon && <div className="mb-1 text-3xl text-muted">{icon}</div>}
      <div className="text-sm font-semibold">{title}</div>
      {body && <p className="max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
