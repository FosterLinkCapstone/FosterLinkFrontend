import { useEffect, useMemo, useRef, useState } from 'react';
import type { FaqModel } from '../backend/models/FaqModel';
import { FaqCard } from '../components/faq/FaqCard';
import { useAuth } from '../backend/AuthContext';
import { faqApi } from '../backend/api/FaqApi';
import { Link, useSearchParams } from 'react-router';
import { PageLayout } from '../components/PageLayout';
import { FaqDialog } from '../components/faq/FaqDialog';
import { Button } from '@/components/ui/button';
import { CreateFaqCard } from '../components/faq/CreateFaqCard';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';
import type { ErrorWrapper } from '../util/ErrorWrapper';
import { StatusDialog } from '../components/StatusDialog';
import { confirm } from '../components/ConfirmDialog';
import type { ApprovalCheckModel } from '../backend/models/ApprovalCheckModel';
import { CreateFaqRequestCard } from '../components/faq/CreateFaqRequestCard';
import type { FaqRequestModel } from '../backend/models/FaqRequestModel';
import type { GetFaqsResponse } from '../backend/models/api/GetFaqsResponse';
import { FaqCardSkeleton } from '../components/faq/FaqCardSkeleton';
import { Paginator } from '../components/Paginator';
import { BackgroundLoadSpinner } from '../components/BackgroundLoadSpinner';
import type { FaqOrderBy, FaqSearchBy } from '../backend/api/FaqApi';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [searchInput, setSearchInput] = useState<string>('')
  const [searchBy, setSearchBy] = useState<FaqSearchBy>('title')
  const [appliedSearch, setAppliedSearch] = useState<string>('')
  const [appliedSearchBy, setAppliedSearchBy] = useState<FaqSearchBy | undefined>(undefined)
  const [orderBy, setOrderBy] = useState<FaqOrderBy>('newest')

  const [createError, setCreateError] = useState<ErrorWrapper<undefined> | undefined>(undefined)
  const [createSuccessDialogOpen, setCreateSuccessDialogOpen] = useState<boolean>(false)
  const [createFailureDialogOpen, setCreateFailureDialogOpen] = useState<boolean>(false)
  const [faqRemoved, setFaqRemoved] = useState<boolean>(false)
  const [sentToPending, setSentToPending] = useState<boolean>(false)

  const [loading, setLoading] = useState<boolean>(true)
  const [hideLoading, setHideLoading] = useState<boolean>(false)

  const [unapprovedFaqs, setUnapprovedFaqs] = useState<ApprovalCheckModel>({countDenied: 0, countPending: 0})
  const [contentLoadingId, setContentLoadingId] = useState<number | null>(null)

  const auth = useAuth()
  const faqApiRef = faqApi(auth);
    
  const fetchFaqs = (pageNumber: number, searchTerm: string, searchByCategory: FaqSearchBy | undefined) => {
    return faqApiRef.getAll(pageNumber, {
      search: searchTerm.trim() || undefined,
      searchBy: searchTerm.trim() ? searchByCategory : undefined
    })
  }

  const sortFaqsByOrder = (list: FaqModel[], order: FaqOrderBy): FaqModel[] => {
    const sorted = [...list]
    sorted.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return order === 'newest' ? db - da : da - db
    })
    return sorted
  }

  const displayedFaqs = useMemo(() => sortFaqsByOrder(faqs, orderBy), [faqs, orderBy])

  const handleSearchClick = () => {
    const trimmed = searchInput.trim()
    const newSearch = trimmed || ''
    const newSearchBy = trimmed ? searchBy : undefined
    // Only update and trigger fetch when the applied search actually changed
    if (newSearch !== appliedSearch || newSearchBy !== appliedSearchBy) {
      setAppliedSearch(newSearch)
      setAppliedSearchBy(newSearchBy)
      setCurrentPage(1)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchFaqs(0, appliedSearch, appliedSearchBy).then(res => {
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
  }, [appliedSearch, appliedSearchBy])
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

  const onRemove = async (id: number) => {
    const message = auth.admin
      ? "Are you sure you want to hide this FAQ response? It can be restored from the Hidden FAQs page."
      : "Are you sure you want to delete this FAQ response?";
    const confirmed = await confirm({ message });
    if (confirmed) {
      setHideLoading(true);
      faqApiRef.setFaqHidden(id, true).then(res => {
        if (!res.isError) {
          setFaqs(faqs.filter(f => f.id !== id));
          setFaqRemoved(true);
        }
      }).finally(() => setHideLoading(false));
    }
  };

  const handleShowDetail = (faq: FaqModel) => {
    if (faqContent.current == '') {
        setContentLoadingId(faq.id);
        faqApiRef.getContent(faq.id).then(res => {
          if (!res.isError && res.data) {
            faqContent.current = res.data
            setDetailFaq(faq);
          }
        }).finally(() => setContentLoadingId(null))
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
    <PageLayout auth={auth}>
      <BackgroundLoadSpinner loading={hideLoading} />
      <title>Frequently Asked Questions</title>
      <StatusDialog open={createSuccessDialogOpen} isSuccess={true} onOpenChange={setCreateSuccessDialogOpen} title='FAQ Response Created!' subtext='Now pending approval...'/>
      <StatusDialog open={createFailureDialogOpen} isSuccess={false} onOpenChange={setCreateFailureDialogOpen} title={createError?.error ?? "Unknown error"} subtext='Please try again later'/>
      <StatusDialog open={faqRemoved} isSuccess={true} onOpenChange={setFaqRemoved} title={auth.admin ? "FAQ response successfully hidden" : "FAQ response deleted"} subtext={auth.admin ? 'It can be restored from the Hidden FAQs page' : ""}/>
      <StatusDialog open={sentToPending} isSuccess={true} onOpenChange={setSentToPending} title="Changes saved" subtext="This FAQ has been sent back to pending approval and is no longer on the public list. An administrator will need to approve it again."/>
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
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h1>
        {
          (auth.faqAuthor || auth.admin) && <Alert variant="default" className='w-full mb-6 bg-amber-200 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700'>
            <AlertCircleIcon/>
            <AlertTitle>You have {unapprovedFaqs.countPending} unapproved responses and {unapprovedFaqs.countDenied} denied responses. {auth.admin && <Link to="/faq/pending" className='text-primary hover:text-primary/90 font-medium'>View pending responses</Link>}</AlertTitle>
          </Alert>
        }
        {
          (auth.faqAuthor || auth.admin) && <Button className="w-full mb-6" variant='outline' onClick={handleCreateFaq} disabled={auth.restricted}>Create</Button>
        }

        <div className="flex flex-col sm:flex-row gap-3 flex-wrap mb-6">
          <Select value={searchBy} onValueChange={(v) => setSearchBy(v as FaqSearchBy)}>
            <SelectTrigger className="w-full sm:w-[130px] shrink-0">
              <SelectValue placeholder="Search in" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">FAQ title</SelectItem>
              <SelectItem value="summary">FAQ summary</SelectItem>
              <SelectItem value="authorFullName">Author name</SelectItem>
              <SelectItem value="authorUsername">Author username</SelectItem>
            </SelectContent>
          </Select>
          <Select value={orderBy} onValueChange={(v) => setOrderBy(v as FaqOrderBy)}>
            <SelectTrigger className="w-full sm:w-[120px] shrink-0">
              <SelectValue placeholder="Order by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="search"
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
            className="flex-1 min-w-0"
          />
          <Button type="button" variant="secondary" onClick={handleSearchClick} className="shrink-0">Search</Button>
        </div>

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
          (auth.isLoggedIn()) && <Button className='w-full mb-6' variant="outline" onClick={() => setCreatingSuggestion(true)} disabled={auth.restricted}>Suggest a new FAQ response</Button>
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

        {!loading && displayedFaqs.length == 0 ? <h2 className="text-2xl font-bold my-2 text-center">No content!</h2> : displayedFaqs.map((faq) => (
            <FaqCard
                key={faq.id}
                faq={faq}
                onExpand={() => handleExpand(faq.id)}
                onCollapse={handleCollapse}
                onShowDetail={() => handleShowDetail(faq)}
                expanded={expandedId === faq.id}
                contentLoading={contentLoadingId === faq.id}
                canEdit={!!auth.faqAuthor && faq.author.id === auth.getUserInfo()?.id}
                canRemove={auth.admin || faq.author.id === auth.getUserInfo()?.id}
                onRemove={onRemove}
                contentForFaq={detailFaq?.id === faq.id ? faqContent.current : null}
                onSentToPending={(faqId) => {
                  setFaqs(faqs.filter(f => f.id !== faqId))
                  setSentToPending(true)
                }}
            />
        ))}

        <Paginator<GetFaqsResponse>
          pageCount={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onDataChanged={(data) => {
            setFaqs(data.faqs);
            setTotalPages(data.totalPages);
          }}
          onPageChanged={async (pageNum) => {
            const res = await fetchFaqs(pageNum - 1, appliedSearch, appliedSearchBy);
            if (!res.isError && res.data) {
              return res.data;
            }
            return { faqs: [], totalPages: 1 };
          }}
        />
        
      </div>
      <FaqDialog detailFaq={detailFaq} content={faqContent.current} handleOpenChange={handleCloseDetail}/>  
    </PageLayout>
  );
};