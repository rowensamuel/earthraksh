import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { marketplaceService } from '../../services/marketplaceService';
import { MarketplaceProduct } from '../../types';
import { PlusIcon, MarketplaceIcon } from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';

export const FarmerMarketplacePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<MarketplaceProduct['category']>('Grains');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [unit, setUnit] = useState<MarketplaceProduct['unit']>('Quintal');
  const [availableQty, setAvailableQty] = useState('');
  const [certification, setCertification] = useState<MarketplaceProduct['certification']>('Organic India');
  const [grade, setGrade] = useState<MarketplaceProduct['grade']>('Grade A1');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadProducts();
  }, [currentUser]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const list = await marketplaceService.getProducts(currentUser?.user_id);
      setProducts(list);
    } catch (err: any) {
      console.error('Failed to load marketplace products from database:', err);
      showToast('Database Error', 'error', err.message || 'Could not load listings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !pricePerUnit || !availableQty) {
      showToast('Validation Error', 'error', 'Please fill product name, price, and quantity.');
      return;
    }

    try {
      await marketplaceService.addProduct({
        seller_id: currentUser?.user_id || '',
        seller_name: currentUser?.full_name || '',
        seller_location: currentUser?.address?.split(',')[1]?.trim() || 'Nashik, Maharashtra',
        product_name: productName,
        category,
        price_per_unit: parseFloat(pricePerUnit),
        unit,
        available_qty: parseFloat(availableQty),
        description: description || 'High-grade farm produce harvested directly from registered agricultural plots.',
        image_url: '/src/assets/images/agri_produce_harvest_1790771887999.jpg',
        harvest_date: new Date().toISOString().split('T')[0],
        certification,
        status: 'Active',
        rating: 5.0,
        grade
      });

      await loadProducts();
      setIsAddModalOpen(false);
      setProductName('');
      setPricePerUnit('');
      setAvailableQty('');
      setDescription('');
      showToast('Produce Listed in Database', 'success', `${productName} is now live for buyers.`);
    } catch (err: any) {
      console.error('Failed to add marketplace product to database:', err);
      showToast('Database Error', 'error', err.message || 'Failed to persist produce listing in database.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Direct Commodity Trading & Farm-to-Fork"
        title="Direct Produce Sales & Listings"
        description="Sell harvested grains, pulses, fruits, and organic vegetables directly to wholesale distributors, supermarket chains, and food processors without middlemen deductions."
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] flex items-center gap-1.5 transition-colors"
          >
            <PlusIcon size={15} />
            <span>List New Produce</span>
          </button>
        }
      />

      {/* Grid of Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map(p => (
          <div key={p.product_id} className="bg-white border border-[#dbe3d8] flex flex-col justify-between overflow-hidden">
            <div>
              <div className="h-44 overflow-hidden relative border-b border-[#e2e8df]">
                <img
                  src={p.image_url}
                  alt={p.product_name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-[#0f2416]/80 backdrop-blur-xs text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  {p.category}
                </div>
                <div className="absolute top-2 right-2 bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#1b5e20] border border-[#dbe3d8]">
                  {p.certification}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="text-sm font-bold font-display text-[#14291a] leading-tight">
                    {p.product_name}
                  </h3>
                  <StatusBadge status={p.status} />
                </div>

                <p className="text-xs text-[#5e7362] line-clamp-2 leading-relaxed">
                  {p.description}
                </p>

                <div className="pt-2 border-t border-[#edf1ea] flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-[#718774] block">Lot Price</span>
                    <span className="text-base font-bold font-display text-[#14291a] tabular-nums">
                      ₹{p.price_per_unit.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-[#5c7360]"> / {p.unit}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase text-[#718774] block">Available</span>
                    <span className="text-xs font-bold text-[#1b5e20] tabular-nums">
                      {p.available_qty} {p.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#fafbfa] border-t border-[#edf1ea] flex items-center justify-between text-xs text-[#6e8571]">
              <span className="tabular-nums">Harvested: {p.harvest_date}</span>
              <span className="font-semibold text-[#14291a]">{p.grade}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ADD PRODUCE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="List Produce on EarthRakshak Exchange"
        subtitle="Specify produce lot, pricing, certified grade, and available quantity"
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Produce Commodity Name *
            </label>
            <input
              type="text"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              placeholder="e.g. Export Grade Basmati 1121 / Red Onions"
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              >
                <option value="Grains">Grains & Cereals</option>
                <option value="Pulses">Pulses & Legumes</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fresh Fruits</option>
                <option value="Spices">Spices & Plantation</option>
                <option value="Oilseeds">Oilseeds</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Commercial Unit
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              >
                <option value="Quintal">Quintal (100 Kg)</option>
                <option value="Kg">Kg</option>
                <option value="Tonne">Metric Tonne</option>
                <option value="Box">Standard Export Box</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Price Per Unit (₹) *
              </label>
              <input
                type="number"
                value={pricePerUnit}
                onChange={e => setPricePerUnit(e.target.value)}
                placeholder="e.g. 4200"
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Available Lot Quantity *
              </label>
              <input
                type="number"
                step="0.5"
                value={availableQty}
                onChange={e => setAvailableQty(e.target.value)}
                placeholder="e.g. 80"
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Certification Tag
              </label>
              <select
                value={certification}
                onChange={e => setCertification(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              >
                <option value="Organic India">Organic India Certified</option>
                <option value="GAP Certified">Good Agricultural Practices (GAP)</option>
                <option value="Fair Trade">Fair Trade Certified</option>
                <option value="Conventional">Conventional Tested</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Quality Grade
              </label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              >
                <option value="Grade A1">Grade A1 (Export Specimen)</option>
                <option value="Grade A">Grade A (Wholesale Standard)</option>
                <option value="Premium Export">Premium Export Jumbo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Lot Description & Moisture / Grain Details
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Naturally sun dried, moisture tested under 11.2%, cleaned and machine sorted."
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#edf1ea]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-semibold border border-[#c9d4c6] bg-white text-[#455c48] hover:bg-[#edf2ea]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719]"
            >
              Publish Listing
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
