import { Product, Salesman, DispatchSession, DamageLog, AppSettings } from '../types';

export function downloadOfflineAppHtml(
  products: Product[],
  salesmen: Salesman[],
  dispatches: DispatchSession[],
  damageLogs: DamageLog[],
  settings: AppSettings
) {
  const initialData = JSON.stringify({
    products,
    salesmen,
    dispatches,
    damageLogs,
    settings: {
      ...settings,
      businessName: settings.businessName || 'স্টক ও ডিএসআর সেলস'
    }
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${settings.businessName || 'স্টক ও ডিএসআর সেলস ম্যানেজমেন্ট'}</title>
  <meta name="theme-color" content="#064e3b">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Hind Siliguri', system-ui, -apple-system, sans-serif; }
    @media print {
      body * { visibility: hidden; }
      #printArea, #printArea * { visibility: visible; }
      #printArea { position: absolute; left: 0; top: 0; width: 100%; }
    }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen pb-16">
  <!-- Top Header -->
  <header class="bg-slate-950 border-b border-emerald-900/60 sticky top-0 z-30 shadow-lg px-4 py-3">
    <div class="max-w-5xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-white shadow">
          📦
        </div>
        <div>
          <h1 class="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <span>${settings.businessName || 'স্টক ও ডিএসআর সেলস'}</span>
            <span class="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">অফলাইন সংস্করণ</span>
          </h1>
          <p class="text-[11px] text-slate-400">ইন্টারনেট ছাড়া সরাসরি ফোনে বা কম্পিউটারে ব্যবহারের অ্যাপ</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="backupData()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-lg border border-slate-700">
          💾 ব্যাকআপ
        </button>
      </div>
    </div>
  </header>

  <!-- Guidance Notice -->
  <div class="max-w-5xl mx-auto px-4 mt-3">
    <div class="bg-emerald-950/80 border border-emerald-800/80 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-200 gap-2">
      <div class="flex items-center gap-2">
        <span>📲</span>
        <span><strong>ফোনে অ্যাপ হিসেবে রাখতে:</strong> Chrome ব্রাউজারের উপরে ডানদিকের ৩-ডট (⋮) চেপে <strong>"Add to Home screen"</strong> (ফোনের স্ক্রিনে যোগ করুন) চাপুন।</span>
      </div>
    </div>
  </div>

  <!-- Navigation Tabs -->
  <div class="max-w-5xl mx-auto px-4 mt-4">
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
      <button onclick="switchTab('tab3')" id="btnTab3" class="tab-btn py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition text-center bg-emerald-600 text-white shadow">
        🚚 ০৩. দৈনিক বিতরণ ও ফেরত
      </button>
      <button onclick="switchTab('tab4')" id="btnTab4" class="tab-btn py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition text-center">
        📊 ০৪. ডিএসআর সামারি ও তারিখ
      </button>
      <button onclick="switchTab('tab1')" id="btnTab1" class="tab-btn py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition text-center">
        📦 স্টক ও পণ্য তালিকা
      </button>
      <button onclick="switchTab('tab2')" id="btnTab2" class="tab-btn py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition text-center">
        👥 ডিএসআর তালিকা
      </button>
    </div>
  </div>

  <!-- Main Container -->
  <main class="max-w-5xl mx-auto px-4 mt-5">
    
    <!-- TAB 3: EVENING SETTLEMENT (OPTION 3: DISTRIBUTION, RETURN, DAMAGE) -->
    <section id="tab3" class="tab-content space-y-4">
      <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h2 class="text-base sm:text-lg font-black text-emerald-400">
              ০৩. দৈনিক পণ্যের বিতরণ, ফেরত ও ড্যামেজ হিসাব (সন্ধ্যা)
            </h2>
            <p class="text-xs text-slate-400">প্রতিটি পণ্যের পাশে ফেরত ও ড্যামেজ দিয়ে মোট বিক্রি ও বাকি হিসাব করুন</p>
          </div>
          <span class="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-lg font-bold">
            অপশন ৩
          </span>
        </div>

        <!-- Inputs: DSR & Date -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">ডিএসআর নির্বাচন করুন *</label>
            <select id="t3_dsr" onchange="renderTab3Items()" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none">
              <option value="">ডিএসআর নির্বাচন করুন</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">তারিখ *</label>
            <input type="date" id="t3_date" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">নোট বা মন্তব্য (ঐচ্ছিক)</label>
            <input type="text" id="t3_note" placeholder="যেমন: সকালের নিয়মিত চালান" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
          </div>
        </div>

        <!-- Products List Cards -->
        <div class="mb-4">
          <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">পণ্যের তালিকা (বিতরণ, ফেরত ও ড্যামেজ এন্ট্রি):</h3>
          <div id="t3_items_list" class="space-y-3">
            <!-- Rendered by JS -->
          </div>
        </div>

        <!-- Calculation Summary Box -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center my-4">
          <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
            <span class="text-[11px] text-slate-400 block">মোট বিক্রি মূল্য</span>
            <span id="t3_total_amount" class="text-base sm:text-lg font-black text-emerald-400">৳০</span>
          </div>
          <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
            <span class="text-[11px] text-slate-400 block">নগদ জমা টাকা</span>
            <input type="number" id="t3_cash_collected" oninput="calcTab3Summary()" placeholder="০" class="w-full text-center bg-slate-900 border border-emerald-700 rounded font-black text-emerald-300 text-sm py-1 mt-0.5 outline-none" />
          </div>
          <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
            <span class="text-[11px] text-slate-400 block">আজকের বাকি</span>
            <span id="t3_today_due" class="text-base sm:text-lg font-black text-rose-400">৳০</span>
          </div>
          <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
            <span class="text-[11px] text-slate-400 block">ড্যামেজ ফেরত সংখ্যা</span>
            <span id="t3_total_damage" class="text-base sm:text-lg font-black text-amber-400">০</span>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button onclick="saveTab3Dispatch()" class="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg transition active:scale-95">
            ✓ হিসাব সংরক্ষণ করুন ও স্টক সমন্বয় করুন
          </button>
        </div>
      </div>
    </section>

    <!-- TAB 4: DSR SUMMARY & DATE WISE VIEW (OPTION 4) -->
    <section id="tab4" class="tab-content hidden space-y-4">
      <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div>
            <h2 class="text-base sm:text-lg font-black text-teal-400">
              ০৪. ডিএসআর সামারি ও তারিখ অনুযায়ী দৈনিক হিসাব
            </h2>
            <p class="text-xs text-slate-400">তারিখ নির্বাচন করে নির্দিষ্ট দিনের সম্পূর্ণ হিসাব দেখুন</p>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs text-slate-300 font-bold">তারিখ বেছে নিন:</label>
            <input type="date" id="t4_filter_date" onchange="renderTab4Summary()" class="bg-slate-900 border border-teal-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none" />
          </div>
        </div>

        <!-- Date Stat Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 text-center">
          <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <span class="text-[11px] text-slate-400 block">মোট বিতরণ সংখ্যা</span>
            <span id="t4_stat_dispatches" class="text-base sm:text-xl font-black text-white">০ টি</span>
          </div>
          <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <span class="text-[11px] text-slate-400 block">মোট বিক্রি</span>
            <span id="t4_stat_sold" class="text-base sm:text-xl font-black text-emerald-400">৳০</span>
          </div>
          <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <span class="text-[11px] text-slate-400 block">মোট আদায়কৃত নগদ</span>
            <span id="t4_stat_cash" class="text-base sm:text-xl font-black text-teal-400">৳০</span>
          </div>
          <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <span class="text-[11px] text-slate-400 block">মোট বাকি</span>
            <span id="t4_stat_due" class="text-base sm:text-xl font-black text-rose-400">৳০</span>
          </div>
        </div>

        <!-- Records Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left text-slate-300">
            <thead class="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th class="py-2.5 px-3">তারিখ</th>
                <th class="py-2.5 px-3">চালান নং</th>
                <th class="py-2.5 px-3">ডিএসআর</th>
                <th class="py-2.5 px-3 text-right">বিক্রি মূল্য</th>
                <th class="py-2.5 px-3 text-right">নগদ জমা</th>
                <th class="py-2.5 px-3 text-right">বাকি</th>
                <th class="py-2.5 px-3 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody id="t4_table_body" class="divide-y divide-slate-800/60">
              <!-- Rendered by JS -->
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 1: PRODUCT MANAGEMENT & STOCK -->
    <section id="tab1" class="tab-content hidden space-y-4">
      <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h2 class="text-base sm:text-lg font-black text-white">📦 পণ্য ও স্টক ব্যবস্থাপনা</h2>
          <button onclick="toggleAddProductForm()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow">
            + নতুন পণ্য যোগ করুন
          </button>
        </div>

        <!-- Add Product Form (Hidden by default) -->
        <div id="addProductForm" class="hidden bg-slate-900 p-4 rounded-xl border border-slate-800 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">পণ্যের নাম *</label>
            <input type="text" id="p_name" placeholder="যেমন: সয়াবিন তেল ১ লিটার" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">একক (Unit) *</label>
            <input type="text" id="p_unit" placeholder="যেমন: পিস, কেজি, কার্টুন" value="পিস" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">মূল্য (৳) *</label>
            <input type="number" id="p_price" placeholder="০" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">বর্তমান স্টক সংখ্যা *</label>
            <input type="number" id="p_stock" placeholder="০" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white" />
          </div>
          <div class="sm:col-span-4 flex justify-end gap-2 mt-2">
            <button onclick="toggleAddProductForm()" class="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg">বাতিল</button>
            <button onclick="saveNewProduct()" class="px-4 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg">সংরক্ষণ করুন</button>
          </div>
        </div>

        <!-- Products Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left text-slate-300">
            <thead class="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th class="py-2.5 px-3">পণ্যের নাম</th>
                <th class="py-2.5 px-3">একক</th>
                <th class="py-2.5 px-3 text-right">মূল্য (৳)</th>
                <th class="py-2.5 px-3 text-right">বিক্রয়যোগ্য স্টক</th>
                <th class="py-2.5 px-3 text-right">ড্যামেজ স্টক</th>
                <th class="py-2.5 px-3 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody id="t1_product_table" class="divide-y divide-slate-800/60">
              <!-- Rendered by JS -->
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 2: DSR MANAGEMENT -->
    <section id="tab2" class="tab-content hidden space-y-4">
      <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h2 class="text-base sm:text-lg font-black text-white">👥 ডিএসআর তালিকা ও হিসাব</h2>
          <button onclick="toggleAddDsrForm()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow">
            + নতুন ডিএসআর যোগ করুন
          </button>
        </div>

        <!-- Add DSR Form -->
        <div id="addDsrForm" class="hidden bg-slate-900 p-4 rounded-xl border border-slate-800 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">নাম *</label>
            <input type="text" id="d_name" placeholder="ডিএসআরের নাম" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">ফোন নম্বর</label>
            <input type="text" id="d_phone" placeholder="০১৭xxxxxxxx" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white" />
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">রুট / এলাকা</label>
            <input type="text" id="d_route" placeholder="যেমন: সদর বাজার" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white" />
          </div>
          <div class="sm:col-span-3 flex justify-end gap-2 mt-2">
            <button onclick="toggleAddDsrForm()" class="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg">বাতিল</button>
            <button onclick="saveNewDsr()" class="px-4 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg">সংরক্ষণ করুন</button>
          </div>
        </div>

        <!-- DSR Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left text-slate-300">
            <thead class="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th class="py-2.5 px-3">ডিএসআর নাম</th>
                <th class="py-2.5 px-3">রুট</th>
                <th class="py-2.5 px-3">মোবাইল</th>
                <th class="py-2.5 px-3 text-right">বর্তমান মোট বাকি</th>
                <th class="py-2.5 px-3 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody id="t2_dsr_table" class="divide-y divide-slate-800/60">
              <!-- Rendered by JS -->
            </tbody>
          </table>
        </div>
      </div>
    </section>

  </main>

  <!-- PRINT SLIP MODAL -->
  <div id="printModal" class="fixed inset-0 bg-black/80 z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
      <div id="printArea" class="p-4 border border-slate-200 rounded-xl space-y-3 text-xs">
        <!-- Rendered by JS -->
      </div>
      <div class="flex justify-end gap-2">
        <button onclick="closePrintModal()" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl">বন্ধ করুন</button>
        <button onclick="window.print()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow">🖨️ প্রিন্ট করুন</button>
      </div>
    </div>
  </div>

  <!-- JAVASCRIPT APP LOGIC -->
  <script>
    // Initial Seed Data
    const defaultData = ${initialData};
    let appData = {
      products: [],
      salesmen: [],
      dispatches: [],
      damageLogs: [],
      settings: defaultData.settings
    };

    // Load from LocalStorage
    try {
      const saved = localStorage.getItem('dsr_offline_app_data');
      if (saved) {
        appData = JSON.parse(saved);
      } else {
        appData = defaultData;
        saveData();
      }
    } catch (e) {
      appData = defaultData;
    }

    function saveData() {
      try {
        localStorage.setItem('dsr_offline_app_data', JSON.stringify(appData));
      } catch (e) {
        console.error('LocalStorage save error', e);
      }
    }

    function backupData() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "dsr_backup_" + new Date().toISOString().split('T')[0] + ".json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    // Tab Switching
    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('bg-emerald-600', 'text-white', 'shadow');
        el.classList.add('text-slate-400');
      });

      const activeSection = document.getElementById(tabId);
      if (activeSection) activeSection.classList.remove('hidden');

      const btnMap = {
        'tab3': 'btnTab3',
        'tab4': 'btnTab4',
        'tab1': 'btnTab1',
        'tab2': 'btnTab2'
      };
      const activeBtn = document.getElementById(btnMap[tabId]);
      if (activeBtn) {
        activeBtn.classList.add('bg-emerald-600', 'text-white', 'shadow');
        activeBtn.classList.remove('text-slate-400');
      }

      if (tabId === 'tab3') renderTab3();
      if (tabId === 'tab4') renderTab4Summary();
      if (tabId === 'tab1') renderTab1Products();
      if (tabId === 'tab2') renderTab2Dsr();
    }

    // Set today date on inputs
    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('t3_date').value = todayStr;
    document.getElementById('t4_filter_date').value = todayStr;

    // TAB 3 LOGIC
    function renderTab3() {
      const dsrSelect = document.getElementById('t3_dsr');
      dsrSelect.innerHTML = '<option value="">ডিএসআর নির্বাচন করুন</option>' + 
        appData.salesmen.map(s => \`<option value="\${s.id}">\${s.name} (\${s.route})</option>\`).join('');
      renderTab3Items();
    }

    function renderTab3Items() {
      const listContainer = document.getElementById('t3_items_list');
      if (appData.products.length === 0) {
        listContainer.innerHTML = '<div class="p-4 bg-slate-900 text-slate-400 text-xs rounded-xl text-center">কোনো পণ্য নেই। প্রথমে পণ্য যোগ করুন।</div>';
        return;
      }

      listContainer.innerHTML = appData.products.map(p => \`
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5" id="item_card_\${p.id}">
          <div class="flex items-center justify-between">
            <span class="font-bold text-sm text-white">\${p.name}</span>
            <span class="text-xs text-emerald-400 font-bold">দর: ৳\${p.unitPrice} / \${p.unit}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <label class="text-[11px] text-slate-400 block mb-0.5">সকালে বিতরণ (\${p.unit})</label>
              <input type="number" id="issued_\${p.id}" oninput="calcTab3Summary()" placeholder="০" min="0" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-center font-bold" />
            </div>
            <div>
              <label class="text-[11px] text-slate-400 block mb-0.5">দিনশেষে ফেরত (\${p.unit})</label>
              <input type="number" id="returned_\${p.id}" oninput="calcTab3Summary()" placeholder="০" min="0" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-emerald-300 text-center font-bold" />
            </div>
            <div>
              <label class="text-[11px] text-slate-400 block mb-0.5">ড্যামেজ ফেরত (\${p.unit})</label>
              <input type="number" id="damage_\${p.id}" oninput="calcTab3Summary()" placeholder="০" min="0" class="w-full bg-slate-950 border border-amber-700/80 rounded-lg px-2 py-1 text-amber-300 text-center font-bold" />
            </div>
            <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center flex flex-col justify-center">
              <span class="text-[10px] text-slate-400">প্রকৃত বিক্রি ও মূল্য</span>
              <span id="sold_summary_\${p.id}" class="font-black text-emerald-400 text-xs">০ \${p.unit} = ৳০</span>
            </div>
          </div>
        </div>
      \`).join('');

      calcTab3Summary();
    }

    function calcTab3Summary() {
      let totalSaleAmount = 0;
      let totalDamageQty = 0;

      appData.products.forEach(p => {
        const issued = parseFloat(document.getElementById(\`issued_\${p.id}\`)?.value) || 0;
        const returned = parseFloat(document.getElementById(\`returned_\${p.id}\`)?.value) || 0;
        const damage = parseFloat(document.getElementById(\`damage_\${p.id}\`)?.value) || 0;

        const sold = Math.max(0, issued - returned - damage);
        const amount = sold * p.unitPrice;

        totalSaleAmount += amount;
        totalDamageQty += damage;

        const summaryEl = document.getElementById(\`sold_summary_\${p.id}\`);
        if (summaryEl) {
          summaryEl.innerText = \`\${sold} \${p.unit} = ৳\${amount}\`;
        }
      });

      document.getElementById('t3_total_amount').innerText = '৳' + totalSaleAmount.toLocaleString('en-IN');
      document.getElementById('t3_total_damage').innerText = totalDamageQty;

      const cash = parseFloat(document.getElementById('t3_cash_collected').value) || 0;
      const due = Math.max(0, totalSaleAmount - cash);
      document.getElementById('t3_today_due').innerText = '৳' + due.toLocaleString('en-IN');
    }

    function saveTab3Dispatch() {
      const salesmanId = document.getElementById('t3_dsr').value;
      if (!salesmanId) {
        alert('দয়া করে ডিএসআর নির্বাচন করুন!');
        return;
      }
      const salesman = appData.salesmen.find(s => s.id === salesmanId);
      const date = document.getElementById('t3_date').value || todayStr;
      const note = document.getElementById('t3_note').value || '';
      const cashCollected = parseFloat(document.getElementById('t3_cash_collected').value) || 0;

      const items = [];
      let totalSaleAmount = 0;

      appData.products.forEach(p => {
        const issued = parseFloat(document.getElementById(\`issued_\${p.id}\`)?.value) || 0;
        const returned = parseFloat(document.getElementById(\`returned_\${p.id}\`)?.value) || 0;
        const damage = parseFloat(document.getElementById(\`damage_\${p.id}\`)?.value) || 0;

        if (issued > 0 || returned > 0 || damage > 0) {
          const sold = Math.max(0, issued - returned - damage);
          const amount = sold * p.unitPrice;
          totalSaleAmount += amount;

          items.push({
            productId: p.id,
            productName: p.name,
            unit: p.unit,
            unitPrice: p.unitPrice,
            issuedQty: issued,
            returnedQty: returned,
            damageReturnedQty: damage,
            soldQty: sold,
            totalAmount: amount
          });

          // Stock adjustment
          // Main stock decreases by soldQty + damage
          p.stock = Math.max(0, (p.stock || 0) - (sold + damage));
          // Damage stock increases by damage
          if (damage > 0) {
            p.damageStock = (p.damageStock || 0) + damage;
          }
        }
      });

      if (items.length === 0) {
        alert('কমপক্ষে একটি পণ্যের বিতরণ বা ফেরত সংখ্যা দিন!');
        return;
      }

      const dueAmount = Math.max(0, totalSaleAmount - cashCollected);

      // Update salesman due
      if (salesman) {
        salesman.currentDue = (salesman.currentDue || 0) + dueAmount;
      }

      const newDispatch = {
        id: 'disp_' + Date.now(),
        challanNo: 'CH-' + Math.floor(1000 + Math.random() * 9000),
        salesmanId,
        salesmanName: salesman ? salesman.name : 'Unknown',
        salesmanRoute: salesman ? salesman.route : '',
        date,
        status: 'settled',
        items,
        totalAmount: totalSaleAmount,
        cashCollected,
        dueAmount,
        notes: note,
        createdAt: new Date().toISOString()
      };

      appData.dispatches.unshift(newDispatch);
      saveData();

      alert('হিসাব ও চালান সফলভাবে সংরক্ষিত হয়েছে!');
      switchTab('tab4');
    }

    // TAB 4 LOGIC
    function renderTab4Summary() {
      const selectedDate = document.getElementById('t4_filter_date').value;
      const filtered = appData.dispatches.filter(d => d.date === selectedDate);

      let totalSold = 0;
      let totalCash = 0;
      let totalDue = 0;

      filtered.forEach(d => {
        totalSold += d.totalAmount || 0;
        totalCash += d.cashCollected || 0;
        totalDue += d.dueAmount || 0;
      });

      document.getElementById('t4_stat_dispatches').innerText = filtered.length + ' টি';
      document.getElementById('t4_stat_sold').innerText = '৳' + totalSold.toLocaleString('en-IN');
      document.getElementById('t4_stat_cash').innerText = '৳' + totalCash.toLocaleString('en-IN');
      document.getElementById('t4_stat_due').innerText = '৳' + totalDue.toLocaleString('en-IN');

      const tbody = document.getElementById('t4_table_body');
      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="py-6 text-center text-slate-500">এই তারিখে কোনো হিসাব পাওয়া যায়নি।</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map(d => \`
        <tr class="hover:bg-slate-900/60 transition">
          <td class="py-2.5 px-3 font-mono text-[11px]">\${d.date}</td>
          <td class="py-2.5 px-3 font-bold text-emerald-400">\${d.challanNo}</td>
          <td class="py-2.5 px-3 font-bold text-white">\${d.salesmanName} <span class="text-slate-400 text-[10px]">(\${d.salesmanRoute})</span></td>
          <td class="py-2.5 px-3 text-right font-bold text-emerald-400">৳\${d.totalAmount.toLocaleString('en-IN')}</td>
          <td class="py-2.5 px-3 text-right font-bold text-teal-400">৳\${d.cashCollected.toLocaleString('en-IN')}</td>
          <td class="py-2.5 px-3 text-right font-bold text-rose-400">৳\${d.dueAmount.toLocaleString('en-IN')}</td>
          <td class="py-2.5 px-3 text-center">
            <button onclick="openPrintSlip('\${d.id}')" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded text-[11px] font-bold">
              🖨️ স্লিপ
            </button>
          </td>
        </tr>
      \`).join('');
    }

    // PRINT SLIP
    function openPrintSlip(id) {
      const d = appData.dispatches.find(item => item.id === id);
      if (!d) return;

      const printArea = document.getElementById('printArea');
      printArea.innerHTML = \`
        <div class="text-center border-b border-slate-300 pb-2 mb-2">
          <h2 class="text-base font-black">\${appData.settings.businessName || 'স্টক ও ডিএসআর সেলস'}</h2>
          <p class="text-[10px] text-slate-600">দৈনিক বিতরণ ও বিক্রয় চালান</p>
          <div class="flex justify-between text-[11px] mt-1 font-mono text-slate-700">
            <span>চালান: \${d.challanNo}</span>
            <span>তারিখ: \${d.date}</span>
          </div>
        </div>
        <div class="text-[11px] space-y-0.5 mb-2">
          <p><strong>ডিএসআর:</strong> \${d.salesmanName} (\${d.salesmanRoute})</p>
        </div>
        <table class="w-full text-[10px] text-left border-collapse border border-slate-200">
          <thead>
            <tr class="bg-slate-100 border-b border-slate-200">
              <th class="p-1">পণ্য</th>
              <th class="p-1 text-center">বিতরণ</th>
              <th class="p-1 text-center">ফেরত</th>
              <th class="p-1 text-center">ড্যামেজ</th>
              <th class="p-1 text-center">বিক্রি</th>
              <th class="p-1 text-right">মূল্য</th>
            </tr>
          </thead>
          <tbody>
            \${d.items.map(it => \`
              <tr class="border-b border-slate-100">
                <td class="p-1 font-medium">\${it.productName}</td>
                <td class="p-1 text-center">\${it.issuedQty}</td>
                <td class="p-1 text-center">\${it.returnedQty}</td>
                <td class="p-1 text-center">\${it.damageReturnedQty}</td>
                <td class="p-1 text-center font-bold">\${it.soldQty}</td>
                <td class="p-1 text-right">৳\${it.totalAmount}</td>
              </tr>
            \`).join('')}
          </tbody>
        </table>
        <div class="border-t border-slate-300 pt-2 text-right space-y-1 font-bold">
          <p>মোট বিক্রি মূল্য: ৳\${d.totalAmount.toLocaleString('en-IN')}</p>
          <p class="text-emerald-700">নগদ জমা: ৳\${d.cashCollected.toLocaleString('en-IN')}</p>
          <p class="text-rose-700">বাকি: ৳\${d.dueAmount.toLocaleString('en-IN')}</p>
        </div>
      \`;

      document.getElementById('printModal').classList.remove('hidden');
    }

    function closePrintModal() {
      document.getElementById('printModal').classList.add('hidden');
    }

    // TAB 1 PRODUCTS
    function renderTab1Products() {
      const tbody = document.getElementById('t1_product_table');
      tbody.innerHTML = appData.products.map(p => \`
        <tr class="hover:bg-slate-900/60 transition">
          <td class="py-2.5 px-3 font-bold text-white">\${p.name}</td>
          <td class="py-2.5 px-3 text-slate-400">\${p.unit}</td>
          <td class="py-2.5 px-3 text-right font-bold text-emerald-400">৳\${p.unitPrice}</td>
          <td class="py-2.5 px-3 text-right font-black text-white">\${p.stock}</td>
          <td class="py-2.5 px-3 text-right font-bold text-amber-400">\${p.damageStock || 0}</td>
          <td class="py-2.5 px-3 text-center">
            <button onclick="deleteProduct('\${p.id}')" class="text-rose-400 hover:text-rose-300 text-xs">মুছুন</button>
          </td>
        </tr>
      \`).join('');
    }

    function toggleAddProductForm() {
      document.getElementById('addProductForm').classList.toggle('hidden');
    }

    function saveNewProduct() {
      const name = document.getElementById('p_name').value.trim();
      const unit = document.getElementById('p_unit').value.trim() || 'পিস';
      const price = parseFloat(document.getElementById('p_price').value) || 0;
      const stock = parseFloat(document.getElementById('p_stock').value) || 0;

      if (!name) { alert('পণ্যের নাম লিখুন'); return; }

      appData.products.push({
        id: 'prod_' + Date.now(),
        name,
        unit,
        unitPrice: price,
        stock,
        damageStock: 0,
        createdAt: new Date().toISOString()
      });
      saveData();
      toggleAddProductForm();
      renderTab1Products();
    }

    function deleteProduct(id) {
      if (confirm('পণ্যটি মুছে ফেলতে চান?')) {
        appData.products = appData.products.filter(p => p.id !== id);
        saveData();
        renderTab1Products();
      }
    }

    // TAB 2 DSR
    function renderTab2Dsr() {
      const tbody = document.getElementById('t2_dsr_table');
      tbody.innerHTML = appData.salesmen.map(s => \`
        <tr class="hover:bg-slate-900/60 transition">
          <td class="py-2.5 px-3 font-bold text-white">\${s.name}</td>
          <td class="py-2.5 px-3 text-slate-400">\${s.route}</td>
          <td class="py-2.5 px-3 text-slate-400 font-mono">\${s.phone || '-'}</td>
          <td class="py-2.5 px-3 text-right font-bold text-rose-400">৳\${(s.currentDue || 0).toLocaleString('en-IN')}</td>
          <td class="py-2.5 px-3 text-center">
            <button onclick="deleteDsr('\${s.id}')" class="text-rose-400 hover:text-rose-300 text-xs">মুছুন</button>
          </td>
        </tr>
      \`).join('');
    }

    function toggleAddDsrForm() {
      document.getElementById('addDsrForm').classList.toggle('hidden');
    }

    function saveNewDsr() {
      const name = document.getElementById('d_name').value.trim();
      const phone = document.getElementById('d_phone').value.trim();
      const route = document.getElementById('d_route').value.trim();

      if (!name) { alert('ডিএসআরের নাম লিখুন'); return; }

      appData.salesmen.push({
        id: 'salesman_' + Date.now(),
        name,
        phone,
        route,
        currentDue: 0
      });
      saveData();
      toggleAddDsrForm();
      renderTab2Dsr();
    }

    function deleteDsr(id) {
      if (confirm('ডিএসআর মুছে ফেলতে চান?')) {
        appData.salesmen = appData.salesmen.filter(s => s.id !== id);
        saveData();
        renderTab2Dsr();
      }
    }

    // Initialize with Tab 3
    renderTab3();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'DSR-Stock-App.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
