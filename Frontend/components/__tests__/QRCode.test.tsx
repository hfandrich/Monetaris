import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QRCodeDisplay } from '../QRCode';
import QRCode from 'qrcode';

// Mock the qrcode library
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(),
  },
}));

describe('QRCodeDisplay', () => {
  it('renders loading state initially', () => {
    vi.mocked(QRCode.toDataURL).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<QRCodeDisplay data="test-data" />);
    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });

  it('renders QR code after generation', async () => {
    const mockDataURL = 'data:image/png;base64,mockbase64data';
    vi.mocked(QRCode.toDataURL).mockResolvedValue(mockDataURL);

    render(<QRCodeDisplay data="test-data" size={200} />);

    await waitFor(() => {
      const img = screen.getByAltText('QR Code');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', mockDataURL);
    });
  });

  it('calls QRCode.toDataURL with correct options', async () => {
    const mockDataURL = 'data:image/png;base64,mockbase64data';
    vi.mocked(QRCode.toDataURL).mockResolvedValue(mockDataURL);

    render(<QRCodeDisplay data="https://example.com/payment/123" size={150} />);

    await waitFor(() => {
      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        'https://example.com/payment/123',
        expect.objectContaining({
          width: 150,
          margin: 1,
          color: {
            dark: '#0a0f14',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        })
      );
    });
  });

  it('displays error message when QR generation fails', async () => {
    vi.mocked(QRCode.toDataURL).mockRejectedValue(new Error('Generation failed'));

    render(<QRCodeDisplay data="test-data" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to generate QR code')).toBeInTheDocument();
    });
  });

  it('applies custom className', async () => {
    const mockDataURL = 'data:image/png;base64,mockbase64data';
    vi.mocked(QRCode.toDataURL).mockResolvedValue(mockDataURL);

    render(<QRCodeDisplay data="test-data" className="custom-class" />);

    await waitFor(() => {
      const img = screen.getByAltText('QR Code');
      expect(img).toHaveClass('custom-class');
    });
  });

  it('uses default size of 128 when not specified', async () => {
    const mockDataURL = 'data:image/png;base64,mockbase64data';
    vi.mocked(QRCode.toDataURL).mockResolvedValue(mockDataURL);

    render(<QRCodeDisplay data="test-data" />);

    await waitFor(() => {
      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        'test-data',
        expect.objectContaining({
          width: 128,
        })
      );
    });
  });

  it('regenerates QR code when data changes', async () => {
    const mockDataURL1 = 'data:image/png;base64,mockdata1';
    const mockDataURL2 = 'data:image/png;base64,mockdata2';

    vi.mocked(QRCode.toDataURL)
      .mockResolvedValueOnce(mockDataURL1)
      .mockResolvedValueOnce(mockDataURL2);

    const { rerender } = render(<QRCodeDisplay data="data1" />);

    await waitFor(() => {
      expect(screen.getByAltText('QR Code')).toHaveAttribute('src', mockDataURL1);
    });

    rerender(<QRCodeDisplay data="data2" />);

    await waitFor(() => {
      expect(screen.getByAltText('QR Code')).toHaveAttribute('src', mockDataURL2);
    });

    expect(QRCode.toDataURL).toHaveBeenCalledTimes(2);
  });
});
