import { Input } from "@/components/ui/input"

export const PhoneNumberInput = ({ value, setValue }: { value: string, setValue: (v: string) => void }) => {

    const onInputChange = (newVal: string) => {
        const digits = newVal.replace(/\D/g, '').substring(0, 10);

        let formatted = digits;

        if (digits.length >= 1) {
            formatted = '(' + digits.substring(0, 3);
        }
        if (digits.length >= 4) {
            formatted += ') ' + digits.substring(3, 6);
        }
        if (digits.length >= 7) {
            formatted += '-' + digits.substring(6, 10);
        }

        setValue(formatted);
    }

    return (
        <Input type="text" placeholder="(XXX) XXX-XXXX" value={value} onChange={(e) => onInputChange(e.target.value)} />
    )

}