export default function ProductCard({ product, index = 0 }) {
  return (
    <div
      className="group flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(45,52,53,0.06)] transition-all duration-300 hover:shadow-lg animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
            Fits Budget
          </span>
          <div className="w-8 h-8 rounded-full bg-primary-container/30 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
        </div>
        <h3 className="font-headline text-lg font-bold text-on-surface leading-snug mt-3 mb-4">
          {product.name}
        </h3>
        <a
          href={product.link_of_product}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto w-full py-3 bg-primary text-on-primary rounded-full font-headline text-xs font-bold tracking-widest uppercase transition-all hover:bg-primary-dim active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">open_in_new</span>
          View Product
        </a>
      </div>
    </div>
  );
}
