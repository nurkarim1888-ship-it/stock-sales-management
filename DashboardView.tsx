import React, { useState, useMemo } from 'react';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  PlusCircle, 
  DollarSign,
  Download,
  CheckCircle2,
  Boxes
} from 'lucide-react';
import { Product, Salesman } from '../types';
import { formatCurrency } from '../utils/formatters';

interface DashboardViewProps {
  products: Product[];
  salesmen: Salesman[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onRestockProduct: (productId: string, addQty: number, unitPrice?: number) => void;
  onNavigateToMorning: () => void;
  onNavigateToDamage: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  salesmen,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRestockProduct,
  onNavigateToMorning,
  onNavigateToDamage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQuantity, setRestockQuantity] = useState<number>(10);
  const [restockNewPrice, setRestockNewPrice] = useState<string>('');

  // Form states for new product
  const [newProductName, setNewProductName] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('পিস');
  const [newProductPrice, setNewProductPrice] = useState<number>(0);
  const [newProductStock, setNewProductStock] = useState<number>(0);
  const [newProductDamage, setNewProductDamage] = useState<number>(0);

  // Totals calculations
  const { totalStockValue, totalStockItems, totalDamageValue, totalDamageItems } = useMemo(() => {
    let stockVal = 0;
    let stockItems = 0;
    let dmgVal = 0;
    let dmgItems = 0;

    products.forEach((p) => {
      stockVal += (p.stock || 0) * (p.unitPrice || 0);
      stockItems += p.stock || 0;
      dmgVal += (p.damageStock || 0) * (p.unitPrice || 0);
      dmgItems += p.damageStock || 0;
    });

    return {
      totalStockValue: stockVal,
      totalStockItems: stockItems,
      totalDamageValue: dmgVal,
      totalDamageItems: dmgItems,
    };
  }, [products]);

