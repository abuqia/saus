import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Custom render function that wraps components with providers
 * Add your app providers here (ThemeProvider, QueryClientProvider, etc.)
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
    return render(ui, { ...options });
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render };

/**
 * Helper to create mock Inertia page props
 */
export function mockInertiaProps<T = Record<string, unknown>>(props: T) {
    return {
        auth: {
            user: {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
            },
        },
        flash: {},
        errors: {},
        ...props,
    };
}

/**
 * Helper to wait for async operations
 */
export function waitFor(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
