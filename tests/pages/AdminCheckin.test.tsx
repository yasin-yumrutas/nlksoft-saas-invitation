import React, { Suspense } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import CheckinAdminPage from '@/app/[locale]/[tenantSlug]/admin/checkin/page';

const renderScanner = jest.fn();
const clearScanner = jest.fn().mockResolvedValue(undefined);

jest.mock('html5-qrcode', () => ({
  Html5QrcodeScanner: jest.fn().mockImplementation(() => ({
    render: renderScanner,
    clear: clearScanner,
    pause: jest.fn(),
    resume: jest.fn(),
  })),
}));

const query = {
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
};
query.select.mockReturnValue(query);
query.eq.mockReturnValue(query);
query.single.mockResolvedValue({ data: { id: 'tenant-1' }, error: null });

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: jest.fn(() => query) }),
}));

describe('CheckinAdminPage', () => {
  it('initializes the tenant-scoped QR scanner and shows operator guidance', async () => {
    const params = Promise.resolve({ locale: 'tr', tenantSlug: 'demo-event' });

    await act(async () => {
      render(
        <Suspense fallback={<div>Hazırlanıyor</div>}>
          <CheckinAdminPage params={params} />
        </Suspense>,
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'QR Kod Okuyucu' })).toBeInTheDocument();
    });
    expect(screen.getByText(/mekan girişindeki davetlilerin QR kodlarını/i)).toBeInTheDocument();
    expect(renderScanner).toHaveBeenCalledTimes(1);
  });
});
