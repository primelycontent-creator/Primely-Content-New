import BrandShell from "@/components/brand/BrandShell";

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return <BrandShell>{children}</BrandShell>;
}
