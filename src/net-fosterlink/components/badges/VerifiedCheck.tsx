import { CheckCircle2 } from "lucide-react";

interface VerifiedCheckProps {
  className?: string;
}

export const VerifiedCheck: React.FC<VerifiedCheckProps> = ({ className }) => {
  return (
    <span
      className={`${className} justify-center items-center inline-block`}
      title="User is a manually verified foster parent or professional"
      aria-label="Verified user"
    >
      <CheckCircle2
        className="h-full w-full text-muted-foreground fill-primary"
        aria-hidden="true"
        focusable={false}
      />
    </span>
  );
};