import { BackLink } from "@/components/BackLink";
import { Link } from "react-router-dom";

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  backTo,
  backLabel = "Voltar",
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  backTo?: string;
  backLabel?: string;
}) {
  return (
    <header className="page-header">
      {backTo && (
        <div className="page-header-nav">
          <BackLink to={backTo}>{backLabel}</BackLink>
        </div>
      )}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="breadcrumb" aria-label="Navegação">
          {breadcrumbs.map((item, i) => (
            <span key={`${item.label}-${i}`}>
              {i > 0 && <span className="breadcrumb-sep"> › </span>}
              {item.to ? (
                <Link to={item.to}>{item.label}</Link>
              ) : (
                <span>{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <h1>{title}</h1>
      {subtitle && <p className="subtitle">{subtitle}</p>}
    </header>
  );
}
