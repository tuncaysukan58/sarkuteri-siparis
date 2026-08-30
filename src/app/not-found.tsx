import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-20 h-20 bg-amber-100 text-amber-800 rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-sm">
        🧀
      </div>
      <h1 className="text-3xl font-extrabold text-stone-900 font-serif mb-2">Sayfa Bulunamadı (404)</h1>
      <p className="text-sm text-stone-600 max-w-sm mb-6">
        Aradığınız şarküteri sayfası mevcut değil veya taşınmış olabilir.
      </p>
      <Link
        href="/"
        className="bg-emerald-950 hover:bg-emerald-900 text-amber-100 font-bold px-6 py-3 rounded-2xl text-xs transition-all shadow-md"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
