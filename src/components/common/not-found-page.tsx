import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  return (
    <div className="flex items-center justify-center min-h-screen bg-background/50">
      <Card className="w-full max-w-lg mx-auto shadow-lg border-muted">
        <CardHeader className="text-center pb-2">
          <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-14 h-14 text-primary"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            {t("notFound.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="bg-muted/70 p-4 rounded-md">
            <p className="text-sm font-medium text-muted-foreground text-center">
              {t("notFound.description")}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-center gap-4 pt-2 pb-6">
          <Button
            onClick={() => navigate({ to: '..' })}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto cursor-pointer"
            asChild
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>{t("actions.back")}</span>
            </div>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
