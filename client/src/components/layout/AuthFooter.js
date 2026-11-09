export default function AuthFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant">
      <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className="font-headline-sm text-headline-sm text-primary font-bold uppercase">GigCraft</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            © {year} GigCraft Marketplace Inc.
          </span>
        </div>
        <div className="font-code-sm text-code-sm text-on-surface-variant">SECURE ACCESS PORTAL</div>
      </div>
    </footer>
  );
}