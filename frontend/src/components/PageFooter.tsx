import { BackLink } from "@/components/BackLink";

export function PageFooter({
  backTo,
  backLabel = "Voltar",
}: {
  backTo: string;
  backLabel?: string;
}) {
  return (
    <footer className="page-footer">
      <BackLink to={backTo} variant="bar">
        {backLabel}
      </BackLink>
    </footer>
  );
}
