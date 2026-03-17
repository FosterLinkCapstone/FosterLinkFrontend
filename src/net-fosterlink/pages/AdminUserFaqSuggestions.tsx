import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../backend/AuthContext";
import { userApi } from "../backend/api/UserApi";
import type { AdminFaqSuggestionModel } from "../backend/models/AdminFaqSuggestionModel";
import { PageLayout } from "../components/PageLayout";
import { StatusDialog } from "../components/StatusDialog";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

function formatCreatedAt(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const AdminUserFaqSuggestions = () => {
  const { userId } = useParams<{ userId: string }>();
  const auth = useAuth();
  const apiRef = useRef(userApi(auth));
  apiRef.current = userApi(auth);

  const [suggestions, setSuggestions] = useState<AdminFaqSuggestionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    const id = userId ? parseInt(userId, 10) : NaN;
    if (!userId || isNaN(id)) {
      setError("Invalid user.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await apiRef.current.getFaqSuggestionsForUser(id);
    setLoading(false);
    if (!res.isError && res.data) {
      setSuggestions(res.data);
      if (res.data.length > 0 && res.data[0].suggestingUsername) {
        setUsername(res.data[0].suggestingUsername);
      }
    } else {
      setError(res.error ?? "Failed to load FAQ suggestions.");
      setSuggestions([]);
    }
  }, [userId]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return (
    <PageLayout auth={auth}>
      <title>FAQ suggestions – User</title>

      <StatusDialog
        open={!!error}
        onOpenChange={() => setError(null)}
        title={error ?? ""}
        subtext=""
        isSuccess={false}
      />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to User Management
        </Link>

        <h1 className="text-2xl font-bold mb-1">
          FAQ suggestions
          {username != null && (
            <span className="font-normal text-muted-foreground"> for @{username}</span>
          )}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          All FAQ suggestion requests submitted by this user.
        </p>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 h-24 animate-pulse bg-muted/30 rounded-xl" />
            ))}
          </div>
        )}

        {!loading && suggestions.length === 0 && !error && (
          <div className="text-center text-muted-foreground py-12 rounded-xl border border-dashed border-border bg-muted/20">
            No FAQ suggestions from this user.
          </div>
        )}

        {!loading && suggestions.length > 0 && (
          <div className="space-y-4 flex flex-col">
            {suggestions.map((item) => (
              <Card
                key={item.id}
                className="p-4 rounded-xl border-2 border-border bg-card text-card-foreground shadow-sm"
              >
                <p className="text-foreground leading-snug">{item.suggestion}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Created at {formatCreatedAt(item.createdAt)}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};
