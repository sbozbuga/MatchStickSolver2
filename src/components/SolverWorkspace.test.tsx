import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SolverWorkspace } from './SolverWorkspace';
import * as utils from '../utils';

// Mock the utils module
vi.mock('../utils', async () => {
  const actual = await vi.importActual<typeof import('../utils')>('../utils');
  return {
    ...actual,
    solveEquation: vi.fn().mockReturnValue([]),
    generateRandomPuzzle: vi.fn().mockReturnValue(''),
  };
});

describe('SolverWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the default UI with initial equation "6+4=4"', () => {
    // Default equation "6+4=4" is passed to solveEquation on initial render
    vi.mocked(utils.solveEquation).mockReturnValue([]);

    render(<SolverWorkspace />);

    expect(screen.getByText('Solver Mode')).toBeDefined();
    expect(screen.getByText('Enter an equation to find all 1-stick solutions!')).toBeDefined();

    // Check initial input value
    const input = screen.getByPlaceholderText('e.g. 6+4=4') as HTMLInputElement;
    expect(input.value).toBe('6+4=4');

    // Check original equation static display
    expect(screen.getByText('Original Equation')).toBeDefined();

    // Check solutions header and no solutions text
    expect(screen.getByText('Solutions')).toBeDefined();
    expect(screen.getByText('No 1-stick solutions found.')).toBeDefined();

    expect(utils.solveEquation).toHaveBeenCalledWith('6+4=4');
  });

  it('handles "Random" button click to generate a new equation', async () => {
    vi.mocked(utils.generateRandomPuzzle).mockReturnValue('9-3=6');
    vi.mocked(utils.solveEquation).mockReturnValue([]);

    render(<SolverWorkspace />);

    const randomButton = screen.getByText('Random');
    fireEvent.click(randomButton);

    expect(utils.generateRandomPuzzle).toHaveBeenCalled();

    const input = screen.getAllByPlaceholderText('e.g. 6+4=4')[0] as HTMLInputElement;
    expect(input.value).toBe('9-3=6');

    // It should also update the equation state and call solveEquation
    expect(utils.solveEquation).toHaveBeenCalledWith('9-3=6');
  });

  it('handles user input and "Solve" form submission to update the equation', async () => {
    vi.mocked(utils.solveEquation).mockReturnValue([]);

    render(<SolverWorkspace />);

    const input = screen.getAllByPlaceholderText('e.g. 6+4=4')[0] as HTMLInputElement;
    const solveButton = screen.getByText('Solve');

    // Change input
    fireEvent.change(input, { target: { value: '5+5=10' } });
    expect(input.value).toBe('5+5=10');

    // Before submission, equation shouldn't be updated for solving yet
    // solveEquation was only called initially with 6+4=4
    expect(utils.solveEquation).toHaveBeenCalledTimes(1);
    expect(utils.solveEquation).toHaveBeenCalledWith('6+4=4');

    // Submit form
    fireEvent.click(solveButton);

    // Now solveEquation should be called with new equation
    expect(utils.solveEquation).toHaveBeenCalledTimes(2);
    expect(utils.solveEquation).toHaveBeenCalledWith('5+5=10');
  });

  it('renders solutions correctly when they are returned by solveEquation', async () => {
    vi.mocked(utils.solveEquation).mockReturnValue(['0+4=4', '8-4=4']);

    render(<SolverWorkspace />);

    // The solution display logic uses the static equation component
    expect(screen.getByText('Added stick')).toBeDefined();
    expect(screen.getByText('Removed stick')).toBeDefined();

    // Each solution is displayed
    // Use queryAllByText because StaticEquation also renders the text, and we show it below the equation.
    expect(screen.getAllByText('0+4=4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('8-4=4').length).toBeGreaterThan(0);

    // "No solutions" message should NOT be displayed
    expect(screen.queryAllByText('No 1-stick solutions found.').length).toBe(0);
  });

  it('filters out invalid characters from input', async () => {
    render(<SolverWorkspace />);

    const input = screen.getByPlaceholderText('e.g. 6+4=4') as HTMLInputElement;

    // Initial value
    expect(input.value).toBe('6+4=4');

    // Try to enter invalid characters
    fireEvent.change(input, { target: { value: '6+4=4abc!@#' } });

    // Value should remain unchanged (or not include invalid chars if it was partially accepted,
    // but our regex checks the whole string, so it should be rejected entirely if not matching)
    expect(input.value).toBe('6+4=4');

    // Try to enter valid characters
    fireEvent.change(input, { target: { value: '1+2=3' } });
    expect(input.value).toBe('1+2=3');
  });
});