  const totalDsrDue = useMemo(() => {
    return salesmen.reduce((sum, s) => sum + (s.currentDue || 0), 0);
  }, [salesmen]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, searchTerm]);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    onAddProduct({
      name: newProductName.trim(),
      unit: newProductUnit || 'পিস',
      unitPrice: Number(newProductPrice) || 0,
      stock: Number(newProductStock) || 0,
      damageStock: Number(newProductDamage) || 0,
    });

    // Reset
    setNewProductName('');
    setNewProductPrice(0);
    setNewProductStock(0);
    setNewProductDamage(0);
    setIsAddModalOpen(false);
  };

  const handleUpdateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name.trim()) return;
    onUpdateProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct || restockQuantity <= 0) return;
    const updatedPrice = restockNewPrice !== '' ? Number(restockNewPrice) : undefined;
    onRestockProduct(restockProduct.id, restockQuantity, updatedPrice);
    setRestockProduct(null);
    setRestockQuantity(10);
    setRestockNewPrice('');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['সিরিয়াল নং', 'পণ্যের নাম', 'একক', 'একক মূল্য (টাকা)', 'বিক্রয়যোগ্য স্টক', 'মোট স্টক মূল্য (টাকা)', 'ড্যামেজ স্টক', 'ড্যামেজ স্টক মূল্য (টাকা)'];
    const rows = products.map((p, index) => [
      index + 1,
      `"${p.name.replace(/"/g, '""')}"`,
      p.unit,
      p.unitPrice,
      p.stock,
      p.stock * p.unitPrice,
      p.damageStock,
      p.damageStock * p.unitPrice,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Stock_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Value Banner - As explicitly requested */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold tracking-wide border border-emerald-500/30">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>লাইভ স্টক ও ইনভেন্টরি ভ্যালুয়েশন</span>
            </div>
            <div className="text-slate-300 text-sm">ড্যাশবোর্ড মোট বিক্রয়যোগ্য স্টকের মূল্য</div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-emerald-400">
              {formatCurrency(totalStockValue)}
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              মোট {products.length} টি পন্যের সর্বমোট {totalStockItems.toLocaleString()} একক স্টক বিক্রয়ের জন্য প্রস্তুত রয়েছে।
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-102"
            >
              <Plus className="w-5 h-5" />
              <span>নতুন পণ্য যোগ করুন</span>
            </button>
            <button
              onClick={onNavigateToMorning}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-102"
            >
              <Boxes className="w-5 h-5" />
              <span>সকালে পণ্য বুঝিয়ে দিন</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Mini Cards */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-xl p-3 sm:p-4 border border-slate-700/60">
            <span className="text-xs text-slate-400 block mb-1">মোট পণ্য আইটেম</span>
            <div className="text-xl sm:text-2xl font-bold text-white">{products.length} টি</div>
            <span className="text-[11px] text-emerald-400 mt-1 block">সবগুলো চালু আছে</span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 sm:p-4 border border-slate-700/60">
            <span className="text-xs text-slate-400 block mb-1">মোট কোয়ান্টিটি (স্টক)</span>
            <div className="text-xl sm:text-2xl font-bold text-white">{totalStockItems.toLocaleString()}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">মূল বিক্রয়যোগ্য গুদামে</span>
          </div>

          <div 
            onClick={onNavigateToDamage}
            className="bg-rose-950/40 rounded-xl p-3 sm:p-4 border border-rose-800/40 cursor-pointer hover:bg-rose-950/60 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-rose-300 block mb-1">ড্যামেজ স্টকের মূল্য</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-400">{formatCurrency(totalDamageValue)}</div>
            <span className="text-[11px] text-rose-300/80 mt-1 block">মোট {totalDamageItems} টি পণ্য ক্ষতিগ্রস্ত</span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 sm:p-4 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-300 block mb-1">DSR মোট বাকি</span>
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-400">{formatCurrency(totalDsrDue)}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">{salesmen.length} জন সেলসম্যান</span>
          </div>
        </div>
      </div>

      {/* Main Stock Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              <span>পণ্য অনুযায়ী স্টক ও টোটাল ভ্যালু বিবরণী</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              সিরিয়াল অনুযায়ী প্রত্যেক পণ্যের একক দর, বর্তমান স্টক এবং মোট স্টক মূল্য
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleExportCSV}
              title="CSV ডাউনলোড করুন"
              className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">এক্সেল রিপোর্ট</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100/80 text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">সিরিয়াল</th>
                <th className="py-3.5 px-4">পণ্যের নাম</th>
                <th className="py-3.5 px-4 text-right">একক মূল্য (দর)</th>
                <th className="py-3.5 px-4 text-center">বিক্রয়যোগ্য স্টক</th>
                <th className="py-3.5 px-4 text-right bg-emerald-50/50 text-emerald-900">টোটাল স্টক ভ্যালু</th>
                <th className="py-3.5 px-4 text-center">ড্যামেজ স্টক</th>
                <th className="py-3.5 px-4 text-right">ড্যামেজ মূল্য</th>
                <th className="py-3.5 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    কোনো পণ্য পাওয়া যায়নি। নতুন পণ্য যোগ করুন।
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => {
                  const itemTotalValue = (product.stock || 0) * (product.unitPrice || 0);
                  const damageTotalValue = (product.damageStock || 0) * (product.unitPrice || 0);
                  const isLowStock = product.stock <= 5;

                  return (
                    <tr 
                      key={product.id} 
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Serial Number */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-500 w-16">
                        <span className="inline-block w-7 h-7 rounded-lg bg-slate-100 text-slate-700 leading-7 text-xs font-semibold">
                          {index + 1}
                        </span>
                      </td>

                      {/* Product Name */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{product.name}</span>
                          {isLowStock && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                              স্বল্প স্টক
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-normal">একক: {product.unit}</span>
                      </td>

                      {/* Unit Price */}
                      <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                        {formatCurrency(product.unitPrice)}
                      </td>

                      {/* Sellable Stock */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          product.stock > 10 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : product.stock > 0 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {product.stock} {product.unit}
                        </span>
                      </td>

                      {/* Total Stock Value */}
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700 bg-emerald-50/30 text-base">
                        {formatCurrency(itemTotalValue)}
                      </td>

                      {/* Damage Stock */}
                      <td className="py-3.5 px-4 text-center">
                        {product.damageStock > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            {product.damageStock} {product.unit}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">০</span>
                        )}
                      </td>

                      {/* Damage Value */}
                      <td className="py-3.5 px-4 text-right text-xs font-medium text-rose-600">
                        {product.damageStock > 0 ? formatCurrency(damageTotalValue) : '৳ ০'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setRestockProduct(product);
                              setRestockQuantity(10);
                              setRestockNewPrice(product.unitPrice.toString());
                            }}
                            title="স্টক রিফিল করুন"
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingProduct(product)}
                            title="এডিট করুন"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`আপনি কি নিশ্চিত "${product.name}" মুছে ফেলতে চান?`)) {
                                onDeleteProduct(product.id);
                              }
                            }}
                            title="মুছে ফেলুন"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Table Footer with Summary */}
            <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td colSpan={2} className="py-4 px-4 text-left">
                  মোট সর্বমোট ({products.length} টি পন্য)
                </td>
                <td className="py-4 px-4 text-right text-xs text-slate-500">—</td>
                <td className="py-4 px-4 text-center text-sm font-bold text-slate-800">
                  {totalStockItems.toLocaleString()} পিস/একক
                </td>
                <td className="py-4 px-4 text-right text-lg text-emerald-700 bg-emerald-100/60 font-extrabold">
                  {formatCurrency(totalStockValue)}
                </td>
                <td className="py-4 px-4 text-center text-rose-700 text-sm">
                  {totalDamageItems} টি
                </td>
                <td className="py-4 px-4 text-right text-rose-700 font-bold">
                  {formatCurrency(totalDamageValue)}
                </td>
                <td className="py-4 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* MODAL: Add New Product */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">নতুন পণ্য যোগ করুন</h3>
                <p className="text-xs text-emerald-100">ইনভেন্টরিতে নতুন মালামাল এন্ট্রি দিন</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পণ্যের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: তীর গম ও আটা (২ কেজি)"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">একক (Unit) *</label>
                  <select
                    value={newProductUnit}
                    onChange={(e) => setNewProductUnit(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="পিস">পিস</option>
                    <option value="প্যাকেট">প্যাকেট</option>
                    <option value="কার্টুন">কার্টুন</option>
                    <option value="ব্যাগ">ব্যাগ</option>
                    <option value="কেজি">কেজি</option>
                    <option value="লিটার">লিটার</option>
                    <option value="বক্স">বক্স</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">একক বিক্রয় মূল্য (৳) *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder="যেমন: 150"
                    value={newProductPrice || ''}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">প্রাথমিক বিক্রয়যোগ্য স্টক</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="যেমন: 50"
                    value={newProductStock || ''}
                    onChange={(e) => setNewProductStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">প্রাথমিক ড্যামেজ স্টক (যদি থাকে)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="যেমন: 0"
                    value={newProductDamage || ''}
                    onChange={(e) => setNewProductDamage(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-xs text-emerald-800">
                <span className="font-bold">হিসাব:</span> মোট স্টক মূল্য হবে:{' '}
                <span className="font-extrabold">{formatCurrency(newProductStock * newProductPrice)}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Product */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">পণ্য এডিট করুন</h3>
                <p className="text-xs text-slate-300">নাম, মূল্য বা বর্তমান স্টক সংশোধন করুন</p>
              </div>
              <button 
                onClick={() => setEditingProduct(null)}
                className="text-white/80 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateProductSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পণ্যের নাম *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">একক</label>
                  <input
                    type="text"
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">একক মূল্য (৳) *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={editingProduct.unitPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বিক্রয়যোগ্য স্টক</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ড্যামেজ স্টক</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.damageStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, damageStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Restock / Refill Product */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-emerald-700 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">নতুন স্টক রিফিল (মালামাল রিসিভ)</h3>
                <p className="text-xs text-emerald-100">{restockProduct.name}</p>
              </div>
              <button 
                onClick={() => setRestockProduct(null)}
                className="text-white/80 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">বর্তমান বিক্রয়যোগ্য স্টক:</span>
                  <span className="font-bold text-slate-800">{restockProduct.stock} {restockProduct.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">বর্তমান দর:</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(restockProduct.unitPrice)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  নতুন যোগ করার পরিমাণ ({restockProduct.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQuantity || ''}
                  onChange={(e) => setRestockQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-base font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  একক মূল্য পরিবর্তন করতে চাইলে লিখুন (ঐচ্ছিক)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder={restockProduct.unitPrice.toString()}
                  value={restockNewPrice}
                  onChange={(e) => setRestockNewPrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                নতুন মোট বিক্রয়যোগ্য স্টক হবে:{' '}
                <span className="font-bold text-emerald-800 text-sm">
                  {restockProduct.stock + (restockQuantity || 0)} {restockProduct.unit}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockProduct(null)}
                  className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  স্টকে যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
