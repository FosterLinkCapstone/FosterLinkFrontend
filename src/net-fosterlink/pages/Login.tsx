import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "../backend/AuthContext"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useRef, useState } from "react"
import { ExpandableAlert } from "../components/ExpandableAlert"
import { userApi } from "../backend/api/UserApi"
import { Link, useNavigate, useSearchParams } from "react-router"
import { BackgroundLoadSpinner } from "../components/BackgroundLoadSpinner"

export const Login = () => {
    const [searchParams, _] = useSearchParams()
    const email = useRef<string>("")
    const password = useRef<string>("")
    const [stayLoggedIn, setStayLoggedIn] = useState(false)
    const [error, setError] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
    const auth = useAuth()
    const userApiRef = userApi(auth)
    const navigate = useNavigate()

    const submitLogin = () => {
        setLoading(true)
        setError("")
        setFieldErrors({})
        if (email.current !== "" && password.current !== "") {
            userApiRef.login(email.current, password.current, stayLoggedIn).then(res => {
                if (res.isError) {
                    setError(res.error!)
                    if (res.validationErrors) {
                        const fieldErrors: {[key: string]: string} = {}
                        res.validationErrors.forEach(e => {
                            fieldErrors[e.field] = e.message
                        })
                        setFieldErrors(fieldErrors)
                    }
                } else {
                    auth.setToken(res.data!, { stayLoggedIn })
                    navigate(searchParams.has("currentPage") ? searchParams.get("currentPage")! : "/")
                }
            }).finally(() => { setLoading(false) })
        } else {
            setError("Field must not be empty!")
            setLoading(false)
        }
    }

    return (
        <div className="h-screen flex items-center justify-center">
        <title>Login</title>
<Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>Or, <Link to="/register" className="text-primary hover:text-primary/90">sign up</Link></CardDescription>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="user@example.com" onChange={(event) => email.current = event.target.value} required/>
                            <span className="text-red-500">{fieldErrors["email"]}</span>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" onChange={(event) => password.current = event.target.value} required/>
                            <span className="text-red-500">{fieldErrors["password"]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="stayLoggedIn"
                                checked={stayLoggedIn}
                                onCheckedChange={(checked) => setStayLoggedIn(checked === true)}
                            />
                            <Label htmlFor="stayLoggedIn" className="cursor-pointer font-normal">Stay logged in</Label>
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button type="button" onClick={submitLogin} className="w-full" disabled={loading}>
                    {loading ? <BackgroundLoadSpinner loading={true} className="size-5 shrink-0" /> : "Login"}
                </Button>
                {error !== "" && <ExpandableAlert message={error} />}
            </CardFooter>
        </Card>
        </div>
    )

}
