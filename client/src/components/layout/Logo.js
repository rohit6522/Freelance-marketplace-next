import Link from "next/link";
import Image from "next/image";

export default function Logo({ href = "/gigs" }) {
  return (
    <Link href={href} className="flex items-center gap-space-xs">
      <Image
        src="/logo.svg"
        alt="GigCraft logo"
        width={32}
        height={32}
        unoptimized
        priority
        className="h-8 w-auto object-contain"
      />
      <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight uppercase">
        GigCraft
      </span>
    </Link>
  );
}