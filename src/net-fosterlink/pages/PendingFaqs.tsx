import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ApprovalStatus, type PendingFaqModel } from "../backend/models/PendingFaqModel";
import { useAuth } from "../backend/AuthContext";
import { faqApi } from "../backend/api/FaqApi";
import { Navbar } from "../components/Navbar";
import { FaqDialog } from "../components/faq/FaqDialog";
import { PendingFaqCard } from "../components/faq/PendingFaqCard";
import { StatusDialog } from "../components/StatusDialog";

export const PendingFaqs = () => {
      const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchParams, _] = useSearchParams()
  const [detailFaq, setDetailFaq] = useState<PendingFaqModel | null>(null);
  const faqContent = useRef<string>('')
  const [faqs, setFaqs] = useState<PendingFaqModel[]>([])
  const [approvedOrDenied, setApprovedOrDenied] = useState<string>('')
  const auth = useAuth()
  const faqApiRef = faqApi(auth);
    useEffect(() => {
        faqApiRef.getPending().then(res => {
            setFaqs(res)
            const opened = searchParams.get("openId")
            console.log(opened)
            if (opened != null) {
                const faq = res.find(f => f.id == +opened)
                console.log(faq?.id)
                if (faq) handleShowDetail(faq)
            }
        })
    }, [])

  const handleExpand = (id: number) => {
    setExpandedId(id);
  };

  const handleCollapse = () => {
    setExpandedId(null);
  };

  const handleShowDetail = (faq: PendingFaqModel) => {
    if (faqContent.current == '') {
        faqApiRef.getContent(faq.id).then(c => {
          faqContent.current = c
          setDetailFaq(faq);
        })
    } else setDetailFaq(faq)
  };

  const handleCloseDetail = () => {
    setDetailFaq(null);
  };
  const handleApprove = (faq: PendingFaqModel) => {
    faqApiRef.approve(faq.id, true).then(t => {
        if (t) {
          setFaqs(faqs.filter(f => f.id !== faq.id))
          setApprovedOrDenied("approved")
        } else {
            alert("Error approving!")
        }
    })
  }
  const handleDeny = (faq: PendingFaqModel) => {
        faqApiRef.approve(faq.id, false).then(t => {
        if (t) {
            faq.approvalStatus = ApprovalStatus.DENIED
            faq.deniedByUsername = auth.getUserInfo()!.username
            setApprovedOrDenied("denied")

        } else {
            alert("Error denying!")
        }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
                  <StatusDialog open={approvedOrDenied != ''}
                        onOpenChange={() => setApprovedOrDenied('')}
                        title={`Successfully ${approvedOrDenied} FAQ response`}
                        subtext=""
                        isSuccess={true}
                />
      <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-center text-gray-400">
        <Navbar userInfo={auth.getUserInfo()}/>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-1 text-center">Frequently Asked Questions (pending)</h1>
        <Link to="/faq" className="text-blue-600 hover:text-blue-800">Go back</Link>
        <div className="mb-6"></div> {/* spacer */}
        
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
      </div>
      <FaqDialog detailFaq={detailFaq ? {id: detailFaq.id, title: detailFaq.title, summary: detailFaq.summary, createdAt: detailFaq.createdAt, updatedAt: detailFaq.updatedAt, author: detailFaq.author, approvedByUsername: detailFaq?.deniedByUsername ?? ''} : null} content={faqContent.current} handleOpenChange={handleCloseDetail}/>  
    </div>
  );
}