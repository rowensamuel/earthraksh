import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { orderService } from '../../services/orderService';
import { CartItem } from '../../types';
import { TrashIcon, CheckIcon } from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';

export const CartPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState(currentUser.address || 'AgroMart Central Depot, APMC Yard Gate 4, Vashi, Navi Mumbai 400703');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Net Banking' | 'COD'>('UPI');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    loadCart();
    const handleUpdate = () => loadCart();
    window.addEventListener('earthrakshak_storage_update', handleUpdate);
    return () => window.removeEventListener('earthrakshak_storage_update', handleUpdate);
  }, []);

  const loadCart = () => {
    setCart(dataService.getCart());
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    dataService.updateCartQuantity(productId, qty);
    loadCart();
  };

  const handleRemove = (productId: string) => {
    dataService.removeFromCart(productId);
    loadCart();
    showToast('Item Removed', 'info');
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.price_per_unit * item.quantity, 0);
  const mandiCess = 0; // EarthRakshak Zero Intermediary!
  const logisticsEst = cart.length > 0 ? 1200 : 0;
  const total = subtotal + mandiCess + logisticsEst;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsCheckingOut(true);
    try {
      const newOrder = await orderService.createOrder({
        shippingAddress,
        paymentMethod,
        items: cart,
        buyerName: currentUser?.full_name
      });

      dataService.clearCart();
      setIsCheckingOut(false);
      showToast('Wholesale Order Confirmed', 'success', `Order ${newOrder.order_id} recorded in Supabase database.`);
      navigate('/buyer/orders');
    } catch (err: any) {
      setIsCheckingOut(false);
      console.error('Order creation failed:', err);
      showToast('Order Failed', 'error', err.message || 'Could not persist order to database.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Wholesale Procurement Basket"
        title="Procurement Cart & Settlement"
        description="Review farm produce lots, aggregate quantities, calculate agricultural logistics tariffs, and execute digital escrow settlement."
      />

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-[#dbe3d8]">
              <div className="p-4 border-b border-[#e2e8df] flex items-center justify-between bg-[#fafbfa]">
                <span className="text-xs font-bold font-display uppercase tracking-wider text-[#14291a]">
                  Selected Agricultural Produce Lots ({cart.length})
                </span>
                <button
                  onClick={() => {
                    dataService.clearCart();
                    loadCart();
                  }}
                  className="text-xs text-[#991b1b] hover:underline"
                >
                  Clear All
                </button>
              </div>

              <div className="divide-y divide-[#edf1ea]">
                {cart.map(item => (
                  <div key={item.product.product_id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 shrink-0 overflow-hidden border border-[#dbe3d8] bg-[#f8faf7]">
                        <img
                          src={item.product.image_url}
                          alt={item.product.product_name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold font-display text-[#14291a]">
                          {item.product.product_name}
                        </h4>
                        <p className="text-[11px] text-[#5e7362]">
                          Producer: {item.product.seller_name} · Rate: ₹{item.product.price_per_unit}/{item.product.unit}
                        </p>
                        <span className="text-[10px] text-[#1b5e20] font-semibold">
                          {item.product.certification} · {item.product.grade}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#c9d4c6] bg-white">
                        <button
                          onClick={() => handleUpdateQuantity(item.product.product_id, item.quantity - 1)}
                          className="px-2.5 py-1 text-xs font-bold text-[#304734] hover:bg-[#edf2ea]"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold tabular-nums text-[#14291a]">
                          {item.quantity} {item.product.unit}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product.product_id, item.quantity + 1)}
                          className="px-2.5 py-1 text-xs font-bold text-[#304734] hover:bg-[#edf2ea]"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <span className="text-sm font-bold text-[#14291a] tabular-nums block font-display">
                          ₹{(item.product.price_per_unit * item.quantity).toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => handleRemove(item.product.product_id)}
                          className="text-[11px] text-[#991b1b] hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Destination Address */}
            <div className="bg-white border border-[#dbe3d8] p-5">
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-[#14291a] mb-2">
                Consignment Delivery Destination
              </h3>
              <textarea
                rows={2}
                value={shippingAddress}
                onChange={e => setShippingAddress(e.target.value)}
                placeholder="Enter warehouse gate address, loading dock, APMC cluster..."
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
          </div>

          {/* Checkout Settlement Box */}
          <div className="lg:col-span-4 bg-white border border-[#dbe3d8] p-5 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#14291a] pb-2 border-b border-[#edf1ea] mb-3">
                Order Financial Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5c7360]">Produce Subtotal</span>
                  <span className="tabular-nums font-semibold text-[#14291a]">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5c7360]">Intermediary Mandi Cess</span>
                  <span className="font-semibold text-[#1b5e20]">₹0 (Direct Exemption)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5c7360]">Freight & Transit Insurance</span>
                  <span className="tabular-nums font-semibold text-[#14291a]">
                    ₹{logisticsEst.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#edf1ea] flex justify-between items-baseline">
                  <span className="text-xs font-bold uppercase text-[#14291a]">Total Settlement</span>
                  <span className="text-xl font-bold font-display text-[#1b5e20] tabular-nums">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="mt-4 pt-3 border-t border-[#edf1ea]">
                <label className="block text-xs font-semibold text-[#304734] mb-2">
                  Select Settlement Channel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['UPI', 'Net Banking', 'Card', 'COD'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-2 text-xs font-semibold border text-center transition-colors ${
                        paymentMethod === method
                          ? 'border-[#1b5e20] bg-[#1b5e20] text-white'
                          : 'border-[#c9d4c6] bg-white text-[#455c48] hover:bg-[#edf2ea]'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isCheckingOut}
              className="w-full py-3 text-xs font-bold uppercase tracking-wider bg-[#1b5e20] text-white hover:bg-[#144719] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isCheckingOut ? (
                <span>Executing Escrow Settlement...</span>
              ) : (
                <>
                  <CheckIcon size={16} />
                  <span>Confirm Wholesale Purchase</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#dbe3d8] p-12 text-center text-xs text-[#6e8571]">
          Your procurement cart is empty.
          <div className="mt-4">
            <Link to="/buyer/marketplace" className="text-xs font-semibold text-[#1b5e20] hover:underline">
              ← Browse Available Produce Lots
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
