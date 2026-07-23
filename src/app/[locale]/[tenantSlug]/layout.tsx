import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: Promise<{ tenantSlug: string, locale: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const tenantSlug = resolvedParams.tenantSlug;
  
  const supabase = await createClient();
  const { data: tenant } = await supabase
    .from('tenants')
    .select('bride_name, groom_name, hero_image_url, site_config')
    .eq('slug', tenantSlug)
    .single();

  if (!tenant) {
    return {
      title: 'Davetiye Bulunamadı',
      description: 'Böyle bir davetiye veya etkinlik bulunamadı.'
    };
  }

  const isCorporate = tenant.site_config?.template_type === 'corporate';
  const title = isCorporate 
    ? `${tenant.bride_name} - ${tenant.groom_name}` 
    : `${tenant.bride_name} & ${tenant.groom_name} Evleniyor!`;
    
  const description = isCorporate
    ? 'Etkinlik detaylarımızı görmek ve katılım durumunuzu (L.C.V.) bildirmek için tıklayın.'
    : 'Düğün davetiyemizi görmek, hikayemizi okumak ve LCV formunu doldurmak için tıklayın.';
  const image = tenant.hero_image_url || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
