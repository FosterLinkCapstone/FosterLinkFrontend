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
import { FaqCardSkeleton } from '../components/faq/FaqCardSkeleton';

export const FaqHome = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchParams, _] = useSearchParams()
  const [detailFaq, setDetailFaq] = useState<FaqModel | null>(null);

  const [creatingSuggestion, setCreatingSuggestion] = useState(searchParams.get("suggesting") === "true")
  const [suggestionCreationError, setSuggestionCreationError] = useState<string | null>(null)
  const [suggestionFieldErrors, setSuggestionFieldErrors] = useState<{[key: string]: string}>({})

  const [creating, setCreating] = useState(false)
  const [requests, setRequests] = useState<FaqRequestModel[] | null>(null)
  const [getRequestsError, setRequestsError] = useState<string>('')

  const faqContent = useRef<string>('')

  const [faqs, setFaqs] = useState<FaqModel[]>([])
  const [createError, setCreateError] = useState<ErrorWrapper<undefined> | undefined>(undefined)
  const [createSuccessDialogOpen, setCreateSuccessDialogOpen] = useState<boolean>(false)
  const [createFailureDialogOpen, setCreateFailureDialogOpen] = useState<boolean>(false)
  const [faqRemoved, setFaqRemoved] = useState<boolean>(false)

  const [loading, setLoading] = useState<boolean>(true)

  const [unapprovedFaqs, setUnapprovedFaqs] = useState<ApprovalCheckModel>({countDenied: 0, countPending: 0})
  
  const auth = useAuth()
  const faqApiRef = faqApi(auth);
    
  useEffect(() => {
    setLoading(true)
        faqApiRef.getAll().then(res => {
            if (!res.isError && res.data) {
                setFaqs(res.data)
                const opened = searchParams.get("openId")
                if (opened != null) {
                    const faq = res.data.find(f => f.id == +opened)
                    if (faq) handleShowDetail(faq)
                }
            }
        }).finally(() => { setLoading(false) })
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
    faqApiRef.approve(id, false).then(res => {
        if (!res.isError && res.data) {
          setFaqs(faqs.filter(f => f.id !== id))
          setFaqRemoved(true)
        }
    })
  }

  const handleShowDetail = (faq: FaqModel) => {
    if (faqContent.current == '') {
        faqApiRef.getContent(faq.id).then(res => {
          if (!res.isError && res.data) {
            faqContent.current = res.data
            setDetailFaq(faq);
          }
        })
    } else setDetailFaq(faq)
  };

  const handleSubmitFaqResponse = async (title: string, summary: string, content: string, answeringId: number) => {
    if (answeringId !== -1) {
      const req = requests?.find(r => r.id === answeringId)
      if (req && req.suggestion === title) {
        faqApiRef.answerRequest(req.id).then(res => {
          if (res.isError) {
            setCreateError({data: undefined, isError: true, error: res.error || "Internal server error answering request"})
          }
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

  const submitNewRequest = async (suggestion: string) => {
    if (suggestion !== "") {
      setSuggestionFieldErrors({})
      faqApiRef.createRequest(suggestion).then(res => {
        if (!res.isError && res.data) {
          setCreatingSuggestion(false)
          setSuggestionCreationError('')
        } else {
          setSuggestionCreationError(res.error || 'Please try again later')
          if (res.validationErrors) {
            const next: { [key: string]: string } = {}
            res.validationErrors.forEach(e => { next[e.field] = e.message })
            setSuggestionFieldErrors(next)
          }
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
    <div className="min-h-screen bg-background">
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
      <CreateFaqRequestCard
        open={creatingSuggestion}
        onOpenChange={() => {
          setCreatingSuggestion(false)
          setSuggestionFieldErrors({})
        }}
        onSubmit={submitNewRequest}
        serverFieldErrors={Object.keys(suggestionFieldErrors).length > 0 ? suggestionFieldErrors : undefined}
      />
      <div className="bg-background border-b border-border h-16 flex items-center justify-center text-muted-foreground">
        <Navbar userInfo={auth.getUserInfo()}/>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h1>
        {
          (auth.faqAuthor || auth.admin) && <Alert variant="default" className='w-full mb-6 bg-amber-200 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700'>
            <AlertCircleIcon/>
            <AlertTitle>You have {unapprovedFaqs.countPending} unapproved responses and {unapprovedFaqs.countDenied} denied responses. {auth.admin && <Link to="/faq/pending" className='text-primary hover:text-primary/90 font-medium'>View pending responses</Link>}</AlertTitle>
          </Alert>
        }
        {
          (auth.faqAuthor || auth.admin) && <Button className="w-full mb-6" variant='outline' onClick={handleCreateFaq}>Create</Button>
        }
        {
          creating && <CreateFaqCard
            handleSubmitResponse={handleSubmitFaqResponse}
            handleClose={() => {
              setCreating(false)
              setCreateError(undefined)
            }}
            requests={requests}
            serverFieldErrors={createError?.validationErrors
              ? Object.fromEntries(createError.validationErrors.map(e => [e.field, e.message]))
              : undefined}
          />
        }
        {
          (auth.isLoggedIn()) && <Button className='w-full mb-6' variant="outline" onClick={() => setCreatingSuggestion(true)}>Suggest a new FAQ response</Button>
        }

        { createError && 
          <Alert variant="destructive" className='text-destructive bg-destructive/10 border-destructive/30 mb-6'>
            <AlertCircleIcon/>
            <AlertTitle>{createError?.error}</AlertTitle>
          </Alert>
        }

        { loading &&
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <FaqCardSkeleton key={i} />
            ))}
          </div>
        }

        {!loading && faqs.length == 0 ? <h2 className="text-2xl font-bold my-2 text-center">No content!</h2> : faqs.map((faq) => (
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