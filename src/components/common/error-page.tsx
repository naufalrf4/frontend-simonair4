import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface ErrorPageProps {
  error: Error;
  reset?: () => void;
}

export function ErrorPage({ error, reset }: ErrorPageProps) {
  const { t } = useTranslation("common");
  const friendlyMessage = getFriendlyErrorMessage(error, t);

  // Simple navigation that works regardless of router context
  const goHome = () => {
    window.location.href = "/";
  };

  const reload = () => {
    window.location.reload();
  };

  const suggestions = t('errorPage.suggestions', {
    returnObjects: true,
  }) as string[];

  return (
    <div className="flex items-center justify-center min-h-screen bg-background/50">
      <Card className="w-full max-w-lg mx-auto shadow-lg border-muted">
        <CardHeader className="text-center pb-2">
          <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-14 h-14 text-destructive"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            {t("errorPage.title")}
          </CardTitle>
          <CardDescription className="mt-3 text-base">
            {friendlyMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="bg-muted/70 p-4 rounded-md overflow-x-auto">
            <p className="text-sm font-mono">{error.message}</p>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("errorPage.technicalDetails")}
                </summary>
                <pre className="mt-2 text-xs whitespace-pre-wrap overflow-x-auto">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {t("errorPage.suggestionsIntro")}
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
              {suggestions.map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-center gap-4 pt-2 pb-6">
          {reset && (
            <Button onClick={() => reset()} className="min-w-[120px]">
              {t("actions.tryAgain")}
            </Button>
          )}
          <Button onClick={goHome} variant="outline" className="min-w-[120px]">
            {t("actions.goHome")}
          </Button>
          <Button onClick={reload} variant="secondary" className="min-w-[120px]">
            {t("actions.reload")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function getFriendlyErrorMessage(
  error: Error,
  t: ReturnType<typeof useTranslation>["t"],
): string {
  if (error.message.includes("fetch") || error.message.includes("network")) {
    return t("errorPage.messages.network");
  }

  if (error.message.includes("timeout")) {
    return t("errorPage.messages.timeout");
  }

  if (
    error.message.includes("permission") ||
    error.message.includes("denied")
  ) {
    return t("errorPage.messages.permission");
  }

  return t("errorPage.messages.generic");
}
