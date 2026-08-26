import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RSVPForm from '@/components/forms/RSVPForm';

jest.mock('@/components/forms/VisualSeatMap', () => ({
  __esModule: true,
  default: ({ onSeatSelect }: { onSeatSelect: (tableId: string, seatNumber: number) => void }) => (
    <button type="button" onClick={() => onSeatSelect('table-1', 4)}>Test koltuğunu seç</button>
  ),
}));

describe('RSVPForm', () => {
  const renderForm = () => render(<RSVPForm tenantId="tenant-1" />);

  it('renders the attendance form and seat selection', () => {
    renderForm();

    expect(screen.getByRole('heading', { name: 'LCV / RSVP' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Örn: Ayşe & Mehmet Yılmaz')).toBeInTheDocument();
    expect(screen.getByText('Kaç Kişi Katılacaksınız?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test koltuğunu seç' })).toBeInTheDocument();
  });

  it('hides attendance-only fields when the guest cannot attend', () => {
    renderForm();

    fireEvent.click(screen.getByDisplayValue('no'));

    expect(screen.queryByText('Kaç Kişi Katılacaksınız?')).not.toBeInTheDocument();
    expect(screen.queryByText('Alerji / Özel Menü Talebi')).not.toBeInTheDocument();
  });

  it('shows the full-name validation message for an empty submission', async () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Cevabı Gönder' }));

    await waitFor(() => {
      expect(screen.getByText('Lütfen adınızı ve soyadınızı girin.')).toBeInTheDocument();
    });
  });
});
