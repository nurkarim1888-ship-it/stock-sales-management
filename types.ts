export interface AppSettings {
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  connectedGmail?: string;
  cloudSyncEnabled?: boolean;
  syncCode?: string;
}

export interface Product {
  id: string;
  name: string;
  category?: string;
  unit: string; // যেমন: পিস, কার্টুন, প্যাকেট, লিটার, কেজি
  unitPrice: number; // একক মূল্য ৳
  stock: number; // মূল বিক্রয়যোগ্য স্টক
  damageStock: number; // আলাদা ড্যামেজ স্টক
  createdAt: string;
}

export interface Salesman {
  id: string;
  name: string;
  phone: string;
  route: string;
  currentDue: number; // পূর্বের মোট বাকি
}

export interface DispatchItem {
  productId: string;
  productName: string;
  unit: string;
  unitPrice: number;
  issuedQty: number; // সকালে বুঝিয়ে দেওয়া স্টক
  returnedQty: number; // দিনশেষে অবিক্রীত ফেরত স্টক
  damageReturnedQty: number; // ফেরত ড্যামেজ (যদি থাকে)
  soldQty: number; // প্রকৃত বিক্রি = issuedQty - returnedQty - damageReturnedQty
  totalAmount: number; // soldQty * unitPrice
}

export interface DispatchSession {
  id: string;
  challanNo: string;
  salesmanId: string;
  salesmanName: string;
  salesmanRoute: string;
  date: string;
  status: 'morning_issued' | 'settled'; // সকালের বিতরণ | দিনশেষে সম্পন্ন
  items: DispatchItem[];
  totalAmount: number; // সকল পণ্যের বিক্রির মোট মূল্য
  cashCollected: number; // টাকা জমা
  dueAmount: number; // বাকি = totalAmount - cashCollected
  notes?: string;
  createdAt: string;
  settledAt?: string;
}

export interface DamageLog {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  action: 'added_to_damage' | 'returned_to_sellable' | 'scrapped';
  note: string;
  date: string;
}
