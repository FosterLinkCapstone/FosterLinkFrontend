import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../backend/AuthContext";
import { threadApi } from "../backend/api/ThreadApi";
import type { ThreadModel } from "../backend/models/ThreadModel";
import { SearchBy } from "../backend/models/api/SearchBy";
import { ThreadPreviewWide } from "../components/forum/ThreadPreviewWide";
import { CreateThreadCardWide } from "../components/forum/CreateThreadCardWide";
import { useNavigate, useSearchParams } from "react-router";

export const Threads = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [searchBy, setSearchBy] = useState<string>('');
  const [threads, setThreads] = useState<ThreadModel[]>([])
    const [searchParams, _] = useSearchParams()
  const [error, setError] = useState<string>('')
  const [creating, setCreating] = useState<boolean>(searchParams.get("creating") === "true")
  const auth = useAuth()
  const threadApiRef = threadApi(auth)
  const navigate = useNavigate()

  useEffect(() => { // potential issue: filling data on empty search
    if (threads.length == 0) {
        threadApiRef.rand().then(t => {
            setThreads(t)
        })
    }
  }, [])

  const doSearch = async () => {
    if (searchText != "" && searchBy != "") {
        const res = await threadApiRef.search(SearchBy[searchBy as keyof typeof SearchBy], searchText)
        if (res.errorMessage && res.errorMessage != "") {
            setError(res.errorMessage)
        } else {
            setThreads(res.response) // TODO - implement filters here
        }
    }
  }
  const onThreadCreate = (newThread: ThreadModel) => {
    setCreating(false)
    navigate(`/threads/thread/${newThread.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-center text-gray-400">
        <Navbar userInfo={auth.getUserInfo()}/>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-3 mb-6">
          <DropdownMenu> {/* TODO template for the filters dropdown - not needed for MVC */}
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Most Recent</DropdownMenuItem>
              <DropdownMenuItem>Most Popular</DropdownMenuItem>
              <DropdownMenuItem>Most Comments</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Input
            type="text"
            placeholder="Enter search text..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1"
          />

          <Select value={searchBy} onValueChange={setSearchBy}>
            <SelectTrigger className="w-auto min-w-[120px]">
              <SelectValue placeholder="Search By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="THREAD_TITLE">Thread Title</SelectItem>
              <SelectItem value="THREAD_CONTENT">Thread Content</SelectItem>
              <SelectItem value="USERNAME">Username</SelectItem>
              <SelectItem value="TAGS">Tags</SelectItem>
            </SelectContent>
          </Select>

          <Button className="whitespace-nowrap" onClick={doSearch}>Search</Button>
        </div>
        {
          auth.isLoggedIn() && <div className="max-w-7xl mb-6">
                                  <Button className="w-full !border-solid !border-1" onClick={() => setCreating(!creating)}>Create Thread</Button>
                                </div>
        }

        {
            error !== '' && <h4 style={{color: 'red'}}>{error}</h4>
        }

        <div className="space-y-4">
            {
              creating && <CreateThreadCardWide onCancel={() => setCreating(false)} onCreate={onThreadCreate}/>
            }
            {
                threads.length == 0 ? <h2 className="text-2xl font-bold my-2 text-center">No content!</h2> : threads.map(t => <ThreadPreviewWide thread={t}/>)
            }
        </div>
      </div>
    </div>
  );
};