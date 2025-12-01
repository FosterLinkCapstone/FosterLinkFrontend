import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { PendingFaqModel } from "../backend/models/PendingFaqModel";
import { useAuth } from "../backend/AuthContext";
import { faqApi } from "../backend/api/FaqApi";
import { Navbar } from "../components/Navbar";
import { FaqDialog } from "../components/faq/FaqDialog";
import { PendingFaqCard } from "../components/faq/PendingFaqCard";

export const PendingFaqs = () => {
      const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchParams, _] = useSearchParams()
  const [detailFaq, setDetailFaq] = useState<PendingFaqModel | null>(null);
  const faqContent = useRef<string>('')
  const [faqs, setFaqs] = useState<PendingFaqModel[]>([])
  const auth = useAuth()
  const navigate = useNavigate()
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
            navigate(`/faq?openId=${faq.id}`)
        } else {
            alert("Error approving!")
        }
    })
  }
  const handleDeny = (faq: PendingFaqModel) => {
        faqApiRef.approve(faq.id, false).then(t => {
        if (t) {
            alert("Successfully denied FAQ response")
        } else {
            alert("Error denying!")
        }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-center text-gray-400">
        <Navbar userInfo={auth.getUserInfo()}/>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h1>
        
        {faqs.map((faq) => (
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
      <FaqDialog detailFaq={detailFaq} content={faqContent.current} handleOpenChange={handleCloseDetail}/>  
    </div>
  );
}