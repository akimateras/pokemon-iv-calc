import { useCallback, useEffect, useRef } from "react";

/** Delay before long-press repeat begins (ms). */
export const LONG_PRESS_DELAY_MS = 500;

/** Interval between steps during long-press repeat (ms). */
export const REPEAT_INTERVAL_MS = 40;

interface StepButtonProps {
    readonly className: string;
    readonly style?: React.CSSProperties;
    readonly onStep: () => void;
    readonly children: React.ReactNode;
}

export function StepButton({ className, style, onStep, children }: StepButtonProps) {
    const onStepRef = useRef(onStep);
    useEffect(() => { onStepRef.current = onStep; }, [onStep]);

    const delayTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const repeatTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    const stopRepeat = useCallback(() => {
        clearTimeout(delayTimer.current);
        clearInterval(repeatTimer.current);
    }, []);

    useEffect(() => stopRepeat, [stopRepeat]);

    function handlePointerDown() {
        onStepRef.current();
        delayTimer.current = setTimeout(() => {
            repeatTimer.current = setInterval(() => { onStepRef.current(); }, REPEAT_INTERVAL_MS);
        }, LONG_PRESS_DELAY_MS);
    }

    return (
        <button
            className={className}
            type="button"
            tabIndex={-1}
            style={style}
            onPointerDown={handlePointerDown}
            onPointerUp={stopRepeat}
            onPointerLeave={stopRepeat}
            onPointerCancel={stopRepeat}
            onContextMenu={(e) => { e.preventDefault(); }}
        >
            {children}
        </button>
    );
}
