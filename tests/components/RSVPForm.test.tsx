import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RSVPForm from '@/components/forms/RSVPForm';

describe('RSVPForm Component', () => {
  it('renders correctly with default fields', () => {
    render(<RSVPForm />);
    
    // Check if the title is rendered
    expect(screen.getByText('LCV / RSVP')).toBeInTheDocument();
    
    // Check if the name input is present
    expect(screen.getByPlaceholderText('Örn: Ayşe & Mehmet Yılmaz')).toBeInTheDocument();
    
    // Check if the attending radio buttons are present
    expect(screen.getByText('Katılacağız')).toBeInTheDocument();
    expect(screen.getByText('Katılamayacağız')).toBeInTheDocument();
    
    // Check if the guest count dropdown is present since "Katılacağız" is default
    expect(screen.getByText('Kaç Kişi Katılacaksınız?')).toBeInTheDocument();
  });

  it('hides guest count and allergies when "Katılamayacağız" is selected', () => {
    render(<RSVPForm />);
    
    const notAttendingRadio = screen.getByDisplayValue('no');
    fireEvent.click(notAttendingRadio);
    
    expect(screen.queryByText('Kaç Kişi Katılacaksınız?')).not.toBeInTheDocument();
    expect(screen.queryByText('Alerji / Özel Menü Talebi')).not.toBeInTheDocument();
  });

  it('shows validation errors when submitted empty', async () => {
    render(<RSVPForm />);
    
    const submitButton = screen.getByRole('button', { name: /Cevabı Gönder/i });
    fireEvent.click(submitButton);
    
    // Wait for zod validation message
    await waitFor(() => {
      expect(screen.getByText('Lütfen adınızı ve soyadınızı girin.')).toBeInTheDocument();
    });
  });
});
