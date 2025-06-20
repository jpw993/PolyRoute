export function Footer() {
  return (
    <footer className="border-t bg-card py-6 text-center">
      <div className="container mx-auto">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} RouteAI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
