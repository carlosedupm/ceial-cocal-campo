import { useEffect, useState } from "react";
import { COPY } from "@/lib/ui/copy";

const DISMISS_KEY = "cocal_pwa_install_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(
    () => typeof localStorage !== "undefined" && localStorage.getItem(DISMISS_KEY) === "1"
  );

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (hidden || !deferred) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setHidden(true);
    setDeferred(null);
  }

  return (
    <div className="install-prompt" data-testid="install-prompt">
      <p>Instale o Cocal Campo na tela inicial para uso offline no campo.</p>
      <div className="install-prompt-actions">
        <button type="button" onClick={() => void install()}>
          {COPY.installPwa}
        </button>
        <button type="button" className="secondary" onClick={dismiss}>
          {COPY.installPwaDismiss}
        </button>
      </div>
    </div>
  );
}
