import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { FaqModel } from "../../backend/models/FaqModel";
import type { GetFaqsResponse } from "../../backend/models/api/GetFaqsResponse";
import { Paginator } from "../Paginator";
import { FaqDialog } from "../faq/FaqDialog";

interface UserFaqSectionProps {
  faqAuthor: boolean;
  faqResponses: FaqModel[];
  faqsTotalPages: number;
  faqsCurrentPage: number;
  onCurrentPageChange: React.Dispatch<React.SetStateAction<number>>;
  onPageChanged: (page: number) => Promise<GetFaqsResponse>;
  onDataChanged: (data: GetFaqsResponse) => void;
  onViewFaq: (faq: FaqModel) => void;
  detailFaq: FaqModel | null;
  detailFaqContent: string;
  onCloseFaqDialog: () => void;
}

export const UserFaqSection = ({
  faqAuthor,
  faqResponses,
  faqsTotalPages,
  faqsCurrentPage,
  onCurrentPageChange,
  onPageChanged,
  onDataChanged,
  onViewFaq,
  detailFaq,
  detailFaqContent,
  onCloseFaqDialog,
}: UserFaqSectionProps) => {
  const showSection = faqAuthor || (faqResponses && faqResponses.length > 0);

  return (
    <>
      {showSection && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">FAQ Responses</h2>
          <div className="space-y-3">
            {faqResponses.length === 0 ? (
              <div className="text-center text-muted-foreground py-6">
                This user hasn't written any FAQ responses yet.
              </div>
            ) : (
              faqResponses.map((faq) => (
                <Card key={faq.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{faq.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{faq.summary}</p>
                      <Button
                        variant="outline"
                        onClick={() => onViewFaq(faq)}
                        className="text-sm"
                      >
                        View More
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {faqsTotalPages > 1 && (
            <Paginator<GetFaqsResponse>
              pageCount={faqsTotalPages}
              currentPage={faqsCurrentPage}
              setCurrentPage={onCurrentPageChange}
              onDataChanged={onDataChanged}
              onPageChanged={onPageChanged}
            />
          )}
        </div>
      )}

      <FaqDialog
        detailFaq={detailFaq}
        content={detailFaqContent}
        handleOpenChange={onCloseFaqDialog}
      />
    </>
  );
};
