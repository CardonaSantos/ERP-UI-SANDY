import { BackButtonERP } from "./back-button";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  fallbackBackTo?: string;
  actions?: React.ReactNode;
  sticky?: boolean;
};

export function PageHeaderERP({
  title,
  subtitle,
  fallbackBackTo = "/",
  actions,
  sticky = false,
}: PageHeaderProps) {
  return (
    <div
      className={
        sticky
          ? "sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
          : ""
      }
    >
      <div className="container mx-auto px-2 py-1">
        <div className="flex items-center gap-3 ">
          <BackButtonERP fallback={fallbackBackTo} />
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
