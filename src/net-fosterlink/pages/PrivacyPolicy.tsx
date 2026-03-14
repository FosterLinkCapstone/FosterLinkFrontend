import { useAuth } from "../backend/AuthContext";
import { PageLayout } from "../components/PageLayout";

export const PrivacyPolicy = () => {
    const auth = useAuth();

    return (
        <PageLayout auth={auth}>
            <title>Privacy Policy | FosterLink</title>
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-8">
                    <h1 className="text-3xl font-bold mb-4 text-foreground">Privacy Policy</h1>
                    <p className="text-muted-foreground leading-relaxed">
                        This privacy policy is currently being drafted. Please check back soon.
                    </p>
                </div>
            </div>
        </PageLayout>
    );
};
