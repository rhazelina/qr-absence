import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1,
            // touchMultiplier: 2,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        const animationId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(animationId);
            lenis.destroy();
        };
    }, []);

    return null;
}

// Hook baru untuk scroll container specific
export function useLocalLenis(ref: React.RefObject<HTMLElement | null>) {
    useEffect(() => {
        if (!ref.current) return;

        const lenis = new Lenis({
            wrapper: ref.current, // Element pembungkus (viewport)
            content: ref.current, // Element konten (biasanya sama jika overflow pada wrapper)
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1,
            // touchMultiplier: 2,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        const animationId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(animationId);
            lenis.destroy();
        };
    }, [ref]);
}
