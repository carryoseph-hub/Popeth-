export const translations = {
  en: {
    // Nav
    nav_dashboard: "Dashboard",
    nav_items: "Item Catalog",
    nav_stock: "Stock & Warehouses",
    nav_purchases: "Purchases & Suppliers",
    nav_sales: "Sales & Customers",
    nav_reports: "Reports",
    nav_users: "Users & Roles",

    // Sidebar / auth
    signed_in_as: "Signed in as",
    sign_out: "Sign out",
    sign_in: "Sign in",
    signing_in: "Signing in…",
    staff_sign_in: "Staff sign in",
    back_to_store: "← Back to store",
    email: "Email",
    password: "Password",
    waiting_for_access: "Waiting for access",
    waiting_for_access_body: "is signed in but doesn't have a department assigned yet. Ask your Admin to assign one on the \"Users & Roles\" page.",

    // Storefront
    this_weeks_deals: "This Week's Deals",
    storefront_tagline: "Real markdowns on TVs, fridges, and appliances — refreshed every week.",
    loading_deals: "Loading this week's deals…",
    no_deals: "No deals are live right now — check back soon.",

    // Dashboard
    welcome_back: "Welcome back",
    tracking_today: "Here's how Stockline is tracking today.",
    items_tracked: "Items tracked",
    across_warehouses: "Across {n} warehouses",
    low_stock: "Low stock",
    at_or_below_reorder: "At or below reorder level",
    stock_value: "Stock value",
    at_current_cost: "At current cost price",
    sales_recorded: "Sales recorded",
    reorder_alerts: "Reorder alerts",
    sorted_by_urgency: "Sorted by urgency",
    all_above_reorder: "All items are above their reorder level.",
    recent_activity: "Recent activity",
    need_reordering: "items need reordering",

    // Items
    search_placeholder: "Search by name or SKU",
    add_item: "Add item",
    item: "Item",
    sku: "SKU",
    warehouse: "Warehouse",
    cost_price: "Cost / Price",
    qty: "Qty",
    status: "Status",
    weekly_deal: "Weekly deal",
    no_items_found: "No items match your search.",
    propose_deal: "Propose deal",
    pending_review: "Pending review",
    live: "live",
    end_deal: "End",
    deals_awaiting_approval: "Deals awaiting your approval",

    // Stock
    transfer_stock: "Transfer stock",
    stock_value_label: "stock value",
    no_stock_here: "No stock at this warehouse.",

    // Purchases
    purchase_orders: "Purchase orders (Goods Received)",
    new_purchase_order: "New purchase order",
    no_purchase_orders: "No purchase orders yet.",
    suppliers: "Suppliers",

    // Sales
    sales_history: "Sales history",
    new_sale: "New sale",
    no_sales_yet: "No sales recorded yet.",
    customers: "Customers",
    sales_awaiting_approval: "Sales awaiting your approval",

    // Reports
    print_report: "Print report",
    stock_at_cost: "Stock at cost",
    revenue_session: "Revenue (session)",
    gross_profit: "Gross profit",
    stock_value_by_item: "Stock value by item",
    stock_movement: "Stock movement — fast vs. slow moving",
    units_sold_session: "Units sold (session)",
    remaining_stock: "Remaining stock",
    movement: "Movement",
    fast_moving: "Fast-moving",
    slow_moving: "Slow-moving",
    moderate: "Moderate",

    // Users & roles
    departments_features: "Departments & feature access",
    departments_desc: "Admin always has every feature, so the account managing this table can never lock itself out. For every other department, tick the boxes for the features that team should be able to open — everything else stays hidden from them.",
    department: "Department",
    add_department: "Add department",
    new_department_placeholder: "New department name, e.g. Accountant",
    team_access: "Team access",
    team_access_desc: "First create the person's login in the Firebase console (Authentication → Users → Add user), then assign their email to a department here — that's what they'll see the moment they sign in.",
    no_accounts_assigned: "No accounts assigned yet.",
    assign: "Assign",
    audit_trail: "Audit trail — who changed what, and when",
    data_storage: "Data storage",
    data_storage_desc: "Everything you add here is saved automatically and shared with anyone else using this app — it will still be here the next time it's opened.",
    reset_all_data: "Reset all data",

    // Buttons / common
    cancel: "Cancel",
    save: "Save",
    close: "Close",
    approve: "Approve",
    reject: "Reject",
    submit_for_approval: "Submit for approval",
    add_line: "Add line",
  },

  am: {
    nav_dashboard: "ዳሽቦርድ",
    nav_items: "የዕቃ ዝርዝር",
    nav_stock: "ክምችት እና መጋዘኖች",
    nav_purchases: "ግዢ እና አቅራቢዎች",
    nav_sales: "ሽያጭ እና ደንበኞች",
    nav_reports: "ሪፖርቶች",
    nav_users: "ተጠቃሚዎች እና ስልጣን",

    signed_in_as: "ገብተዋል እንደ",
    sign_out: "ውጣ",
    sign_in: "ግባ",
    signing_in: "በመግባት ላይ…",
    staff_sign_in: "የሰራተኛ መግቢያ",
    back_to_store: "← ወደ መደብር ተመለስ",
    email: "ኢሜይል",
    password: "የይለፍ ቃል",
    waiting_for_access: "የመዳረሻ ማረጋገጫ በመጠባበቅ ላይ",
    waiting_for_access_body: "ገብተዋል፣ ግን ገና የስራ ክፍል አልተመደበልዎትም። Admin \"ተጠቃሚዎች እና ስልጣን\" ገፅ ላይ እንዲመድብልዎት ይጠይቁ።",

    this_weeks_deals: "የዚህ ሳምንት ቅናሾች",
    storefront_tagline: "በቴሌቪዥን፣ ፍሪጅ እና ኤሌክትሪክ እቃዎች ላይ እውነተኛ ቅናሽ — በየሳምንቱ ይዘምናል።",
    loading_deals: "የዚህ ሳምንት ቅናሾች እየተጫኑ ነው…",
    no_deals: "አሁን ምንም ቅናሽ የለም — ቆይተው ይመልከቱ።",

    welcome_back: "እንኳን ደህና መጡ",
    tracking_today: "የ Stockline ዛሬ ሁኔታ እነሆ።",
    items_tracked: "የተመዘገቡ ዕቃዎች",
    across_warehouses: "በ{n} መጋዘኖች ውስጥ",
    low_stock: "ያነሰ ክምችት",
    at_or_below_reorder: "ከማዘዣ ደረጃ በታች ወይም እኩል",
    stock_value: "የክምችት ዋጋ",
    at_current_cost: "በአሁኑ ዋጋ",
    sales_recorded: "የተመዘገበ ሽያጭ",
    reorder_alerts: "የማዘዣ ማንቂያ",
    sorted_by_urgency: "በአስቸኳይነት የተደረደረ",
    all_above_reorder: "ሁሉም ዕቃዎች ከማዘዣ ደረጃ በላይ ናቸው።",
    recent_activity: "የቅርብ ጊዜ እንቅስቃሴ",
    need_reordering: "ማዘዣ ያስፈልጋቸዋል",

    search_placeholder: "በስም ወይም SKU ይፈልጉ",
    add_item: "ዕቃ ጨምር",
    item: "ዕቃ",
    sku: "SKU",
    warehouse: "መጋዘን",
    cost_price: "ዋጋ ግዢ / ሽያጭ",
    qty: "ብዛት",
    status: "ሁኔታ",
    weekly_deal: "የሳምንት ቅናሽ",
    no_items_found: "ከፍለጋዎ ጋር የሚዛመድ ዕቃ የለም።",
    propose_deal: "ቅናሽ አቅርብ",
    pending_review: "በግምገማ ላይ",
    live: "ቀጥታ",
    end_deal: "አቁም",
    deals_awaiting_approval: "የእርስዎን ማጽደቅ የሚጠብቁ ቅናሾች",

    transfer_stock: "ዕቃ አዙር",
    stock_value_label: "የክምችት ዋጋ",
    no_stock_here: "በዚህ መጋዘን ውስጥ ምንም ክምችት የለም።",

    purchase_orders: "የግዢ ትዕዛዞች (የገቡ ዕቃዎች)",
    new_purchase_order: "አዲስ የግዢ ትዕዛዝ",
    no_purchase_orders: "እስካሁን ምንም የግዢ ትዕዛዝ የለም።",
    suppliers: "አቅራቢዎች",

    sales_history: "የሽያጭ ታሪክ",
    new_sale: "አዲስ ሽያጭ",
    no_sales_yet: "እስካሁን ምንም ሽያጭ አልተመዘገበም።",
    customers: "ደንበኞች",
    sales_awaiting_approval: "የእርስዎን ማጽደቅ የሚጠብቁ ሽያጮች",

    print_report: "ሪፖርት አትም",
    stock_at_cost: "ክምችት በዋጋ",
    revenue_session: "ገቢ (ይህ ክፍለ ጊዜ)",
    gross_profit: "ጠቅላላ ትርፍ",
    stock_value_by_item: "የክምችት ዋጋ በዕቃ",
    stock_movement: "የዕቃ እንቅስቃሴ — ፈጣን እና ዘገምተኛ ሽያጭ",
    units_sold_session: "የተሸጠ ብዛት (ይህ ክፍለ ጊዜ)",
    remaining_stock: "የቀረ ክምችት",
    movement: "እንቅስቃሴ",
    fast_moving: "ፈጣን ሽያጭ",
    slow_moving: "ዘገምተኛ ሽያጭ",
    moderate: "መካከለኛ",

    departments_features: "የስራ ክፍሎች እና የፊውቸር መዳረሻ",
    departments_desc: "Admin ሁልጊዜ ሙሉ መዳረሻ አለው፣ ስለዚህ ራሱን ሊያዘጋ አይችልም። ለሌሎች የስራ ክፍሎች፣ እነሱ ሊከፍቱት የሚገባቸውን ፊውቸር ብቻ ይምረጡ — የቀረው ተደብቆ ይቆያል።",
    department: "የስራ ክፍል",
    add_department: "የስራ ክፍል ጨምር",
    new_department_placeholder: "አዲስ የስራ ክፍል ስም፣ ለምሳሌ Accountant",
    team_access: "የቡድን መዳረሻ",
    team_access_desc: "መጀመሪያ በ Firebase console (Authentication → Users → Add user) የሰውየውን login ይፍጠሩ፣ ከዚያ ኢሜያቸውን ለአንድ የስራ ክፍል እዚህ ይመድቡ — ሲገቡ የሚያዩት ያ ነው።",
    no_accounts_assigned: "እስካሁን ምንም አካውንት አልተመደበም።",
    assign: "መድብ",
    audit_trail: "የስራ መዝገብ — ማን፣ ምን እንደቀየረ፣ መቼ",
    data_storage: "ውሂብ ማከማቻ",
    data_storage_desc: "እዚህ የሚጨምሩት ሁሉ በራስ-ሰር ይቀመጣል እና ይህን መተግበሪያ ከሚጠቀም ማንኛውም ሰው ጋር ይጋራል — በሚቀጥለው ጊዜ ሲከፍቱት አሁንም እዚያ ይኖራል።",
    reset_all_data: "ውሂብ ሁሉ መልስ",

    cancel: "ተወው",
    save: "አስቀምጥ",
    close: "ዝጋ",
    approve: "አጽድቅ",
    reject: "አትቀበል",
    submit_for_approval: "ለማጽደቅ አስገባ",
    add_line: "መስመር ጨምር",
  },
};

export function makeTranslator(lang) {
  return function t(key, vars) {
    let str = (translations[lang] && translations[lang][key]) || translations.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        str = str.replace(`{${k}}`, vars[k]);
      });
    }
    return str;
  };
}
