type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <span className={`brand-logo brand-logo--wordmark ${className}`} aria-label="hondit">
      hondit.
    </span>
  );
}
