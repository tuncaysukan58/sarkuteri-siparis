import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';

export const metadata: Metadata = {
  title: 'Gurme Şarküteri — İlçe İçi Taze & Hızlı Sipariş',
  description: 'Geleneksel peynirler, Gemlik zeytinleri, Kayseri pastırması ve yöresel şarküteri lezzetleri ilçe içi hızlı teslimatla kapınızda.',
  keywords: 'şarküteri, ezine peyniri, pastırma, zeytin, ilçe içi sipariş, taze şarküteri, gurme kahvaltı',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className="min-h-screen bg-[#faf7f2] text-stone-900 antialiased flex flex-col justify-between selection:bg-amber-500 selection:text-white">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
