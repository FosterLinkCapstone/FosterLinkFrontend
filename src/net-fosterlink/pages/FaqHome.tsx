import { useEffect, useRef, useState } from 'react';
import type { FaqModel } from '../backend/models/FaqModel';
import { FaqCard } from '../components/faq/FaqCard';
import { useAuth } from '../backend/AuthContext';
import { faqApi } from '../backend/api/FaqApi';
import { useSearchParams } from 'react-router';
import { Navbar } from '../components/Navbar';
import { FaqDialog } from '../components/faq/FaqDialog';

export const FaqHome = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchParams, _] = useSearchParams()
  const [detailFaq, setDetailFaq] = useState<FaqModel | null>(null);
  const faqContent = useRef<string>('')
  const [faqs, setFaqs] = useState<FaqModel[]>([])
  const auth = useAuth()
  const faqApiRef = faqApi(auth);
    useEffect(() => {
        faqApiRef.getAll().then(res => {
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

  const handleShowDetail = (faq: FaqModel) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-center text-gray-400">
        <Navbar userInfo={auth.getUserInfo()}/>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h1>
        
        {faqs.map((faq) => (
            <FaqCard
                key={faq.id}
                faq={faq}
                onExpand={() => handleExpand(faq.id)}
                onCollapse={handleCollapse}
                onShowDetail={() => handleShowDetail(faq)}
                expanded={expandedId === faq.id}
            />
        ))}
      </div>
      <FaqDialog detailFaq={detailFaq} content={faqContent.current} handleOpenChange={handleCloseDetail}/>  
    </div>
  );
};