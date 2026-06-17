export function AppLogo({ title = "Cocal Campo" }: { title?: string }) {
  return (
    <div className="app-logo">
      <img src="/favicon.svg" alt="" width={36} height={36} />
      {title ? <span>{title}</span> : null}
    </div>
  );
}
