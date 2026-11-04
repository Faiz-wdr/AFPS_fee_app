import React, { useState, useMemo } from 'react';
import { useAppStore } from '../context/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { ReceiptModal } from '../components/common/ReceiptModal';
import type { PrintableReceiptData } from '../components/common/ReceiptModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { Product, PaymentMethod } from '../types';
import {
  Plus,
  Trash2,
  Printer,
  CheckCircle,
  Search,
  Edit2
} from 'lucide-react';

export const StoreSalesManagement: React.FC = () => {
  const {
    products,
    sales,
    addProduct,
    updateProduct,
    toggleProductStatus,
    recordSale
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'sale' | 'products' | 'history'>('sale');

  // Receipt Modal State
  const [printableReceipt, setPrintableReceipt] = useState<PrintableReceiptData | null>(null);

  // New Sale State (Cart of multiple products)
  const [cartItems, setCartItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>('');
  const [selectedQuantityToAdd, setSelectedQuantityToAdd] = useState<number>(1);
  const [saleDiscount, setSaleDiscount] = useState<number>(0);
  const [salePaymentMethod, setSalePaymentMethod] = useState<PaymentMethod>('Cash');
  const [customerName, setCustomerName] = useState<string>('');
  const [saleRemarks, setSaleRemarks] = useState<string>('');

  // Product Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Stationery' as Product['category'],
    price: 50,
    stock: 100,
    status: 'Active' as 'Active' | 'Inactive'
  });

  // History Filter
  const [historySearch, setHistorySearch] = useState('');
  const [historyMethodFilter, setHistoryMethodFilter] = useState('All');

  // Product Filter
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');

  // Pagination states (20 items per page)
  const [productsPage, setProductsPage] = useState(1);
  const [salesHistoryPage, setSalesHistoryPage] = useState(1);

  // Sales Overview metrics
  const overview = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let salesToday = 0;
    let salesThisMonth = 0;
    let cashSales = 0;
    let bankSales = 0;

    sales.forEach(s => {
      const sDate = new Date(s.date);
      if (s.date === todayStr) {
        salesToday += s.totalAmount;
      }
      if (sDate.getMonth() === currentMonth && sDate.getFullYear() === currentYear) {
        salesThisMonth += s.totalAmount;
      }
      if (s.paymentMethod === 'Cash') {
        cashSales += s.totalAmount;
      } else {
        bankSales += s.totalAmount;
      }
    });

    return {
      salesToday,
      salesThisMonth,
      totalTransactions: sales.length,
      cashSales,
      bankSales
    };
  }, [sales]);

  // Cart Calculations
  const cartSummary = useMemo(() => {
    const resolved = cartItems.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const price = prod ? prod.price : 0;
      const total = price * item.quantity;
      return {
        ...item,
        name: prod ? prod.name : 'Unknown Product',
        category: prod ? prod.category : 'General',
        unitPrice: price,
        total,
        availableStock: prod ? prod.stock : 0
      };
    });

    const subtotal = resolved.reduce((acc, curr) => acc + curr.total, 0);
    const totalAmount = Math.max(0, subtotal - (saleDiscount || 0));

    return {
      resolved,
      subtotal,
      totalAmount
    };
  }, [cartItems, products, saleDiscount]);

  // Add Item to Sale Cart
  const handleAddToCart = () => {
    if (!selectedProductToAdd || selectedQuantityToAdd <= 0) return;
    const existingIndex = cartItems.findIndex(i => i.productId === selectedProductToAdd);
    const prod = products.find(p => p.id === selectedProductToAdd);
    if (!prod) return;

    if (existingIndex > -1) {
      const currentQty = cartItems[existingIndex].quantity;
      const newQty = currentQty + selectedQuantityToAdd;
      if (newQty > prod.stock) {
        alert(`Only ${prod.stock} units available in inventory!`);
        return;
      }
      const updated = [...cartItems];
      updated[existingIndex].quantity = newQty;
      setCartItems(updated);
    } else {
      if (selectedQuantityToAdd > prod.stock) {
        alert(`Only ${prod.stock} units available in inventory!`);
        return;
      }
      setCartItems([...cartItems, { productId: selectedProductToAdd, quantity: selectedQuantityToAdd }]);
    }

    setSelectedProductToAdd('');
    setSelectedQuantityToAdd(1);
  };

  const handleRemoveFromCart = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  // Complete & Confirm Sale
  const handleConfirmSale = () => {
    if (cartItems.length === 0) {
      alert("Cart is empty! Add at least one product.");
      return;
    }

    const sale = recordSale({
      items: cartItems,
      discount: saleDiscount,
      paymentMethod: salePaymentMethod,
      customerName: customerName.trim() || undefined,
      remarks: saleRemarks.trim() || undefined
    });

    // Open Printable Receipt
    setPrintableReceipt({
      type: 'sale',
      receiptNumber: sale.receiptNumber,
      date: sale.date,
      title: 'School Store Cash Memo',
      payeeOrStudent: sale.customerName || 'Walk-in Student / Parent',
      subInfo: `Payment Mode: ${sale.paymentMethod} • Item Count: ${sale.items.length}`,
      paymentMethod: sale.paymentMethod,
      items: sale.items.map(i => ({
        label: `${i.productName} (x${i.quantity} @ ₹${i.unitPrice})`,
        amount: i.total
      })),
      subtotal: sale.subtotal,
      discount: sale.discount,
      totalAmount: sale.totalAmount,
      remarks: sale.remarks
    });

    // Reset Cart
    setCartItems([]);
    setSaleDiscount(0);
    setCustomerName('');
    setSaleRemarks('');
  };

  // Product Form Save
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock)
      });
    } else {
      addProduct({
        name: productForm.name,
        category: productForm.category,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        status: productForm.status
      });
    }
    setIsProductModalOpen(false);
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Stationery',
      price: 50,
      stock: 50,
      status: 'Active'
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      stock: prod.stock,
      status: prod.status
    });
    setIsProductModalOpen(true);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, productSearch, productCategoryFilter]);

  // Filtered Sales History
  const filteredSalesHistory = useMemo(() => {
    return sales.filter(s => {
      const matchesSearch = !historySearch ||
        s.receiptNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
        (s.customerName && s.customerName.toLowerCase().includes(historySearch.toLowerCase())) ||
        s.items.some(i => i.productName.toLowerCase().includes(historySearch.toLowerCase()));
      const matchesMethod = historyMethodFilter === 'All' || s.paymentMethod === historyMethodFilter;
      return matchesSearch && matchesMethod;
    });
  }, [sales, historySearch, historyMethodFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Store Management</h1>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'inline-flex', padding: '3px', backgroundColor: '#EAEAF0', borderRadius: '8px' }}>
          {[
            { id: 'sale', label: 'Store' },
            { id: 'products', label: 'Products' },
            { id: 'history', label: 'Sales' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'sale' | 'products' | 'history')}
              style={{
                padding: '7px 14px',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? '#5A54B4' : 'var(--color-text-secondary)',
                backgroundColor: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* A. Sales Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Sales Today</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {formatCurrency(overview.salesToday)}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--color-success)' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Sales This Month</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-success)', marginTop: '4px' }}>
            {formatCurrency(overview.salesThisMonth)}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Transactions</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {overview.totalTransactions} Orders
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Cash vs Bank</span>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Cash: {formatCurrency(overview.cashSales)}</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>Bank: {formatCurrency(overview.bankSales)}</span>
          </div>
        </div>
      </div>

      {/* TAB 1: NEW SALE */}
      {activeTab === 'sale' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)', gap: '18px' }}>
          {/* Left: Product Selector & Current Cart */}
          <Card title="Add Items to Cart">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Select Available Product
                  </label>
                  <select
                    value={selectedProductToAdd}
                    onChange={e => setSelectedProductToAdd(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">-- Choose Product --</option>
                    {products.filter(p => p.status === 'Active' && p.stock > 0).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{p.price} ({p.stock} in stock)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ width: '90px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={products.find(p => p.id === selectedProductToAdd)?.stock || 100}
                    value={selectedQuantityToAdd}
                    onChange={e => setSelectedQuantityToAdd(Number(e.target.value))}
                    style={{ width: '100%', textAlign: 'center' }}
                  />
                </div>

                <Button variant="primary" icon={<Plus size={15} />} onClick={handleAddToCart}>
                  Add Item
                </Button>
              </div>

              {/* Cart Table */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  Order Line Items ({cartSummary.resolved.length})
                </div>
                {cartSummary.resolved.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#FAFAFC', borderRadius: '8px', border: '1px dashed var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                    Cart is empty. Select an item above to add to cart.
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th style={{ textAlign: 'center' }}>Qty</th>
                          <th style={{ textAlign: 'right' }}>Price</th>
                          <th style={{ textAlign: 'right' }}>Total</th>
                          <th style={{ textAlign: 'center', width: '40px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartSummary.resolved.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{item.name}</div>
                              <span style={{ fontSize: '11px', color: '#777777' }}>{item.category}</span>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total)}</td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                onClick={() => handleRemoveFromCart(idx)}
                                style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '2px' }}
                                title="Remove item"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Right: Checkout & Billing Details */}
          <Card title="Checkout & Payment">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Muhammed Ayaan (Class 5A)"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Payment Mode
                  </label>
                  <select
                    value={salePaymentMethod}
                    onChange={e => setSalePaymentMethod(e.target.value as PaymentMethod)}
                    style={{ width: '100%' }}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank Transfer / UPI</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={saleDiscount}
                    onChange={e => setSaleDiscount(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Sale Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Set of term notebooks"
                  value={saleRemarks}
                  onChange={e => setSaleRemarks(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Price Breakdown Box */}
              <div style={{ padding: '16px', backgroundColor: '#FAFAFC', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Items Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(cartSummary.subtotal)}</span>
                </div>
                {saleDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-danger)' }}>
                    <span>Discount:</span>
                    <span>- {formatCurrency(saleDiscount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--color-border)', paddingTop: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>Total Amount:</span>
                  <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--color-primary)' }}>
                    {formatCurrency(cartSummary.totalAmount)}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                icon={<CheckCircle size={16} />}
                disabled={cartItems.length === 0}
                onClick={handleConfirmSale}
                style={{ width: '100%', height: '42px', fontSize: '14px' }}
              >
                Complete Sale & Generate Receipt
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', minWidth: '240px' }}>
                <Search size={14} color="#777777" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  style={{ width: '100%', paddingLeft: '32px', height: '36px' }}
                />
              </div>
              <select
                value={productCategoryFilter}
                onChange={e => setProductCategoryFilter(e.target.value)}
                style={{ height: '36px' }}
              >
                <option value="All">All Categories</option>
                <option value="Stationery">Stationery</option>
                <option value="Books">Books</option>
                <option value="Uniform">Uniform</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <Button variant="primary" icon={<Plus size={15} />} onClick={handleOpenAddProduct}>
              Add New Product
            </Button>
          </div>

          <Card padding="0">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Selling Price</th>
                    <th style={{ textAlign: 'center' }}>In Stock</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts
                    .slice((productsPage - 1) * 20, productsPage * 20)
                    .map(prod => (
                    <tr key={prod.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{prod.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{prod.name}</div>
                      </td>
                      <td>
                        <Badge variant="purple">{prod.category}</Badge>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(prod.price)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 600, color: prod.stock < 50 ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => toggleProductStatus(prod.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <Badge variant={prod.status === 'Active' ? 'success' : 'neutral'}>
                            {prod.status}
                          </Badge>
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="secondary"
                          icon={<Edit2 size={13} />}
                          style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
                          onClick={() => handleOpenEditProduct(prod)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={productsPage}
              totalItems={filteredProducts.length}
              pageSize={20}
              onPageChange={setProductsPage}
              itemName="products"
            />
          </Card>
        </div>
      )}

      {/* TAB 3: SALES HISTORY */}
      {activeTab === 'history' && (
        <Card padding="0">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <h2 className="section-heading" style={{ margin: 0 }}>School Store Sales Ledger</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={14} color="#777777" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                <input
                  type="text"
                  placeholder="Search receipt, items..."
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  style={{ width: '100%', paddingLeft: '32px', height: '34px', fontSize: '12px' }}
                />
              </div>
              <select
                value={historyMethodFilter}
                onChange={e => setHistoryMethodFilter(e.target.value)}
                style={{ height: '34px', fontSize: '12px' }}
              >
                <option value="All">All Payment Modes</option>
                <option value="Cash">Cash</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items Purchased</th>
                  <th>Method</th>
                  <th style={{ textAlign: 'right' }}>Total Amount</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Print / View</th>
                </tr>
              </thead>
              <tbody>
                {filteredSalesHistory
                  .slice((salesHistoryPage - 1) * 20, salesHistoryPage * 20)
                  .map(sale => (
                  <tr key={sale.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {sale.receiptNumber}
                    </td>
                    <td>{formatDate(sale.date)}</td>
                    <td style={{ fontWeight: 500 }}>{sale.customerName || 'Walk-in'}</td>
                    <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)', maxWidth: '300px' }}>
                      {sale.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                    </td>
                    <td>{sale.paymentMethod}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Badge variant="success">Completed</Badge>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Button
                        variant="secondary"
                        icon={<Printer size={13} />}
                        style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
                        onClick={() => {
                          setPrintableReceipt({
                            type: 'sale',
                            receiptNumber: sale.receiptNumber,
                            date: sale.date,
                            title: 'Store Sales Cash Memo',
                            payeeOrStudent: sale.customerName || 'Walk-in Customer',
                            subInfo: `Total Items: ${sale.items.length} • Mode: ${sale.paymentMethod}`,
                            paymentMethod: sale.paymentMethod,
                            items: sale.items.map(i => ({
                              label: `${i.productName} (x${i.quantity} @ ₹${i.unitPrice})`,
                              amount: i.total
                            })),
                            subtotal: sale.subtotal,
                            discount: sale.discount,
                            totalAmount: sale.totalAmount,
                            remarks: sale.remarks
                          });
                        }}
                      >
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={salesHistoryPage}
            totalItems={filteredSalesHistory.length}
            pageSize={20}
            onPageChange={setSalesHistoryPage}
            itemName="sales orders"
          />
        </Card>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.name}` : "Add Store Product"}
        maxWidth="480px"
      >
        <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Single-Rule Notebook 192 Pgs"
              value={productForm.name}
              onChange={e => setProductForm({ ...productForm, name: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Category
              </label>
              <select
                value={productForm.category}
                onChange={e => setProductForm({ ...productForm, category: e.target.value as Product['category'] })}
                style={{ width: '100%' }}
              >
                <option value="Stationery">Stationery</option>
                <option value="Books">Books</option>
                <option value="Uniform">Uniform</option>
                <option value="Accessories">Accessories</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Status
              </label>
              <select
                value={productForm.status}
                onChange={e => setProductForm({ ...productForm, status: e.target.value as 'Active' | 'Inactive' })}
                style={{ width: '100%' }}
              >
                <option value="Active">Active (Available)</option>
                <option value="Inactive">Inactive (Disabled)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={productForm.price}
                onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Available Stock Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                value={productForm.stock}
                onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="secondary" type="button" onClick={() => setIsProductModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingProduct ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Global Printable Receipt Modal */}
      <ReceiptModal
        isOpen={!!printableReceipt}
        onClose={() => setPrintableReceipt(null)}
        data={printableReceipt}
      />
    </div>
  );
};
