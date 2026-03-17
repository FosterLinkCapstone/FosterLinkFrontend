import { useState, useEffect, useRef } from "react";

const HOVER_LEAVE_DELAY_MS = 100;

export function useNavbarHover() {
    const [openItem, setOpenItem] = useState<string | null>(null);
    const [isDesktop, setIsDesktop] = useState(true);
    const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)");
        const handler = () => setIsDesktop(mq.matches);
        handler();
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    const handleItemEnter = (value: string) => {
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
            leaveTimeoutRef.current = null;
        }
        if (isDesktop) setOpenItem(value);
    };

    const handleItemLeave = () => {
        if (!isDesktop) return;
        leaveTimeoutRef.current = setTimeout(() => setOpenItem(null), HOVER_LEAVE_DELAY_MS);
    };

    const handleTriggerClick = (e: React.MouseEvent) => {
        if (isDesktop) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    const handleValueChange = (value: string) => {
        if (isDesktop) return;
        setOpenItem(value || null);
    };

    return { openItem, isDesktop, handleItemEnter, handleItemLeave, handleTriggerClick, handleValueChange };
}
