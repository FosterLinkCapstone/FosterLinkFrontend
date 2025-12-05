import { useEffect, useRef, useState } from 'react';
import type { FaqModel } from '../backend/models/FaqModel';
import { FaqCard } from '../components/faq/FaqCard';
import { useAuth } from '../backend/AuthContext';
import { faqApi } from '../backend/api/FaqApi';
import { Link, useSearchParams } from 'react-router';
import { Navbar } from '../components/Navbar';
import { FaqDialog } from '../components/faq/FaqDialog';
import { Button } from '@/components/ui/button';
import { CreateFaqCard } from '../components/faq/CreateFaqCard';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';
import type { ErrorWrapper } from '../util/ErrorWrapper';
import { StatusDialog } from '../components/StatusDialog';
import type { ApprovalCheckModel } from '../backend/models/ApprovalCheckModel';
import { CreateFaqRequestCard } from '../components/faq/CreateFaqRequestCard';
import type { FaqRequestModel } from '../backend/models/FaqRequestModel';

export const FaqHome = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchParams, _] = useSearchParams()
  const [detailFaq, setDetailFaq] = useState<FaqModel | null>(null);

  const [creatingSuggestion, setCreatingSuggestion] = useState(searchParams.get("suggesting") === "true")
  const [suggestionCreationError, setSuggestionCreationError] = useState<string | null>(null)

  const [creating, setCreating] = useState(false)
  const [requests, setRequests] = useState<FaqRequestModel[] | null>(null)
  const [getRequestsError, setRequestsError] = useState<string>('')

  const faqContent = useRef<string>('')

  const [faqs, setFaqs] = useState<FaqModel[]>([])
  const [createError, setCreateError] = useState<ErrorWrapper<undefined> | undefined>(undefined)
  const [createSuccessDialogOpen, setCreateSuccessDialogOpen] = useState<boolean>(false)
  const [createFailureDialogOpen, setCreateFailureDialogOpen] = useState<boolean>(false)
  const [faqRemoved, setFaqRemoved] = useState<boolean>(false)

  const [unapprovedFaqs, setUnapprovedFaqs] = useState<ApprovalCheckModel>({countDenied: 0, countPending: 0})
  
  const auth = useAuth()
  const faqApiRef = faqApi(auth);
    
  useEffect(() => {
        faqApiRef.getAll().then(res => {
            setFaqs(res)
            const opened = searchParams.get("openId")
            if (opened != null) {
                const faq = res.find(f => f.id == +opened)
                if (faq) handleShowDetail(faq)
            }
        })
    }, [])
    useEffect(() => {
      if (auth.admin || auth.faqAuthor) {
        faqApiRef.checkApprovalStatus().then(res => {
          setUnapprovedFaqs(res)
        })
        if (searchParams.has("creating")) {
          if (searchParams.get("creating") === "true") handleCreateFaq()
        }
      }
    }, [auth.admin, auth.faqAuthor])

  const handleExpand = (id: number) => {
    setExpandedId(id);
  };

  const handleCollapse = () => {
    setExpandedId(null);
  };

  const onRemove = (id: number) => {
    faqApiRef.approve(id, false).then(t => {
        if (t) {
          setFaqs(faqs.filter(f => f.id !== id))
          setFaqRemoved(true)
        }
    })
  }

  const handleShowDetail = (faq: FaqModel) => {
    if (faqContent.current == '') {
        faqApiRef.getContent(faq.id).then(c => {
          faqContent.current = c
          setDetailFaq(faq);
        })
    } else setDetailFaq(faq)
  };

  const handleSubmitFaqResponse = (title: string, summary: string, content: string, answeringId: number) => {
    
    if (answeringId !== -1) {
      const req = requests?.find(r => r.id === answeringId)
      if (req && req.suggestion === title) {
        faqApiRef.answerRequest(req.id).then(res => {
          if (!res) setCreateError({data: undefined, isError: true, error: "Internal server error answering request"})
        })
      }
    }
    if (title == '') {
      setCreateError({data: undefined, isError: true, error: "Please enter a title!"})
      return
    }
    if (summary == '') {
      setCreateError({data: undefined, isError: true, error: "Please enter a summary!"})
      return
    }
    if (content == '') {
      setCreateError({data: undefined, isError: true, error: "Please enter some content!"})
      return
    }
    faqApiRef.create(title, summary, content).then(data => {
      if (!data.isError) {
        setCreateSuccessDialogOpen(true)
      } else {
        setCreateError({...data, data: undefined})
        setCreateFailureDialogOpen(true)
      }
    })
  }

  const submitNewRequest = (suggestion: string) => {
    if (suggestion !== "") {
    faqApiRef.createRequest(suggestion).then(res => {
      setCreatingSuggestion(false)
      if (res) {
        setSuggestionCreationError('')
      } else {
        setSuggestionCreationError('Please try again later') // TODO
      }
    })
    }
  }

  const handleCreateFaq = () => {
    setCreating(true)
    faqApiRef.getRequests().then(res => {
      if (res.isError) {
        setRequests([])
        setRequestsError(res.error!)
      } else {
        setRequests(res.data!)
      }
    })
  }

  const handleCloseDetail = () => {
    setDetailFaq(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StatusDialog open={createSuccessDialogOpen} isSuccess={true} onOpenChange={setCreateSuccessDialogOpen} title='FAQ Response Created!' subtext='Now pending approval...'/>
      <StatusDialog open={createFailureDialogOpen} isSuccess={false} onOpenChange={setCreateFailureDialogOpen} title={createError?.error ?? "Unknown error"} subtext='Please try again later'/>
      <StatusDialog open={faqRemoved} isSuccess={true} onOpenChange={setFaqRemoved} title={"FAQ response successfully removed"} subtext='Moved back to pending requests'/>
      <StatusDialog open={getRequestsError != ''} onOpenChange={() => setRequestsError('')} isSuccess={false} title="Error loading requests" subtext={getRequestsError}/>
      {
        (suggestionCreationError !== null) && ((suggestionCreationError !== '') ? 
          <StatusDialog open={true} isSuccess={false} onOpenChange={() => setSuggestionCreationError(null)} title="Error creating FAQ request" subtext={suggestionCreationError}/>
        :
          <StatusDialog open={true} isSuccess={true} onOpenChange={() => setSuggestionCreationError(null)} title="FAQ Request Created!" subtext=''/>
        )
      }
      <CreateFaqRequestCard open={creatingSuggestion} onOpenChange={() => {
          setCreatingSuggestion(false)
        }} onSubmit={submitNewRequest}/>
      <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-center text-gray-400">
        <Navbar userInfo={auth.getUserInfo()}/>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h1>
        {
          (auth.faqAuthor || auth.admin) && <Alert variant="destructive" className='w-full mb-6 text-black bg-yellow-200'>
            <AlertCircleIcon/>
            <AlertTitle>You have {unapprovedFaqs.countPending} unapproved responses and {unapprovedFaqs.countDenied} denied responses. {auth.admin && <Link to="/faq/pending" className='text-blue-600'>View pending responses</Link>}</AlertTitle>
          </Alert>
        }
        {
          (auth.faqAuthor || auth.admin) && <Button className="w-full mb-6" variant='outline' onClick={handleCreateFaq}>Create</Button>
        }
        {
          creating && <CreateFaqCard handleSubmitResponse={handleSubmitFaqResponse} handleClose={() => {
          setCreating(false)
          setCreateError(undefined)
          }} requests={requests}/>
        }
        {
          (auth.isLoggedIn()) && <Button className='w-full mb-6' variant="outline" onClick={() => setCreatingSuggestion(true)}>Suggest a new FAQ response</Button>
        }

        { createError && 
          <Alert variant="destructive" className='text-red-600 bg-red-200 mb-6'>
            <AlertCircleIcon/>
            <AlertTitle>{createError?.error}</AlertTitle>
          </Alert>
        }
        {faqs.map((faq) => (
            <FaqCard
                key={faq.id}
                faq={faq}
                onExpand={() => handleExpand(faq.id)}
                onCollapse={handleCollapse}
                onShowDetail={() => handleShowDetail(faq)}
                expanded={expandedId === faq.id}
                canEdit={(auth.admin ? false : auth.admin!)}
                onRemove={onRemove}
            />
        ))}
        
      </div>
      <FaqDialog detailFaq={detailFaq} content={faqContent.current} handleOpenChange={handleCloseDetail}/>  
    </div>
  );
};