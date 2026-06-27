type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <span className={`brand-logo ${className}`} aria-label="hondit">
      <img src="/images/hondit-logo-transparent.png" alt="" width="637" height="244" decoding="async" />
    </span>
  );
}
