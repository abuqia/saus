import { describe, expect, it } from 'vitest';
import { render, screen } from '../../tests/test-utils';
import { Button } from './button';

describe('Button Component', () => {
    it('renders button with text', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('applies variant classes correctly', () => {
        render(<Button variant="destructive">Delete</Button>);
        const button = screen.getByText('Delete');
        expect(button).toHaveClass('destructive');
    });

    it('can be disabled', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByText('Disabled');
        expect(button).toBeDisabled();
    });

    it('handles click events', async () => {
        let clicked = false;
        const handleClick = () => {
            clicked = true;
        };

        render(<Button onClick={handleClick}>Click</Button>);
        const button = screen.getByText('Click');
        
        button.click();
        expect(clicked).toBe(true);
    });
});
