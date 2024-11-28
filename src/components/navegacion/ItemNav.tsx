'use client';
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { usePathname } from "next/navigation";

interface ItemNavProps {
  href: string
  children: React.ReactNode
  className?: string
}

const ItemNav = ({ href, children, className }: ItemNavProps) => {
  const pathname = usePathname();

  const active = pathname === href;


  return (
    <Link
      href={href}
      className={cn(
        `text-sm py-1 px-2 rounded font-medium ${active ? 'bg-white text-black' : 'text-white'} hover:bg-muted hover:text-foreground`,
        className
      )}
    >
      {children}
    </Link>
  )
}

export default ItemNav

