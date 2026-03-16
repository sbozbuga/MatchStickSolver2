import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock the child components to simplify the test
vi.mock('./components/QuizWorkspace', () => ({
    QuizWorkspace: () => <div data-testid="quiz-workspace">Mock QuizWorkspace</div>
}));

vi.mock('./components/SolverWorkspace', () => ({
    SolverWorkspace: () => <div data-testid="solver-workspace">Mock SolverWorkspace</div>
}));

describe('App', () => {
    it('renders the header correctly', () => {
        render(<App />);
        expect(screen.getByText('Matchstick Puzzle')).toBeInTheDocument();
        expect(screen.getByText('Drag 1 stick to fix the equation')).toBeInTheDocument();
        expect(screen.getByText('Quiz Mode')).toBeInTheDocument();
        expect(screen.getByText('Solver Mode')).toBeInTheDocument();
    });

    it('toggles between quiz and solver modes', () => {
        render(<App />);

        // Get the buttons
        const quizButton = screen.getByText('Quiz Mode');
        const solverButton = screen.getByText('Solver Mode');

        // Get the workspaces
        const quizWorkspace = screen.getByTestId('quiz-workspace').parentElement;
        const solverWorkspace = screen.getByTestId('solver-workspace').parentElement;

        // Verify initial state: Quiz mode is block, Solver mode is none
        expect(quizWorkspace).toHaveStyle('display: block');
        expect(solverWorkspace).toHaveStyle('display: none');

        // Click Solver Mode button
        fireEvent.click(solverButton);

        // Verify state changes: Solver mode is block, Quiz mode is none
        expect(quizWorkspace).toHaveStyle('display: none');
        expect(solverWorkspace).toHaveStyle('display: block');

        // Click Quiz Mode button
        fireEvent.click(quizButton);

        // Verify state changes back
        expect(quizWorkspace).toHaveStyle('display: block');
        expect(solverWorkspace).toHaveStyle('display: none');
    });
});
