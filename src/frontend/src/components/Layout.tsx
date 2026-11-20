import { SignInButton } from "@/components/InternetIdentity";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Boxes } from "lucide-react";
import type { ReactNode } from "react";

const APP_NAME = "跨境代购订单管理";

export function Layout({ children }: { children: ReactNode }) {
  const { identity } = useInternetIdentity();
  const principal =
    identity && !identity.getPrincipal().isAnonymous()
      ? identity.getPrincipal().toText()
      : undefined;
  const initials = principal ? principal.slice(0, 2).toUpperCase() : "访";
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-subtle"
            >
              <Boxes className="size-5" strokeWidth={1.75} />
            </span>
            <span className="truncate font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {APP_NAME}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 py-1.5 sm:flex">
              <span className="text-xs font-medium text-muted-foreground">
                汇率
              </span>
              <span className="font-mono text-xs font-semibold text-foreground">
                1 USD = 0.048 CNY
              </span>
            </div>
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-secondary font-display text-xs font-semibold text-secondary-foreground"
            >
              {initials}
            </span>
            <SignInButton className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-smooth hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>

      <footer className="border-t border-border bg-muted/40">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {year} {APP_NAME}
          </p>
          <p>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 transition-smooth hover:text-foreground hover:underline"
            >
              © {year}. Built with love using caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
