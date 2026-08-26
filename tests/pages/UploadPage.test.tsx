import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import UploadPage from '@/app/[locale]/[tenantSlug]/upload/page';

describe('UploadPage', () => {
  it('explains the moderated guest-media flow', () => {
    render(<UploadPage />);

    expect(screen.getByRole('heading', { name: 'Anı Ekle' })).toBeInTheDocument();
    expect(screen.queryByText(/yönetici onayına gönderildi/i)).not.toBeInTheDocument();
    expect(screen.getByText(/en güzel fotoğrafları/i)).toBeInTheDocument();
  });

  it('enables upload only after a media file is selected', () => {
    render(<UploadPage />);
    const submitButton = screen.getByRole('button', { name: 'Gönder' });

    expect(submitButton).toBeDisabled();

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [new File(['preview'], 'hatira.png', { type: 'image/png' })] },
    });

    expect(submitButton).toBeEnabled();
    expect(screen.getByText('hatira.png')).toBeInTheDocument();
  });
});
