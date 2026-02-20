import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ApprovalStatus, type PendingFaqModel } from "../backend/models/PendingFaqModel";
import { useAuth } from "../backend/AuthContext";
import { faqApi } from "../backend/api/FaqApi";
import { Navbar } from "../components/Navbar";
import { FaqDialog } from "../components/faq/FaqDialog";
import { PendingFaqCard } from "../components/faq/PendingFaqCard";
import { StatusDialog } from "../components/StatusDialog";
import { FaqCardSkeleton } from "../components/faq/FaqCardSkeleton";
import { Paginator } from "../components/Paginator";

export const PendingFaqs = () => {
      const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchParams, _] = useSearchParams()
  const [detailFaq, setDetailFaq] = useState<PendingFaqModel | null>(null);
  const faqContent = useRef<string>('')
  const [faqs, setFaqs] = useState<PendingFaqModel[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [approvedOrDenied, setApprovedOrDenied] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const auth = useAuth()
  const faqApiRef = faqApi(auth);
    useEffect(() => {
        setLoading(true)
        faqApiRef.getPending(0).then(res => {
            if (!res.isError && res.data) {
                setFaqs(res.data.faqs)
                setTotalPages(res.data.totalPages)
                setCurrentPage(1)
                const opened = searchParams.get("openId")
                if (opened != null) {
                    const faq = res.data.faqs.find(f => f.id == +opened)
                    if (faq) handleShowDetail(faq)
                }
            }
        }).finally(() => { setLoading(false) })
    }, [])

  const handleExpand = (id: number) => {
    setExpandedId(id);
  };

  const handleCollapse = () => {
    setExpandedId(null);
  };

  const handleShowDetail = (faq: PendingFaqModel) => {
    if (faqContent.current == '') {
        faqApiRef.getContent(faq.id).then(res => {
          if (!res.isError && res.data) {
            faqContent.current = res.data
            setDetailFaq(faq);
          }
        })
    } else setDetailFaq(faq)
  };

  const handleCloseDetail = () => {
    setDetailFaq(null);
  };
  const handleApprove = (faq: PendingFaqModel) => {
    faqApiRef.approve(faq.id, true).then(res => {
        if (!res.isError && res.data) {
          setFaqs(faqs.filter(f => f.id !== faq.id))
          setApprovedOrDenied("approved")
        } else {
            alert(res.error || "Error approving!")
        }
    })
  }
  const handleDeny = (faq: PendingFaqModel) => {
        faqApiRef.approve(faq.id, false).then(res => {
        if (!res.isError && res.data) {
            faq.approvalStatus = ApprovalStatus.DENIED
            faq.deniedByUsername = auth.getUserInfo()!.username
            setApprovedOrDenied("denied")

        } else {
            alert(res.error || "Error denying!")
        }
    })
  }

  return (
    <div className="min-h-screen bg-background">
                  <StatusDialog open={approvedOrDenied != ''}
                        onOpenChange={() => setApprovedOrDenied('')}
                        title={`Successfully ${approvedOrDenied} FAQ response`}
                        subtext=""
                        isSuccess={true}
                />
      <div className="bg-background border-b border-border h-16 flex items-center justify-center text-muted-foreground">
        <Navbar userInfo={auth.getUserInfo()}/>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-1 text-center">Frequently Asked Questions (pending)</h1>
        <Link to="/faq" className="text-primary hover:text-primary/90">Go back</Link>
        <div className="mb-6"></div> {/* spacer */}
        
        {loading && <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <FaqCardSkeleton key={i} />
            ))}
          </div>}

        {faqs.length == 0 ? <h2 className="text-2xl font-bold my-2 text-center">No content!</h2> : faqs.map((faq) => (
            <PendingFaqCard
                key={faq.id}
                faq={faq}
                onExpand={() => handleExpand(faq.id)}
                onCollapse={handleCollapse}
                onShowDetail={() => handleShowDetail(faq)}
                expanded={expandedId === faq.id}
                onApprove={handleApprove}
                onDeny={handleDeny}
            />
        ))}

        <Paginator<PendingFaqModel[]>
          pageCount={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onDataChanged={setFaqs}
          onPageChanged={async (pageNum) => {
            const res = await faqApiRef.getPending(pageNum - 1);
            if (res.data) {
              setTotalPages(res.data.totalPages);
              return res.data.faqs;
            }
            return [];
          }}
        />
      </div>
      <FaqDialog detailFaq={detailFaq ? {id: detailFaq.id, title: detailFaq.title, summary: detailFaq.summary, createdAt: detailFaq.createdAt, updatedAt: detailFaq.updatedAt, author: detailFaq.author, approvedByUsername: detailFaq?.deniedByUsername ?? ''} : null} content={faqContent.current} handleOpenChange={handleCloseDetail}/>  
    </div>
  );
}