import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizWorkspace } from './QuizWorkspace';
import * as utils from '../utils';

// Mock the utils to control randomness
vi.mock('../utils', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../utils')>();
    return {
        ...actual,
        generateRandomPuzzle: vi.fn(),
    };
});

describe('QuizWorkspace', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup a predictable puzzle where the original is '6+4=4'.
        // The solution is to move the middle stick (index 3) from '6'
        // to the top-right position (index 2) of '6', making it '0'.
        // 0 + 4 = 4 is correct.
        vi.mocked(utils.generateRandomPuzzle).mockReturnValue('6+4=4');
    });

    it('renders initial state correctly', () => {
        render(<QuizWorkspace />);
        expect(screen.getByText('Quiz Mode')).toBeInTheDocument();
        expect(screen.getByText('Solving Puzzle #1')).toBeInTheDocument();
        expect(screen.getByText('Reset Puzzle')).toBeInTheDocument();
        expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    it('can solve a puzzle by dragging and dropping a stick', () => {
        const onSolveSuccess = vi.fn();
        const { container } = render(<QuizWorkspace onSolveSuccess={onSolveSuccess} />);

        // The puzzle is 6+4=4.
        // Characters:
        // index 0: '6'
        // index 1: '+'
        // index 2: '4'
        // index 3: '='
        // index 4: '4'

        // We want to move stick from charIndex 0 (the '6'), segmentIndex 3 (middle)
        // to charIndex 0 (the '6'), segmentIndex 2 (top-right).

        // Find the path for char 0, segment 3
        const removeTarget = container.querySelector('path[data-char-index="0"][data-segment-index="3"]');
        expect(removeTarget).not.toBeNull();

        // 1. Simulate pointer down on the middle stick to pick it up
        fireEvent.pointerDown(removeTarget!);

        // Wait, we need to mock elementFromPoint to return the target segment
        // Let's create a mock for document.elementFromPoint
        const addTarget = container.querySelector('path[data-char-index="0"][data-segment-index="2"]');
        expect(addTarget).not.toBeNull();

        document.elementFromPoint = vi.fn().mockReturnValue(addTarget);

        // 2. Simulate pointer move to register movement
        fireEvent.pointerMove(window, { clientX: 100, clientY: 100 });

        // 3. Simulate pointer move over the target to set hoverTarget
        fireEvent.pointerMove(window, { clientX: 200, clientY: 200 });

        // 4. Simulate pointer up to drop the stick
        fireEvent.pointerUp(window);

        // Check if solved
        expect(screen.getByText('Correct! Well done!')).toBeInTheDocument();
        expect(onSolveSuccess).toHaveBeenCalled();
    });

    it('shows incorrect state when an invalid move is made', () => {
        const { container } = render(<QuizWorkspace />);

        // The puzzle is 6+4=4.
        // Let's move stick from charIndex 0 (the '6'), segmentIndex 3 (middle)
        // to charIndex 2 (the '4'), segmentIndex 0 (top).

        const removeTarget = container.querySelector('path[data-char-index="0"][data-segment-index="3"]');
        fireEvent.pointerDown(removeTarget!);

        // Let's just remove the stick and leave it hanging by clicking empty space?
        // Wait, if we click empty space, it returns the stick.
        // We have to place it somewhere.
        const addTarget = container.querySelector('path[data-char-index="2"][data-segment-index="0"]');

        document.elementFromPoint = vi.fn().mockReturnValue(addTarget);

        fireEvent.pointerMove(window, { clientX: 100, clientY: 100 });
        fireEvent.pointerMove(window, { clientX: 200, clientY: 200 });
        fireEvent.pointerUp(window);

        expect(screen.getByText('Incorrect!')).toBeInTheDocument();
    });

    it('can reset the puzzle', () => {
        const { container } = render(<QuizWorkspace />);

        // Make an incorrect move first
        const removeTarget = container.querySelector('path[data-char-index="0"][data-segment-index="3"]');
        fireEvent.pointerDown(removeTarget!);

        const addTarget = container.querySelector('path[data-char-index="2"][data-segment-index="0"]');
        document.elementFromPoint = vi.fn().mockReturnValue(addTarget);

        fireEvent.pointerMove(window, { clientX: 100, clientY: 100 });
        fireEvent.pointerMove(window, { clientX: 200, clientY: 200 });
        fireEvent.pointerUp(window);

        expect(screen.getByText('Incorrect!')).toBeInTheDocument();

        // Click Reset
        const resetButton = screen.getByText('Try Again');
        fireEvent.click(resetButton);

        // Incorrect message should be gone
        expect(screen.queryByText('Incorrect!')).not.toBeInTheDocument();
        // Reset Puzzle button should be back
        expect(screen.getByText('Reset Puzzle')).toBeInTheDocument();
    });

    describe('Copy Functionality', () => {
        let originalClipboard: any;
        let originalExecCommand: any;
        const mockWriteText = vi.fn();

        beforeEach(() => {
            originalClipboard = navigator.clipboard;
            originalExecCommand = document.execCommand;

            // Setup default mock for clipboard
            Object.defineProperty(navigator, 'clipboard', {
                value: { writeText: mockWriteText },
                writable: true,
                configurable: true,
            });

            // Mock document.execCommand
            document.execCommand = vi.fn().mockReturnValue(true);

            // Mock console.error to keep test output clean
            vi.spyOn(console, 'error').mockImplementation(() => {});
        });

        afterEach(() => {
            Object.defineProperty(navigator, 'clipboard', {
                value: originalClipboard,
                writable: true,
                configurable: true,
            });
            document.execCommand = originalExecCommand;
            vi.restoreAllMocks();
        });

        it('uses navigator.clipboard.writeText when available', async () => {
            render(<QuizWorkspace />);
            const copyButton = screen.getByText('Copy');

            fireEvent.click(copyButton);

            expect(mockWriteText).toHaveBeenCalledWith('6+4=4');
            expect(document.execCommand).not.toHaveBeenCalled();
            expect(await screen.findByText('Copied!')).toBeInTheDocument();
        });

        it('handles navigator.clipboard.writeText failure', async () => {
            mockWriteText.mockRejectedValueOnce(new Error('Clipboard error'));

            render(<QuizWorkspace />);
            const copyButton = screen.getByText('Copy');

            fireEvent.click(copyButton);

            // Wait for the promise to reject and the error to be caught
            await vi.waitFor(() => {
                expect(console.error).toHaveBeenCalledWith('Failed to copy equation: ', expect.any(Error));
            });

            // Should not show "Copied!" text if failed
            expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
        });

        it('falls back to document.execCommand when navigator.clipboard is missing', async () => {
            // Remove clipboard API
            Object.defineProperty(navigator, 'clipboard', {
                value: undefined,
                writable: true,
                configurable: true,
            });

            // Spy on textarea creation
            const originalCreateElement = document.createElement.bind(document);
            let createdTextarea: HTMLTextAreaElement | null = null;
            vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
                const el = originalCreateElement(tagName);
                if (tagName === 'textarea') {
                    createdTextarea = el as HTMLTextAreaElement;
                    vi.spyOn(el, 'focus');
                    vi.spyOn(el as HTMLTextAreaElement, 'select');
                }
                return el;
            });

            const appendChildSpy = vi.spyOn(document.body, 'appendChild');
            const removeChildSpy = vi.spyOn(document.body, 'removeChild');

            render(<QuizWorkspace />);
            const copyButton = screen.getByText('Copy');

            fireEvent.click(copyButton);

            expect(mockWriteText).not.toHaveBeenCalled();
            expect(document.createElement).toHaveBeenCalledWith('textarea');
            expect(createdTextarea).not.toBeNull();
            expect(createdTextarea!.value).toBe('6+4=4');
            expect(appendChildSpy).toHaveBeenCalledWith(createdTextarea);
            expect(createdTextarea!.focus).toHaveBeenCalled();
            expect(createdTextarea!.select).toHaveBeenCalled();
            expect(document.execCommand).toHaveBeenCalledWith('copy');
            expect(removeChildSpy).toHaveBeenCalledWith(createdTextarea);
            expect(await screen.findByText('Copied!')).toBeInTheDocument();
        });

        it('handles document.execCommand failure gracefully', async () => {
            // Remove clipboard API
            Object.defineProperty(navigator, 'clipboard', {
                value: undefined,
                writable: true,
                configurable: true,
            });

            // Make execCommand throw
            (document.execCommand as ReturnType<typeof vi.fn>).mockImplementation(() => {
                throw new Error('execCommand failed');
            });

            const removeChildSpy = vi.spyOn(document.body, 'removeChild');

            render(<QuizWorkspace />);
            const copyButton = screen.getByText('Copy');

            fireEvent.click(copyButton);

            expect(console.error).toHaveBeenCalledWith('Fallback copy failed', expect.any(Error));
            expect(screen.queryByText('Copied!')).not.toBeInTheDocument();

            // ensure cleanup still happens
            expect(removeChildSpy).toHaveBeenCalled();
        });
    });
});
