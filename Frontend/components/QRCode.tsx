import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeProps {
  data: string;
  size?: number;
  className?: string;
}

/**
 * QRCodeDisplay Component
 *
 * Generates QR codes locally using the qrcode library for enhanced security.
 * Replaces external QR code services (e.g., api.qrserver.com) to avoid:
 * - Data leakage to third-party services
 * - Dependency on external service availability
 * - Potential MITM attacks
 *
 * @param data - The data to encode in the QR code (e.g., payment link)
 * @param size - The size of the QR code in pixels (default: 128)
 * @param className - Additional CSS classes for styling
 */
export const QRCodeDisplay: React.FC<QRCodeProps> = ({
  data,
  size = 128,
  className = ''
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(data, {
          width: size,
          margin: 1,
          color: {
            dark: '#0a0f14', // Dark color for QR code pattern
            light: '#ffffff', // White background
          },
          errorCorrectionLevel: 'M', // Medium error correction
        });
        setQrUrl(url);
        setError('');
      } catch (err) {
        console.error('QR code generation failed:', err);
        setError('Failed to generate QR code');
      }
    };

    if (data) {
      generateQR();
    }
  }, [data, size]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-red-50 text-red-600 text-xs font-bold p-4 rounded ${className}`}
        style={{ width: size, height: size }}
      >
        {error}
      </div>
    );
  }

  if (!qrUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 animate-pulse ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-slate-400">Generating...</span>
      </div>
    );
  }

  return (
    <img
      src={qrUrl}
      alt="QR Code"
      className={className}
      style={{ width: size, height: size }}
    />
  );
};
