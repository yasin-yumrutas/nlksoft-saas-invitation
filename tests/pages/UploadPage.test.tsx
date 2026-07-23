import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UploadPage from '@/app/[locale]/upload/page';

describe('UploadPage', () => {
  it('renders the upload instructions correctly', () => {
    render(<UploadPage />);
    
    expect(screen.getByText('Anı Ekle')).toBeInTheDocument();
    expect(screen.getByText(/Düğünümüzde çektiğiniz en güzel fotoğrafları/)).toBeInTheDocument();
  });

  it('disables the submit button initially', () => {
    render(<UploadPage />);
    
    const submitButton = screen.getByRole('button', { name: /Gönder/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables the submit button after selecting a file', async () => {
    render(<UploadPage />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const testFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
    
    fireEvent.change(fileInput, { target: { files: [testFile] } });
    
    // The button should now be enabled
    const submitButton = screen.getByRole('button', { name: /Gönder/i });
    expect(submitButton).not.toBeDisabled();
    
    // The filename should be displayed
    expect(screen.getByText('test.png')).toBeInTheDocument();
  });
});
