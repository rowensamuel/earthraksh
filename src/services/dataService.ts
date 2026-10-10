import {
  User,
  Farm,
  Crop,
  SoilHealth,
  CropDiseaseReport,
  InventoryItem,
  Equipment,
  EquipmentMaintenance,
  MarketplaceProduct,
  Order,
  Payment,
  WeatherLog,
  FinanceRecord,
  CartItem
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_FARMS,
  INITIAL_CROPS,
  INITIAL_SOIL_RECORDS,
  INITIAL_DISEASE_REPORTS,
  INITIAL_INVENTORY,
  INITIAL_EQUIPMENT,
  INITIAL_MAINTENANCE,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_WEATHER_LOGS,
  INITIAL_FINANCE
} from '../data/mockData';

class DataService {
  private load<T>(key: string, fallback: T): T {
    try {
      const stored = localStorage.getItem(`earthrakshak_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  }

  private save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(`earthrakshak_${key}`, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('earthrakshak_storage_update', { detail: { key } }));
    } catch (err) {
      console.error('Storage save error', err);
    }
  }

  // Users
  getUsers(): User[] {
    return this.load<User[]>('users', INITIAL_USERS);
  }

  getUser(id: string): User | undefined {
    return this.getUsers().find(u => u.user_id === id);
  }

  updateUserStatus(id: string, status: 'Active' | 'Inactive' | 'Suspended'): void {
    const list = this.getUsers().map(u => u.user_id === id ? { ...u, status } : u);
    this.save('users', list);
  }

  addUser(user: Omit<User, 'user_id' | 'created_at'>): User {
    const list = this.getUsers();
    const newUser: User = {
      ...user,
      user_id: `USR-${String(list.length + 1).padStart(3, '0')}`,
      created_at: new Date().toISOString().split('T')[0]
    };
    this.save('users', [newUser, ...list]);
    return newUser;
  }

  // Farms
  getFarms(userId?: string): Farm[] {
    const farms = this.load<Farm[]>('farms', INITIAL_FARMS);
    return userId ? farms.filter(f => f.user_id === userId) : farms;
  }

  addFarm(farm: Omit<Farm, 'farm_id'>): Farm {
    const list = this.getFarms();
    const newFarm: Farm = {
      ...farm,
      farm_id: `FRM-${String(list.length + 101)}`
    };
    this.save('farms', [newFarm, ...list]);
    return newFarm;
  }

  // Crops
  getCrops(farmId?: string): Crop[] {
    const crops = this.load<Crop[]>('crops', INITIAL_CROPS);
    return farmId ? crops.filter(c => c.farm_id === farmId) : crops;
  }

  addCrop(crop: Omit<Crop, 'crop_id'>): Crop {
    const list = this.getCrops();
    const newCrop: Crop = {
      ...crop,
      crop_id: `CRP-${String(list.length + 201)}`
    };
    this.save('crops', [newCrop, ...list]);
    return newCrop;
  }

  updateCropStatus(cropId: string, status: 'Planted' | 'Growing' | 'Harvested' | 'Damaged'): void {
    const list = this.getCrops().map(c => c.crop_id === cropId ? { ...c, status } : c);
    this.save('crops', list);
  }

  // Soil Health
  getSoilRecords(farmId?: string): SoilHealth[] {
    const records = this.load<SoilHealth[]>('soil_health', INITIAL_SOIL_RECORDS);
    return farmId ? records.filter(s => s.farm_id === farmId) : records;
  }

  addSoilRecord(record: Omit<SoilHealth, 'soil_id'>): SoilHealth {
    const list = this.getSoilRecords();
    const newRecord: SoilHealth = {
      ...record,
      soil_id: `SL-${String(list.length + 301)}`
    };
    this.save('soil_health', [newRecord, ...list]);
    return newRecord;
  }

  // Disease Reports
  getDiseaseReports(): CropDiseaseReport[] {
    return this.load<CropDiseaseReport[]>('disease_reports', INITIAL_DISEASE_REPORTS);
  }

  addDiseaseReport(report: Omit<CropDiseaseReport, 'report_id'>): CropDiseaseReport {
    const list = this.getDiseaseReports();
    const newReport: CropDiseaseReport = {
      ...report,
      report_id: `DIS-${String(list.length + 401)}`
    };
    this.save('disease_reports', [newReport, ...list]);
    return newReport;
  }

  updateDiseaseStatus(reportId: string, status: 'Active' | 'Under Treatment' | 'Resolved'): void {
    const list = this.getDiseaseReports().map(r => r.report_id === reportId ? { ...r, status } : r);
    this.save('disease_reports', list);
  }

  // Inventory
  getInventory(userId?: string): InventoryItem[] {
    const items = this.load<InventoryItem[]>('inventory', INITIAL_INVENTORY);
    return userId ? items.filter(i => i.user_id === userId) : items;
  }

  addInventoryItem(item: Omit<InventoryItem, 'item_id'>): InventoryItem {
    const list = this.getInventory();
    const newItem: InventoryItem = {
      ...item,
      item_id: `INV-${String(list.length + 501)}`
    };
    this.save('inventory', [newItem, ...list]);
    return newItem;
  }

  // Equipment
  getEquipment(userId?: string): Equipment[] {
    const eq = this.load<Equipment[]>('equipment', INITIAL_EQUIPMENT);
    return userId ? eq.filter(e => e.user_id === userId) : eq;
  }

  addEquipment(equipment: Omit<Equipment, 'equipment_id'>): Equipment {
    const list = this.getEquipment();
    const newEq: Equipment = {
      ...equipment,
      equipment_id: `EQP-${String(list.length + 601)}`
    };
    this.save('equipment', [newEq, ...list]);
    return newEq;
  }

  updateEquipmentStatus(equipmentId: string, availability_status: 'Available' | 'Rented' | 'Under Maintenance'): void {
    const list = this.getEquipment().map(e => e.equipment_id === equipmentId ? { ...e, availability_status } : e);
    this.save('equipment', list);
  }

  getMaintenance(): EquipmentMaintenance[] {
    return this.load<EquipmentMaintenance[]>('maintenance', INITIAL_MAINTENANCE);
  }

  // Marketplace
  getProducts(): MarketplaceProduct[] {
    return this.load<MarketplaceProduct[]>('products', INITIAL_PRODUCTS);
  }

  getProduct(id: string): MarketplaceProduct | undefined {
    return this.getProducts().find(p => p.product_id === id);
  }

  addProduct(product: Omit<MarketplaceProduct, 'product_id'>): MarketplaceProduct {
    const list = this.getProducts();
    const newProduct: MarketplaceProduct = {
      ...product,
      product_id: `PRD-${String(list.length + 801)}`
    };
    this.save('products', [newProduct, ...list]);
    return newProduct;
  }

  // Cart
  getCart(): CartItem[] {
    return this.load<CartItem[]>('cart', []);
  }

  addToCart(product: MarketplaceProduct, quantity = 1): void {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(c => c.product.product_id === product.product_id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ product, quantity });
    }
    this.save('cart', cart);
  }

  updateCartQuantity(productId: string, quantity: number): void {
    let cart = this.getCart();
    if (quantity <= 0) {
      cart = cart.filter(c => c.product.product_id !== productId);
    } else {
      cart = cart.map(c => c.product.product_id === productId ? { ...c, quantity } : c);
    }
    this.save('cart', cart);
  }

  removeFromCart(productId: string): void {
    const cart = this.getCart().filter(c => c.product.product_id !== productId);
    this.save('cart', cart);
  }

  clearCart(): void {
    this.save('cart', []);
  }

  // Wishlist
  getWishlist(): string[] {
    return this.load<string[]>('wishlist', ['PRD-801', 'PRD-803']);
  }

  toggleWishlist(productId: string): boolean {
    let list = this.getWishlist();
    let added = false;
    if (list.includes(productId)) {
      list = list.filter(id => id !== productId);
    } else {
      list.push(productId);
      added = true;
    }
    this.save('wishlist', list);
    return added;
  }

  // Orders
  getOrders(buyerId?: string, sellerId?: string): Order[] {
    const orders = this.load<Order[]>('orders', INITIAL_ORDERS);
    if (buyerId) {
      return orders.filter(o => o.buyer_id === buyerId);
    }
    if (sellerId) {
      return orders.filter(o => o.seller_id === sellerId || o.items.some(i => i.product_id.startsWith('PRD')));
    }
    return orders;
  }

  addOrder(order: Omit<Order, 'order_id' | 'order_date' | 'tracking_number'>): Order {
    const list = this.getOrders();
    const newOrder: Order = {
      ...order,
      order_id: `ORD-${String(list.length + 901)}`,
      order_date: new Date().toISOString().split('T')[0],
      tracking_number: `EK-AGRI-${Math.floor(100000 + Math.random() * 900000)}`
    };
    this.save('orders', [newOrder, ...list]);

    // Also record payment
    const payments = this.getPayments();
    const newPayment: Payment = {
      payment_id: `PAY-${String(payments.length + 1101)}`,
      order_id: newOrder.order_id,
      amount: newOrder.total_amount,
      payment_method: newOrder.payment_method,
      payment_status: 'Completed',
      transaction_id: `TXN-${newOrder.payment_method}-${Math.floor(100000000 + Math.random() * 900000000)}`,
      payment_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      gateway_reference: `PAY_GATEWAY_${Math.floor(100000 + Math.random() * 900000)}`
    };
    this.save('payments', [newPayment, ...payments]);

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: Order['order_status']): void {
    const list = this.getOrders().map(o => o.order_id === orderId ? { ...o, order_status: status } : o);
    this.save('orders', list);
  }

  // Payments
  getPayments(): Payment[] {
    return this.load<Payment[]>('payments', INITIAL_PAYMENTS);
  }

  // Weather Logs
  getWeatherLogs(farmId?: string): WeatherLog[] {
    const logs = this.load<WeatherLog[]>('weather_logs', INITIAL_WEATHER_LOGS);
    return farmId ? logs.filter(w => w.farm_id === farmId) : logs;
  }

  // Finance
  getFinance(userId?: string): FinanceRecord[] {
    const fin = this.load<FinanceRecord[]>('finance', INITIAL_FINANCE);
    return userId ? fin.filter(f => f.user_id === userId) : fin;
  }

  addFinanceRecord(record: Omit<FinanceRecord, 'finance_id'>): FinanceRecord {
    const list = this.getFinance();
    const newRecord: FinanceRecord = {
      ...record,
      finance_id: `FIN-${String(list.length + 1301)}`
    };
    this.save('finance', [newRecord, ...list]);
    return newRecord;
  }

  // Reset to factory defaults if desired
  resetAll(): void {
    localStorage.clear();
    window.dispatchEvent(new CustomEvent('earthrakshak_storage_update', { detail: { key: 'all' } }));
  }
}

export const dataService = new DataService();
