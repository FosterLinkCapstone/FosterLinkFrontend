import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "../backend/AuthContext"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useRef, useState } from "react"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"
import { userApi } from "../backend/api/UserApi"
import { useNavigate } from "react-router"

export const Login = () => {
    const email = useRef<string>("")
    const password = useRef<string>("")
    const [error, setError] = useState<string>("")
    const auth = useAuth()
    const userApiRef = userApi(auth)
    const navigate = useNavigate()

    const toSignUp = () => {
        navigate("/signup")
    }

    const submitLogin = () => {
        setError("")
        if (email.current != "" && password.current != "") {
            userApiRef.login(email.current, password.current).then(res => {
                if (res.isError) {
                    setError(res.error)
                } else {
                    auth.setToken(res.jwt)
                    navigate("/")
                }
            })
        } else {
            setError("Field must not be empty!")
        }
    }

    return (
        <div className="h-screen flex items-center justify-center">
<Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>Or, <Button onClick={toSignUp} variant="outline" >Sign Up</Button></CardDescription>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="user@example.com" onChange={(event) => email.current = event.target.value} required/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" onChange={(event) => password.current = event.target.value} required/>
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button type="button" onClick={submitLogin} className="w-full">
                    Login
                </Button>
                <Alert variant="destructive" style={{ visibility: error != "" ? "visible" : "hidden" }}>
                    <AlertCircleIcon/>
                    <AlertTitle>{error}</AlertTitle>
                </Alert>
            </CardFooter>
        </Card>
        </div>
    )

}