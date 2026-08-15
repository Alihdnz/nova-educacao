import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function NovaLogo({
  className,
  compact = false,
  href,
  inverted = false,
  priority = false,
}: {
  className?: string;
  compact?: boolean;
  href?: string;
  inverted?: boolean;
  priority?: boolean;
}) {
  const logo = (
    <Image
      alt="NOVA — conhecimento que move você"
      className={cn(
        "h-auto object-contain object-left",
        compact ? "w-10 object-[left_center]" : "w-36",
        className,
      )}
      height={compact ? 512 : 190}
      priority={priority}
      src={compact ? "/assets/icon.png" : inverted ? "/assets/logo.png" : "/assets/logo-negative.png"}
      width={compact ? 512 : 768}
    />
  );

  return href ? (
    <Link aria-label="NOVA" className="nova-focus inline-flex" href={href}>
      {logo}
    </Link>
  ) : (
    logo
  );
}
