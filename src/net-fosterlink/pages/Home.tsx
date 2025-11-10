import { useEffect, useRef, useState } from "react"
import type { ThreadModel } from "../backend/models/ThreadModel"
import { Navbar } from "../components/Navbar"
import { Thread } from "../components/Thread"
import { threadApi } from "../backend/api/ThreadApi"
import { useAuth } from "../backend/AuthContext"
import { type UserModel } from "../backend/models/UserModel"
import { userApi } from "../backend/api/UserApi"

export const Home = () => {
    const [threads, setThreads] = useState<ThreadModel[]>([]) 
    const auth = useAuth()
    const threadApiRef = threadApi(auth)
    const userApiRef = userApi(auth)
    const userData = useRef<UserModel | undefined>(undefined)
    useEffect(() => { // TODO find a more efficient way to do this
        if (auth.token != null) {
            userApiRef.getInfo().then(d => {
                if (d.found) {
                    userData.current = d.user
                }
            })
        }
        threadApiRef.getAll().then(t => {
            setThreads(t)
        })
    }, [])
    return (
        <>
            <Navbar userInfo={userData.current}/>
            <div className="flex flex-col gap-6 w-[100%] justify-center items-center">
                {threads.map(t => <Thread thread={t}/>)}
            </div>
        </>

    )
}