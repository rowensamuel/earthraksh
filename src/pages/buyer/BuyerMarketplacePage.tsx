import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { dataService } from '../../services/dataService';
import { marketplaceService } from '../../services/marketplaceService';
import { MarketplaceProduct } from '../../types';
import { SearchIcon, CartIcon, WishlistIcon } from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';
import { getProduceImage } from '../../assets/assetRegistry';

export const BuyerMarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCert, setSelectedCert] = useState('ALL');
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
    setWishlist(dataService.getWishlist());
    const handleUpdate = () => {
      setWishlist(dataService.getWishlist());
    };
    window.addEventListener('earthrakshak_storage_update', handleUpdate);
    return () => window.removeEventListener('earthrakshak_storage_update', handleUpdate);
  }, []);

  const loadProducts = async () => {
    try {
      const prods = await marketplaceService.getProducts();
      setProducts(prods);
    } catch (err) {
      console.warn('Marketplace fetch error:', err);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: MarketplaceProduct) => {
    e.stopPropagation();
    dataService.addToCart(product, 1);
    showToast('Added to Cart', 'success', `${product.product_name} added to procurement cart.`);
  };

  const handleToggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const added = dataService.toggleWishlist(productId);
    setWishlist(dataService.getWishlist());
    showToast(added ? 'Saved to Wishlist' : 'Removed from Wishlist', 'info');
  };

  const filteredProducts = products.filter(p => {
    const pName = p.product_name || '';
    const sName = p.seller_name || '';
    const sLoc = p.seller_location || '';
    const sTerm = search.toLowerCase();
    const matchesSearch = pName.toLowerCase().includes(sTerm) ||
      sName.toLowerCase().includes(sTerm) ||
      sLoc.toLowerCase().includes(sTerm);
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesCert = selectedCert === 'ALL' || p.certification === selectedCert;
    return matchesSearch && matchesCat && matchesCert;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        category="Direct Agricultural Exchange"
        title="Commodity Produce Catalog & Procurement"
        description="Source verified produce directly from certified organic and Good Agricultural Practices (GAP) farm holdings with zero mandi intermediary commissions."
        actions={
          <button
            onClick={() => navigate('/buyer/cart')}
            className="px-3.5 py-1.5 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] flex items-center gap-1.5 transition-colors"
          >
            <CartIcon size={14} />
            <span>Go to Cart ({dataService.getCart().reduce((a, i) => a + i.quantity, 0)})</span>
          </button>
        }
      />

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border border-[#dbe3d8] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#758a78]">
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search produce (e.g. Basmati, Mango, Turmeric, Wheat)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] placeholder-[#88998a] focus:outline-none focus:border-[#1b5e20]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
          >
            <option value="ALL">All Categories</option>
            <option value="Grains">Grains & Cereals</option>
            <option value="Fruits">Fresh Fruits</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Pulses">Pulses & Legumes</option>
            <option value="Spices">Spices</option>
          </select>

          <select
            value={selectedCert}
            onChange={e => setSelectedCert(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
          >
            <option value="ALL">All Certifications</option>
            <option value="Organic India">Organic India</option>
            <option value="GAP Certified">GAP Certified</option>
            <option value="Fair Trade">Fair Trade</option>
          </select>
        </div>
      </div>

      {/* PRODUCE LOTS GRID */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map(product => {
            const isWishlisted = wishlist.includes(product.product_id);
            return (
              <div
                key={product.product_id}
                onClick={() => navigate(`/buyer/product/${product.product_id}`)}
                className="bg-white border border-[#dbe3d8] hover:border-[#1b5e20] transition-colors cursor-pointer flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  <div className="h-48 overflow-hidden relative border-b border-[#e2e8df]">
                    <img
                      src={product.image_url && !product.image_url.includes('1790771887999') ? product.image_url : getProduceImage(product.product_name || product.category)}
                      alt={product.product_name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-[#0e2416]/85 backdrop-blur-xs text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {product.category}
                    </div>

                    <button
                      onClick={e => handleToggleWishlist(e, product.product_id)}
                      className={`absolute top-2 right-2 p-1.5 transition-colors ${
                        isWishlisted
                          ? 'bg-[#1b5e20] text-white'
                          : 'bg-white/90 text-[#3d5440] hover:text-[#1b5e20]'
                      }`}
                      title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <WishlistIcon size={14} />
                    </button>
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

                    <div className="text-[11px] text-[#637966]">
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
                  <span className="text-[11px] text-[#718774]">
                    {product.certification}
                  </span>

                  <button
                    onClick={e => handleAddToCart(e, product)}
                    className="px-3 py-1 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] transition-colors flex items-center gap-1"
                  >
                    <CartIcon size={12} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#dbe3d8] p-12 text-center text-xs text-[#6e8571]">
          No agricultural produce lots match your selected filter criteria.
        </div>
      )}
    </div>
  );
};
