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

export const Register = () => {
    const username = useRef<string>("")
    const firstName = useRef<string>("")
    const lastName = useRef<string>("")
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [confirmPassword, setConfirmPassword] = useState<string>("")
    const navigate = useNavigate()
    const [error, setError] = useState<string>("")
    const auth = useAuth()
    const userApiRef = userApi(auth)

    const toLogin = () => {
        navigate("/login")
    }

    const submitRegister = () => {
        userApiRef.register({
            firstName: firstName.current,
            lastName: lastName.current,
            username: username.current,
            email: email,
            password: password
        }).then(res => {
            if (res.error) {
                setError(res.error)
            } else {
                auth.setToken(res.jwt)
                navigate("/")
            }
        })
    }

    return (
        <div className="h-screen flex items-center justify-center">
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Register for a new account!</CardTitle>
                <CardDescription>Or, <Button onClick={toLogin} variant="outline" >Login</Button></CardDescription>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="firstname">First Name</Label>
                            <Input id="firstname" type="text" placeholder="First Name" onChange={(event) => firstName.current = event.target.value} required/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lastname">Last Name</Label>
                            <Input id="lastname" type="text" onChange={(event) => lastName.current = event.target.value} required/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" type="text" onChange={(event) => username.current = event.target.value} required/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" onChange={(event) => setEmail(event.target.value)} required/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" onChange={(event) =>  setPassword(event.target.value)} required/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input id="confirm-password" type="password" onChange={(event) => setConfirmPassword(event.target.value)} required/>
                        </div>
                        <Alert variant="destructive" style={{ visibility: (password == confirmPassword) ? "visible" : "hidden" }}>
                            <AlertCircleIcon/>
                            <AlertTitle>Passwords don't match!</AlertTitle>
                        </Alert>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button type="button" onClick={submitRegister} className="w-full">
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