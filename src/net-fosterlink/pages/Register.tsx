import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "../backend/AuthContext"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useRef, useState } from "react"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"
import { ExpandableAlert } from "../components/ExpandableAlert"
import { userApi } from "../backend/api/UserApi"
import { Link, useNavigate } from "react-router"
import { PhoneNumberInput } from "../components/PhoneNumberInput"
import { BackgroundLoadSpinner } from "../components/BackgroundLoadSpinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PrivacyPolicyContent } from "./PrivacyPolicy"
import { TermsOfServiceContent } from "./TermsOfService"

export const Register = () => {
    const username = useRef<string>("")
    const firstName = useRef<string>("")
    const lastName = useRef<string>("")
    const [phoneNumber, setPhoneNumber] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [fieldErrors,setFieldErrors] = useState<{[key: string]: string}>({})
    const [password, setPassword] = useState<string>("")
    const [confirmPassword, setConfirmPassword] = useState<string>("")
    const [confirmAgeRequirement, setConfirmAgeRequirement] = useState<boolean>(false)
    const [consentTerms, setConsentTerms] = useState<boolean>(false)
    const [consentPrivacy, setConsentPrivacy] = useState<boolean>(false)
    const [consentMarketing, setConsentMarketing] = useState<boolean>(false)
    const [termsDialogOpen, setTermsDialogOpen] = useState(false)
    const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false)
    const navigate = useNavigate()
    const [error, setError] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const auth = useAuth()
    const userApiRef = userApi(auth)

    const submitRegister = () => {
        setLoading(true)
        setFieldErrors({})
        userApiRef.register({
            firstName: firstName.current,
            lastName: lastName.current,
            username: username.current,
            email: email,
            phoneNumber: phoneNumber,
            password: password,
            confirmAgeRequirement: confirmAgeRequirement,
            consentTerms: consentTerms,
            consentPrivacy: consentPrivacy,
            consentMarketing: consentMarketing
        }).then(res => {
            if (res.error) {
                setError(res.error)
                if (res.validationErrors) {
                    const fieldErrors: {[key: string]: string} = {}
                    res.validationErrors.forEach(e => {
                        fieldErrors[e.field] = e.message
                    })
                    setFieldErrors(fieldErrors)
                }
            } else {
                auth.setToken(res.data!)
                navigate("/")
            }
        }).finally(() => { setLoading(false) })
    }

    return (
        <div className="h-screen flex items-center justify-center">
        <title>Register</title>
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Register for a new account!</CardTitle>
                <CardDescription>Or, <Link className="text-primary hover:text-primary/90" to="/login">login</Link></CardDescription>
            </CardHeader>
            <CardContent>
                <form id="register-form" onSubmit={(e) => { e.preventDefault(); submitRegister(); }}>
                    <div className="flex flex-col gap-6">
                        <div className="flex items-start gap-2">
                            <Checkbox id="confirm-age" checked={confirmAgeRequirement} onCheckedChange={(checked) => setConfirmAgeRequirement(checked === true)} required />
                            <Label htmlFor="confirm-age" className="leading-snug font-normal">
                                I confirm I am 13 years of age or older
                            </Label>
                        </div>
                        {fieldErrors.confirmAgeRequirement && <span className="text-red-500 text-sm">{fieldErrors.confirmAgeRequirement}</span>}
                        <div className="grid gap-2">
                            <Label htmlFor="firstname">First Name</Label>
                            <Input id="firstname" type="text" placeholder="First Name" onChange={(event) => firstName.current = event.target.value} required/>
                            <span className="text-red-500">{fieldErrors.firstName}</span>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lastname">Last Name</Label>
                            <Input id="lastname" type="text" onChange={(event) => lastName.current = event.target.value} required/>
                            <span className="text-red-500">{fieldErrors.lastName}</span>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" type="text" onChange={(event) => username.current = event.target.value} required/>
                            <span className="text-red-500">{fieldErrors.username}</span>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" onChange={(event) => setEmail(event.target.value)} required/>
                            <span className="text-red-500">{fieldErrors.email}</span>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phoneNumber">Phone Number <span className="text-muted-foreground font-normal">(optional)</span></Label>
                            <PhoneNumberInput value={phoneNumber} setValue={setPhoneNumber}/>
                            <span className="text-red-500">{fieldErrors.phoneNumber}</span>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" onChange={(event) =>  setPassword(event.target.value)} required/>
                            <span className="text-red-500">{fieldErrors.password}</span>

                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input id="confirm-password" type="password" onChange={(event) => setConfirmPassword(event.target.value)} required/>
                            <span className="text-red-500">{fieldErrors.confirmPassword}</span>
                        </div>
                        {
                            password != confirmPassword && <Alert variant="destructive" className="text-red-400 bg-red-200">
                            <AlertCircleIcon/>
                            <AlertTitle>Passwords don't match!</AlertTitle>
                        </Alert>
                        }
                        <div className="flex items-start gap-2">
                            <Checkbox id="consent-terms" checked={consentTerms} onCheckedChange={(checked) => setConsentTerms(checked === true)} required />
                            <Label htmlFor="consent-terms" className="leading-snug font-normal">
                                I agree to the <button type="button" className="text-primary hover:text-primary/90 underline bg-transparent border-none p-0 cursor-pointer font-inherit" onClick={() => setTermsDialogOpen(true)}>Terms of Service</button>
                            </Label>
                        </div>
                        <div className="flex items-start gap-2">
                            <Checkbox id="consent-privacy" checked={consentPrivacy} onCheckedChange={(checked) => setConsentPrivacy(checked === true)} required />
                            <Label htmlFor="consent-privacy" className="leading-snug font-normal">
                                I have read the <button type="button" className="text-primary hover:text-primary/90 underline bg-transparent border-none p-0 cursor-pointer font-inherit" onClick={() => setPrivacyDialogOpen(true)}>Privacy Policy</button>
                            </Label>
                        </div>
                        <div className="flex items-start gap-2">
                            <Checkbox id="consent-marketing" checked={consentMarketing} onCheckedChange={(checked) => setConsentMarketing(checked === true)} />
                            <Label htmlFor="consent-marketing" className="leading-snug font-normal">
                                I would like to receive marketing emails
                            </Label>
                        </div>

                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button type="submit" form="register-form" variant="outline" className="w-full" disabled={loading || (password != confirmPassword) || !confirmAgeRequirement || !consentTerms || !consentPrivacy}>
                    {loading ? <BackgroundLoadSpinner loading={true} className="size-5 shrink-0" /> : "Register"}
                </Button>
                {error != "" && <ExpandableAlert message={error} />}
                
            </CardFooter>
        </Card>

        <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
            <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Terms of Service</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto pr-2 -mr-2">
                    <TermsOfServiceContent />
                </div>
            </DialogContent>
        </Dialog>

        <Dialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen}>
            <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Privacy Policy</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto pr-2 -mr-2">
                    <PrivacyPolicyContent />
                </div>
            </DialogContent>
        </Dialog>
        </div>
    )

}