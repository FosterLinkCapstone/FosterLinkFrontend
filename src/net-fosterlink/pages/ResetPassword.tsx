import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useRef, useState } from "react"
import { ExpandableAlert } from "../components/ExpandableAlert"
import { userApi } from "../backend/api/UserApi"
import { Link, useSearchParams } from "react-router"
import { BackgroundLoadSpinner } from "../components/BackgroundLoadSpinner"
import { useAuth } from "../backend/AuthContext"
import { CheckCircle2, XCircle } from "lucide-react"

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/

export const ResetPassword = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")
    const userId = searchParams.get("userId")

    const newPassword = useRef<string>("")
    const confirmPassword = useRef<string>("")
    const [loading, setLoading] = useState(false)
    const [succeeded, setSucceeded] = useState(false)
    const [error, setError] = useState<string>("")
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
    const auth = useAuth()
    const userApiRef = userApi(auth)

    if (!token || !userId) {
        return (
            <div className="h-screen flex items-center justify-center">
                <title>Reset Password</title>
                <meta name="referrer" content="no-referrer" />
                <Card className="w-full max-w-sm">
                    <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
                        <XCircle className="h-14 w-14 text-red-500 dark:text-red-400" strokeWidth={1.75} />
                        <p className="text-foreground font-medium leading-relaxed">
                            This reset link is malformed. Please check that you copied the full URL from your email.
                        </p>
                        <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/90">
                            Request a new reset link
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const validate = (): boolean => {
        const errors: { [key: string]: string } = {}
        if (!PASSWORD_REGEX.test(newPassword.current)) {
            errors["newPassword"] = "Password must be 12–128 characters and include uppercase, lowercase, a digit, and a special character (@$!%*?&)."
        }
        if (newPassword.current !== confirmPassword.current) {
            errors["confirmPassword"] = "Passwords do not match."
        }
        setFieldErrors(errors)
        return Object.keys(errors).length === 0
    }

    const submitReset = () => {
        setError("")
        if (!validate()) return
        setLoading(true)
        userApiRef.resetPassword(token, userId, newPassword.current).then(res => {
            if (res.isError) {
                setError(res.error!)
            } else {
                setSucceeded(true)
            }
        }).finally(() => setLoading(false))
    }

    return (
        <div className="h-screen flex items-center justify-center">
            <title>Reset Password</title>
            <meta name="referrer" content="no-referrer" />
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Reset your password</CardTitle>
                    <CardDescription>Enter and confirm your new password below.</CardDescription>
                </CardHeader>
                <CardContent>
                    {succeeded ? (
                        <div className="flex flex-col items-center gap-3 py-2 text-center">
                            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" strokeWidth={1.75} />
                            <p className="text-foreground font-medium leading-relaxed">
                                Your password has been reset successfully.
                            </p>
                            <Link to="/login" className="text-sm text-primary hover:text-primary/90">
                                Go to login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); submitReset() }}>
                            <div className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="newPassword">New password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        onChange={(e) => newPassword.current = e.target.value}
                                        required
                                    />
                                    {fieldErrors["newPassword"] && (
                                        <span className="text-red-500 text-sm">{fieldErrors["newPassword"]}</span>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Confirm password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        onChange={(e) => confirmPassword.current = e.target.value}
                                        required
                                    />
                                    {fieldErrors["confirmPassword"] && (
                                        <span className="text-red-500 text-sm">{fieldErrors["confirmPassword"]}</span>
                                    )}
                                </div>
                            </div>
                        </form>
                    )}
                </CardContent>
                {!succeeded && (
                    <CardFooter className="flex-col gap-2">
                        <Button
                            type="button"
                            onClick={submitReset}
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? <BackgroundLoadSpinner loading={true} className="size-5 shrink-0" /> : "Reset password"}
                        </Button>
                        {error !== "" && <ExpandableAlert message={error} />}
                        <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/90">
                            Request a new reset link
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
