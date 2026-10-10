import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { dataService } from '../../services/dataService';
import { marketplaceService } from '../../services/marketplaceService';
import { MarketplaceProduct } from '../../types';
import { CartIcon, WishlistIcon, CheckIcon, ChevronLeftIcon } from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';
import { getProduceImage } from '../../assets/assetRegistry';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      const p = await marketplaceService.getProduct(productId);
      if (p) {
        setProduct(p);
        setIsWishlisted(dataService.getWishlist().includes(productId));
      }
    } catch (err) {
      console.warn('Product detail fetch error:', err);
    }
  };

  if (!product) {
    return (
      <div className="bg-white border border-[#dbe3d8] p-12 text-center text-xs text-[#6e8571]">
        Product not found or has been delisted from the agricultural exchange.
        <div className="mt-4">
          <Link to="/buyer/marketplace" className="text-xs font-semibold text-[#1b5e20] hover:underline">
            ← Return to Marketplace Catalog
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    dataService.addToCart(product, quantity);
    showToast('Cart Updated', 'success', `${quantity} ${product.unit} of ${product.product_name} added.`);
  };

  const handleToggleWishlist = () => {
    const added = dataService.toggleWishlist(product.product_id);
    setIsWishlisted(added);
    showToast(added ? 'Saved to Wishlist' : 'Removed from Wishlist', 'info');
  };

  const subtotal = product.price_per_unit * quantity;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[#5f7562]">
        <Link to="/buyer/marketplace" className="hover:text-[#1b5e20] flex items-center gap-1">
          <ChevronLeftIcon size={14} />
          <span>Back to Marketplace</span>
        </Link>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span className="font-semibold text-[#14291a]">{product.product_name}</span>
      </div>

      <div className="bg-white border border-[#dbe3d8] grid grid-cols-1 md:grid-cols-12 gap-6 p-4 sm:p-6">
        {/* Left Image Showcase */}
        <div className="md:col-span-6 space-y-4">
          <div className="h-64 sm:h-80 w-full overflow-hidden border border-[#dbe3d8] relative bg-[#f7f9f6]">
            <img
              src={product.image_url && !product.image_url.includes('1790771887999') ? product.image_url : getProduceImage(product.product_name || product.category)}
              alt={product.product_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-[#0f2416]/85 text-white px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
              {product.category}
            </div>
          </div>

          <div className="p-3 bg-[#fafbfa] border border-[#edf1ea] flex flex-wrap items-center justify-between gap-2 text-xs text-[#526655]">
            <span>Harvest Date: <strong className="text-[#14291a] tabular-nums">{product.harvest_date}</strong></span>
            <span>Accredited: <strong className="text-[#1b5e20]">{product.certification}</strong></span>
          </div>
        </div>

        {/* Right Product Specs & Purchase Action */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1b5e20] px-2 py-0.5 bg-[#eef4ec] border border-[#d2e0cf]">
                {product.grade}
              </span>
              <StatusBadge status={product.status} />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-display text-[#14291a] leading-tight break-words">
              {product.product_name}
            </h1>

            <div className="text-xs text-[#5e7362] pb-2 border-b border-[#edf1ea]">
              Produced by: <strong className="text-[#14291a] font-semibold">{product.seller_name}</strong>
              <span className="mx-1.5">·</span>
              <span>{product.seller_location}</span>
            </div>

            <p className="text-xs text-[#354c38] leading-relaxed">
              {product.description}
            </p>

            {/* Price Box */}
            <div className="p-4 bg-[#f8faf7] border border-[#dbe3d8] flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#627a66] block">Wholesale Rate</span>
                <span className="text-xl sm:text-2xl font-bold font-display text-[#14291a] tabular-nums">
                  ₹{product.price_per_unit.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#637966]"> per {product.unit}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#627a66] block">Available Stock</span>
                <span className="text-sm font-bold text-[#1b5e20] tabular-nums">
                  {product.available_qty} {product.unit} in plot lot
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#304734] mb-1.5">
                Select Procurement Quantity ({product.unit}):
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center border border-[#c9d4c6] bg-white">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-sm font-bold text-[#304734] hover:bg-[#edf2ea] transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold tabular-nums text-[#14291a]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.available_qty, q + 1))}
                    className="px-3 py-1.5 text-sm font-bold text-[#304734] hover:bg-[#edf2ea] transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs text-[#526655]">
                  Calculated Subtotal: <strong className="text-base text-[#14291a] tabular-nums font-display">₹{subtotal.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#edf1ea] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#1b5e20] text-white hover:bg-[#144719] transition-colors flex items-center justify-center gap-2"
            >
              <CartIcon size={16} />
              <span>Add to Cart ({quantity} {product.unit})</span>
            </button>

            <button
              onClick={handleToggleWishlist}
              className={`px-4 py-2.5 text-xs font-semibold border transition-colors flex items-center justify-center gap-2 ${
                isWishlisted
                  ? 'border-[#1b5e20] bg-[#eef4ec] text-[#1b5e20]'
                  : 'border-[#c9d4c6] bg-white text-[#455c48] hover:bg-[#edf2ea]'
              }`}
            >
              <WishlistIcon size={16} />
              <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
