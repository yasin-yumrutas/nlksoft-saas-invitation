import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckInPage from '@/app/[locale]/admin/checkin/page';

describe('Admin CheckInPage', () => {
  it('renders the checkin instructions correctly', () => {
    render(<CheckInPage />);
    
    expect(screen.getByText('QR Check-in')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Veya davet kodunu manuel girin...')).toBeInTheDocument();
  });

  it('shows error for invalid code', async () => {
    render(<CheckInPage />);
    
    const input = screen.getByPlaceholderText('Veya davet kodunu manuel girin...');
    const submitButton = screen.getByRole('button', { name: /Doğrula/i });
    
    fireEvent.change(input, { target: { value: 'INVALID-CODE' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Davetli bulunamadı veya QR Kod geçersiz.')).toBeInTheDocument();
      expect(screen.getByText('Hata')).toBeInTheDocument();
    });
  });

  it('shows success for valid code', async () => {
    render(<CheckInPage />);
    
    const input = screen.getByPlaceholderText('Veya davet kodunu manuel girin...');
    const submitButton = screen.getByRole('button', { name: /Doğrula/i });
    
    // According to mock logic in component, any code with "AHMET" works
    fireEvent.change(input, { target: { value: 'AHMET-YILMAZ-123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Giriş Başarılı')).toBeInTheDocument();
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });
  });
});
