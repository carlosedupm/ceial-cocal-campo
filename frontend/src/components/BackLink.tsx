import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type BackLinkProps = {
  to: string;
  children?: ReactNode;
  variant?: "inline" | "bar";
  className?: string;
};

export function BackLink({
  to,
  children = "Voltar",
  variant = "inline",
  className = "",
}: BackLinkProps) {
  const classes = [
    variant === "bar" ? "nav-back nav-back-bar" : "nav-back nav-back-inline",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link to={to} className={classes} data-testid="nav-back">
      <span className="nav-back-icon" aria-hidden="true">
        ←
      </span>
      <span>{children}</span>
    </Link>
  );
}
