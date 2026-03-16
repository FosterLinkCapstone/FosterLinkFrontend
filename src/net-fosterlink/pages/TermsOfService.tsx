import { useAuth } from "../backend/AuthContext";
import { PageLayout } from "../components/PageLayout";

/** Shared body content for Terms of Service (used on full page and in dialogs). */
export const TermsOfServiceContent = () => (
    <p className="text-muted-foreground leading-relaxed">
        This terms of service is currently being drafted. Please check back soon.
    </p>
);

export const TermsOfService = () => {
    const auth = useAuth();

    return (
        <PageLayout auth={auth}>
            <title>Terms of Service | FosterLink</title>
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-8">
                    <h1 className="text-3xl font-bold mb-4 text-foreground">Terms of Service</h1>
                    <TermsOfServiceContent />
                </div>
            </div>
        </PageLayout>
    );
};
