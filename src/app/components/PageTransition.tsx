import { useEffect, useState, ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Small delay for the animation to trigger properly
        const timer = setTimeout(() => setIsVisible(true), 30);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={`transition-all duration-500 ease-out ${isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
        >
            {children}
        </div>
    );
}

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    className?: string;
}

export function FadeIn({ children, delay = 0, direction = 'up', className = '' }: FadeInProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    const directionClasses = {
        up: isVisible ? 'translate-y-0' : 'translate-y-6',
        down: isVisible ? 'translate-y-0' : '-translate-y-6',
        left: isVisible ? 'translate-x-0' : 'translate-x-6',
        right: isVisible ? 'translate-x-0' : '-translate-x-6',
        none: '',
    };

    return (
        <div
            className={`transition-all duration-600 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'
                } ${directionClasses[direction]} ${className}`}
            style={{ transitionDuration: '600ms' }}
        >
            {children}
        </div>
    );
}
