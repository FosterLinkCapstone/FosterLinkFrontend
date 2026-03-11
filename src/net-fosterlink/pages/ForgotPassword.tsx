import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useRef, useState } from "react"
import { ExpandableAlert } from "../components/ExpandableAlert"
import { userApi } from "../backend/api/UserApi"
import { Link } from "react-router"
import { BackgroundLoadSpinner } from "../components/BackgroundLoadSpinner"
import { useAuth } from "../backend/AuthContext"
import { CheckCircle2 } from "lucide-react"

export const ForgotPassword = () => {
    const email = useRef<string>("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string>("")
    const auth = useAuth()
    const userApiRef = userApi(auth)

    const submitForgotPassword = () => {
        if (email.current.trim() === "") {
            setError("Please enter your email address.")
            return
        }
        setLoading(true)
        setError("")
        userApiRef.forgotPassword(email.current).then(res => {
            if (res.isError) {
                setError(res.error!)
            } else {
                setSubmitted(true)
            }
        }).finally(() => setLoading(false))
    }

    return (
        <div className="h-screen flex items-center justify-center">
            <title>Forgot Password</title>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Forgot your password?</CardTitle>
                    <CardDescription>
                        Enter your email address and we'll send you a reset link if an account exists.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {submitted ? (
                        <div className="flex flex-col items-center gap-3 py-2 text-center">
                            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" strokeWidth={1.75} />
                            <p className="text-foreground font-medium leading-relaxed">
                                If an account with that email exists, we've sent a password reset link. Please check your inbox.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); submitForgotPassword() }}>
                            <div className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        onChange={(e) => email.current = e.target.value}
                                        required
                                    />
                                </div>
                            </div>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    {!submitted && (
                        <Button
                            type="button"
                            onClick={submitForgotPassword}
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? <BackgroundLoadSpinner loading={true} className="size-5 shrink-0" /> : "Send reset link"}
                        </Button>
                    )}
                    {error !== "" && <ExpandableAlert message={error} />}
                    <Link to="/login" className="text-sm text-primary hover:text-primary/90">
                        Back to login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
