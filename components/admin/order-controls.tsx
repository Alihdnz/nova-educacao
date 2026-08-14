"use client";

import { ArrowDown, ArrowUp, LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

import { buttonVariants } from "@/components/ui/button";

function OrderButton({ direction, disabled }: { direction: "down" | "up"; disabled: boolean }) {
  const { pending } = useFormStatus();
  const label = direction === "up" ? "Mover para cima" : "Mover para baixo";
  const Icon = direction === "up" ? ArrowUp : ArrowDown;

  return (
    <button
      aria-label={label}
      className={buttonVariants({ size: "icon", variant: "ghost" })}
      disabled={disabled || pending}
      title={label}
      type="submit"
    >
      {pending ? (
        <LoaderCircle aria-hidden="true" className="animate-spin" />
      ) : (
        <Icon aria-hidden="true" />
      )}
    </button>
  );
}

export function OrderControls({
  downAction,
  first,
  last,
  upAction,
}: {
  downAction: () => Promise<void>;
  first: boolean;
  last: boolean;
  upAction: () => Promise<void>;
}) {
  return (
    <div className="flex items-center gap-1">
      <form action={upAction}>
        <OrderButton direction="up" disabled={first} />
      </form>
      <form action={downAction}>
        <OrderButton direction="down" disabled={last} />
      </form>
    </div>
  );
}
