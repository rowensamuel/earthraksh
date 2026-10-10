import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { dataService } from '../../services/dataService';
import { marketplaceService } from '../../services/marketplaceService';
import { MarketplaceProduct } from '../../types';
import { CartIcon, TrashIcon } from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';
import { getProduceImage } from '../../assets/assetRegistry';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);

  useEffect(() => {
    loadWishlist();
    const handleUpdate = () => loadWishlist();
    window.addEventListener('earthrakshak_storage_update', handleUpdate);
    return () => window.removeEventListener('earthrakshak_storage_update', handleUpdate);
  }, []);

  const loadWishlist = async () => {
    const ids = dataService.getWishlist();
    setWishlistIds(ids);
    try {
      const live = await marketplaceService.getProducts();
      if (live.length > 0) {
        setProducts(live.filter(p => ids.includes(p.product_id)));
        return;
      }
    } catch {
      // fallback
    }
    const all = dataService.getProducts();
    setProducts(all.filter(p => ids.includes(p.product_id)));
  };

  const handleRemove = (id: string) => {
    dataService.toggleWishlist(id);
    loadWishlist();
    showToast('Removed from Wishlist', 'info');
  };

  const handleAddToCart = (product: MarketplaceProduct) => {
    dataService.addToCart(product, 1);
    showToast('Added to Cart', 'success', `${product.product_name} added to cart.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Saved Produce Lots"
        title="Procurement Wishlist & Monitored Lots"
        description="Bookmarked seasonal crop batches and certified agricultural lots monitored for procurement timing."
      />

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map(product => (
            <div
              key={product.product_id}
              className="bg-white border border-[#dbe3d8] flex flex-col justify-between overflow-hidden"
            >
              <div>
                <div className="h-40 overflow-hidden relative border-b border-[#e2e8df]">
                  <img
                    src={product.image_url && !product.image_url.includes('1790771887999') ? product.image_url : getProduceImage(product.product_name || product.category)}
                    alt={product.product_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-[#0e2416]/85 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {product.category}
                  </div>
                  <button
                    onClick={() => handleRemove(product.product_id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 text-[#b91c1c] hover:bg-white transition-colors"
                    title="Remove from wishlist"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  <h3
                    onClick={() => navigate(`/buyer/product/${product.product_id}`)}
                    className="text-sm font-bold font-display text-[#14291a] hover:text-[#1b5e20] cursor-pointer"
                  >
                    {product.product_name}
                  </h3>
                  <p className="text-[11px] text-[#5e7362]">
                    Producer: <strong>{product.seller_name}</strong> · {product.seller_location}
                  </p>

                  <div className="pt-2 border-t border-[#edf1ea] flex items-baseline justify-between">
                    <div>
                      <span className="text-base font-bold font-display text-[#14291a] tabular-nums">
                        ₹{product.price_per_unit.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-[#5c7360]"> / {product.unit}</span>
                    </div>
                    <span className="text-xs font-semibold text-[#1b5e20] tabular-nums">
                      {product.available_qty} {product.unit} in stock
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#fafbfa] border-t border-[#edf1ea] flex items-center justify-between">
                <span className="text-[11px] text-[#718774]">{product.grade}</span>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="px-3 py-1 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] flex items-center gap-1 transition-colors"
                >
                  <CartIcon size={12} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#dbe3d8] p-12 text-center text-xs text-[#6e8571]">
          Your wishlist is currently empty.
          <div className="mt-4">
            <Link to="/buyer/marketplace" className="text-xs font-semibold text-[#1b5e20] hover:underline">
              ← Browse Marketplace Produce
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
