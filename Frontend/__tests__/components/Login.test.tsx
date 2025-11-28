import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Login } from '@/pages/Login';
import { authService } from '@/services/authService';

// Mock the auth service
vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn()
  }
}));

describe('Login Component', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with empty email and password fields', () => {
    render(<Login onLogin={mockOnLogin} />);

    const emailInput = screen.getByLabelText(/E-Mail Adresse/i);
    const passwordInput = screen.getByLabelText(/Passwort/i);

    // Security: Verify no hardcoded credentials are pre-filled
    expect(emailInput).toHaveValue('');
    expect(passwordInput).toHaveValue('');
  });

  it('shows error message for invalid credentials', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<Login onLogin={mockOnLogin} />);

    const emailInput = screen.getByLabelText(/E-Mail Adresse/i);
    const passwordInput = screen.getByLabelText(/Passwort/i);
    const submitButton = screen.getByRole('button', { name: /Authentifizieren/i });

    // Fill in credentials
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Ungültige Zugangsdaten/i)).toBeInTheDocument();
    });

    // Verify onLogin was not called
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('calls onLogin with user data on successful login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'ADMIN' as const,
      firstName: 'Test',
      lastName: 'User',
      tenants: []
    };

    vi.mocked(authService.login).mockResolvedValueOnce({
      token: 'test-token',
      user: mockUser
    });

    render(<Login onLogin={mockOnLogin} />);

    const emailInput = screen.getByLabelText(/E-Mail Adresse/i);
    const passwordInput = screen.getByLabelText(/Passwort/i);
    const submitButton = screen.getByRole('button', { name: /Authentifizieren/i });

    // Fill in credentials
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
    fireEvent.click(submitButton);

    // Wait for login to complete
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(mockUser);
    });

    // Verify authService.login was called with correct credentials
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'correctpassword');
  });

  it('disables submit button and shows loading state during login', async () => {
    vi.mocked(authService.login).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<Login onLogin={mockOnLogin} />);

    const emailInput = screen.getByLabelText(/E-Mail Adresse/i);
    const passwordInput = screen.getByLabelText(/Passwort/i);
    const submitButton = screen.getByRole('button', { name: /Authentifizieren/i });

    // Fill in credentials
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    // Button should be in loading state (disabled)
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('validates required fields', () => {
    render(<Login onLogin={mockOnLogin} />);

    const emailInput = screen.getByLabelText(/E-Mail Adresse/i);
    const passwordInput = screen.getByLabelText(/Passwort/i);

    // Both fields should be required
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('has proper email input type', () => {
    render(<Login onLogin={mockOnLogin} />);

    const emailInput = screen.getByLabelText(/E-Mail Adresse/i);

    // Email input should have type="email"
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('has proper password input type', () => {
    render(<Login onLogin={mockOnLogin} />);

    const passwordInput = screen.getByLabelText(/Passwort/i);

    // Password input should have type="password"
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
