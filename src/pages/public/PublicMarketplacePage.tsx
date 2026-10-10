import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Modal } from '../../components/common/Modal';
import { dataService } from '../../services/dataService';
import { marketplaceService } from '../../services/marketplaceService';
import { MarketplaceProduct } from '../../types';
import { SearchIcon, CartIcon, FilterIcon, EyeIcon } from '../../components/common/Icons';
import { getProduceImage } from '../../assets/assetRegistry';

export const PublicMarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramSearch = searchParams.get('search') || '';
  const paramCategory = searchParams.get('category') || 'ALL';
  const paramProductId = searchParams.get('product');

  const [products, setProducts] = useState<MarketplaceProduct[]>(() =>
    dataService.getProducts().filter(p => p.status === 'Active')
  );

  useEffect(() => {
    const load = async () => {
      try {
        const live = await marketplaceService.getProducts();
        if (live.length > 0) setProducts(live);
      } catch (err) {
        console.warn('Public marketplace live load notice:', err);
      }
    };
    load();
  }, []);

  const [search, setSearch] = useState(paramSearch);
  const [category, setCategory] = useState(paramCategory);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [promptAction, setPromptAction] = useState('purchase produce lots');

  // Automatically select product if ?product=ID is present in URL
  useEffect(() => {
    if (paramProductId && products.length > 0) {
      const found = products.find(p => p.product_id === paramProductId);
      if (found) setSelectedProduct(found);
    }
  }, [paramProductId, products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        p =>
          p.product_name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.seller_name.toLowerCase().includes(q) ||
          p.seller_location.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category !== 'ALL') {
      list = list.filter(p => p.category === category);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price_per_unit - b.price_per_unit);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price_per_unit - a.price_per_unit);
    }

    return list;
  }, [products, search, category, sortBy]);

  const handleAuthenticatedAction = (actionName: string) => {
    setPromptAction(actionName);
    setAuthPromptOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f5f7f4] flex flex-col text-[#1c2e22]">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Page Banner */}
        <div className="border-b border-[#dbe3d8] pb-5">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1b5e20] block mb-1">
            OPEN AGRICULTURAL COMMODITY DISCOVERY
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#14291a]">
            Farm-to-Market Produce Exchange
          </h1>
          <p className="text-xs text-[#5e7362] mt-1 max-w-2xl leading-relaxed">
            Browse verified wholesale crop batches listed directly by accredited agrarian producers across Maharashtra, Punjab, and Tamil Nadu.
          </p>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-white border border-[#dbe3d8] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Prominent Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#758a78]">
              <SearchIcon size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search produce, crop or category (e.g. Basmati, Mango, Turmeric)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] placeholder-[#88998a] focus:outline-none focus:border-[#1b5e20]"
            />
          </div>

          {/* Category & Sorting Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
            >
              <option value="ALL">All Categories</option>
              <option value="Grains">Grains & Cereals</option>
              <option value="Fruits">Fresh Fruits</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Pulses">Pulses & Legumes</option>
              <option value="Spices">Spices</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
            >
              <option value="newest">Sort: Recently Harvested</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* RESULTS COUNT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-[#5f7563]">
          <span>
            Showing <strong className="text-[#14291a] tabular-nums">{filteredProducts.length}</strong> available agricultural produce lots
          </span>
          <span className="text-[11px]">
            Direct Farm Gate Pricing · Escrow Protected
          </span>
        </div>

        {/* PRODUCT CARDS GRID */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.product_id}
                className="bg-white border border-[#dbe3d8] hover:border-[#1b5e20] transition-colors flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  <div className="h-48 overflow-hidden relative border-b border-[#e2e8df]">
                    <img
                      src={product.image_url && !product.image_url.includes('1790771887999') ? product.image_url : getProduceImage(product.product_name || product.category)}
                      alt={product.product_name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-[#0e2416]/85 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {product.category}
                    </div>
                    <div className="absolute top-2 right-2 bg-white px-2 py-0.5 text-[10px] font-bold text-[#1b5e20] border border-[#dbe3d8]">
                      {product.certification}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-sm font-bold font-display text-[#14291a] leading-tight">
                        {product.product_name}
                      </h3>
                      <span className="text-[10px] font-bold text-[#1b5e20] px-1.5 py-0.5 bg-[#eef4ec] border border-[#d2e0cf] shrink-0">
                        {product.grade}
                      </span>
                    </div>

                    <p className="text-xs text-[#526655] line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="text-[11px] text-[#637966] pt-1">
                      Producer: <strong className="text-[#14291a]">{product.seller_name}</strong> · {product.seller_location}
                    </div>

                    <div className="pt-2 border-t border-[#edf1ea] flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] uppercase text-[#718774] block">Lot Price</span>
                        <span className="text-base font-bold font-display text-[#14291a] tabular-nums">
                          ₹{product.price_per_unit.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-[#5c7360]"> / {product.unit}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase text-[#718774] block">Available Lot</span>
                        <span className="text-xs font-bold text-[#1b5e20] tabular-nums">
                          {product.available_qty} {product.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#fafbfa] border-t border-[#edf1ea] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="px-3 py-1 text-xs font-semibold border border-[#c9d4c6] hover:bg-[#edf2ea] text-[#2f4734] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <EyeIcon size={13} />
                    <span>View Details</span>
                  </button>

                  <button
                    onClick={() => handleAuthenticatedAction('add items to procurement cart')}
                    className="px-3 py-1 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <CartIcon size={12} />
                    <span>Procure Lot</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#dbe3d8] p-12 text-center text-xs text-[#6e8571]">
            No agricultural produce lots match your search query. Try another keyword or reset filters.
          </div>
        )}
      </main>

      {/* PRODUCT DETAILS MODAL */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Agricultural Produce Lot Specification"
        subtitle={selectedProduct ? `${selectedProduct.product_name} (${selectedProduct.product_id})` : ''}
        maxWidth="lg"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="h-52 overflow-hidden border border-[#dbe3d8]">
              <img
                src={selectedProduct.image_url && !selectedProduct.image_url.includes('1790771887999') ? selectedProduct.image_url : getProduceImage(selectedProduct.product_name || selectedProduct.category)}
                alt={selectedProduct.product_name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1b5e20] bg-[#eef4ec] px-2 py-0.5 border border-[#d2e0cf]">
                  {selectedProduct.grade} · {selectedProduct.certification}
                </span>
                <span className="text-xs text-[#6e8571] tabular-nums">
                  Harvest: {selectedProduct.harvest_date}
                </span>
              </div>

              <h3 className="text-base font-bold font-display text-[#14291a]">
                {selectedProduct.product_name}
              </h3>

              <p className="text-xs text-[#526655] leading-relaxed">
                {selectedProduct.description}
              </p>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#f8faf7] border border-[#dbe3d8] text-xs">
                <div>
                  <span className="text-[10px] text-[#718774] block uppercase">Wholesale Price</span>
                  <strong className="text-base text-[#14291a] font-display tabular-nums">
                    ₹{selectedProduct.price_per_unit.toLocaleString('en-IN')}
                  </strong>
                  <span className="text-[11px] text-[#5e7362]"> / {selectedProduct.unit}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#718774] block uppercase">Available Volume</span>
                  <strong className="text-sm text-[#1b5e20] tabular-nums">
                    {selectedProduct.available_qty} {selectedProduct.unit}
                  </strong>
                </div>
                <div className="col-span-2 pt-1 border-t border-[#edf1ea]">
                  <span className="text-[10px] text-[#718774] block uppercase">Agrarian Producer & Region</span>
                  <span className="font-semibold text-[#14291a]">{selectedProduct.seller_name}</span>
                  <span className="text-[11px] text-[#5e7362] block">{selectedProduct.seller_location}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#edf1ea] flex justify-end gap-2">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-3.5 py-1.5 text-xs font-semibold border border-[#c9d4c6] bg-white text-[#455c48]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  handleAuthenticatedAction('procure this lot');
                }}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#1b5e20] text-white hover:bg-[#144719] cursor-pointer"
              >
                Procure This Produce Lot
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* LOGIN TO CONTINUE MODAL */}
      <Modal
        isOpen={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        title="Account Authentication Required"
        subtitle="Sign in or register an accredited account to execute transactions"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-[#354c38]">
          <p className="leading-relaxed">
            Direct wholesale produce procurement, cart booking, and digital escrow transactions require an authenticated <strong>Buyer</strong> or <strong>Farmer</strong> account.
          </p>

          <div className="p-3 bg-[#f5f8f3] border border-[#d2e0cf] space-y-1">
            <span className="font-bold text-[#14291a] block">Why register on EarthRakshak?</span>
            <ul className="space-y-1 text-[#455c47] list-disc list-inside">
              <li>Direct farm gate pricing with zero mandi cess</li>
              <li>Cold-chain carrier transit & live GPS docket tracking</li>
              <li>GST tax invoices and electronic gate clearance passes</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-[#edf1ea]">
            <Link
              to="/login"
              className="py-2 px-4 text-center text-xs font-bold uppercase tracking-wider bg-[#1b5e20] text-white hover:bg-[#144719] transition-colors"
            >
              Sign In to Existing Account
            </Link>
            <Link
              to="/register"
              className="py-2 px-4 text-center text-xs font-bold uppercase tracking-wider border border-[#1b5e20] text-[#1b5e20] hover:bg-[#eef4ec] transition-colors"
            >
              Register New Account
            </Link>
          </div>
        </div>
      </Modal>

      <PublicFooter />
    </div>
  );
};
