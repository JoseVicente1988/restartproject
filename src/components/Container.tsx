import { ReactNode } from "react";

export default function Container({ children }: { children: ReactNode }) {
  return <div className="container py-6">{children}</div>;
}
