"use client";
import { ReactNode, HTMLAttributes } from "react";

export function Button(props: HTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props as any;
  return <button className={`btn ${className}`} {...rest} />;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function Input(props: HTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props as any;
  return <input className={`input ${className}`} {...rest} />;
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="label">{children}</label>;
}
