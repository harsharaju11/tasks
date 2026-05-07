const STORAGE = {
  users: "nexa_users",
  products: "nexa_products",
  cart: "nexa_cart",
  orders: "nexa_orders",
  refunds: "nexa_refunds",
  statuses: "nexa_order_statuses",
  session: "nexa_session"
};

const ADMIN_CODE = "1234";
const PAGE_SIZE = 8;
const DELIVERY_FEE = 49;
const PLATFORM_FEE = 7;
const COD_FEE = 20;
const statusOptions = ["Paid", "COD Pending", "Order Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
const categories = ["All", "Electronics", "Home"];

let users = [];
let products = [];
let cart = [];
let orders = [];
let refunds = [];
let session = null;
let chosenRole = "user";
let authMode = "login";
let currentPage = "home";
let activeCategory = "All";
let shopPageNumber = 1;
let heroIndex = 0;
let reviewIndex = 0;
let appliedCoupon = "";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  loadState();
  bindEvents();
  restoreSession();
});

function cacheElements() {
  [
    "roleView", "authView", "storeView", "adminView", "backToRolesBtn", "authEyebrow", "authTitle",
    "authCopy", "userAuthTabs", "userLoginTab", "userSignupTab", "authForm", "nameField", "nameInput",
    "emailInput", "credentialField", "credentialLabel", "credentialInput", "authSubmitBtn", "otpNotice",
    "heroTrack", "heroDots", "bestSellerGrid", "homeArrivalGrid", "reviewSlider", "searchInput",
    "sortSelect", "categoryChips", "productGrid", "prevPageBtn", "nextPageBtn", "pageLabel",
    "arrivalGrid", "profileName", "profileEmail", "profilePhone", "profileCity", "profileAddress",
    "profilePayment", "profileSupport", "userProfileForm", "userSummaryCards", "userRecentOrders",
    "cartItems", "cartCount", "couponInput", "applyCouponBtn", "addressInput",
    "liveLocationBtn", "upiBox", "cardBox", "cardName", "cardNumber", "cardExpiry", "cardCvc",
    "summaryLines", "placeOrderBtn", "storeLogoutBtn", "adminLogoutBtn", "adminClock", "kpiGrid",
    "adminInsightGrid", "recentOrderCount", "adminRecentOrders", "lowStockCount", "lowStockList",
    "inventorySearch", "inventorySummary", "inventoryTable",
    "productForm", "newName", "newCategory", "newCost", "newPrice", "newDiscount", "newStock",
    "newImage", "newDescription", "ordersTable", "detailModal", "detailContent", "closeDetailBtn",
    "orderPopup", "orderPopupContent", "toast"
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function loadState() {
  users = read(STORAGE.users, []);
  products = read(STORAGE.products, seedProducts());
  cart = read(STORAGE.cart, []);
  orders = read(STORAGE.orders, []);
  refunds = read(STORAGE.refunds, []);
  session = read(STORAGE.session, null);

  if (products.length < 20) {
    products = seedProducts();
  }
  saveAll();
}

function bindEvents() {
  document.querySelectorAll("[data-role]").forEach((button) => {
    button.addEventListener("click", () => openAuth(button.dataset.role));
  });

  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.closest("#orderPopup")) {
        els.orderPopup.classList.add("hidden");
      }
      showStorePage(button.dataset.page);
    });
  });

  document.querySelectorAll("[data-admin-page]").forEach((button) => {
    button.addEventListener("click", () => showAdminPage(button.dataset.adminPage));
  });

  els.backToRolesBtn.addEventListener("click", showRoleView);
  els.userLoginTab.addEventListener("click", () => setUserAuthMode("login"));
  els.userSignupTab.addEventListener("click", () => setUserAuthMode("signup"));
  els.authForm.addEventListener("submit", handleAuth);
  els.storeLogoutBtn.addEventListener("click", logout);
  els.adminLogoutBtn.addEventListener("click", logout);
  els.searchInput.addEventListener("input", () => {
    shopPageNumber = 1;
    renderShop();
  });
  els.sortSelect.addEventListener("change", () => {
    shopPageNumber = 1;
    renderShop();
  });
  els.prevPageBtn.addEventListener("click", () => changeShopPage(-1));
  els.nextPageBtn.addEventListener("click", () => changeShopPage(1));
  els.applyCouponBtn.addEventListener("click", applyCoupon);
  els.liveLocationBtn.addEventListener("click", useLiveLocation);
  els.placeOrderBtn.addEventListener("click", placeOrder);
  els.productForm.addEventListener("submit", addProduct);
  els.userProfileForm.addEventListener("submit", saveUserProfile);
  els.inventorySearch.addEventListener("input", renderInventory);
  els.closeDetailBtn.addEventListener("click", () => els.detailModal.classList.add("hidden"));

  document.querySelectorAll("input[name='payment']").forEach((input) => {
    input.addEventListener("change", () => {
      renderPaymentFields();
      renderCheckout();
    });
  });
}

function restoreSession() {
  if (!session) {
    showRoleView();
    return;
  }
  if (session.role === "admin") {
    showAdmin();
  } else {
    showStore();
  }
}

function showRoleView() {
  toggleRoot("roleView");
  els.authForm.reset();
  els.otpNotice.classList.add("hidden");
}

function openAuth(role) {
  chosenRole = role;
  toggleRoot("authView");
  els.authForm.reset();
  els.otpNotice.classList.add("hidden");

  if (role === "admin") {
    els.authEyebrow.textContent = "Admin access";
    els.authTitle.textContent = "Admin Login";
    els.authCopy.textContent = "Enter the fixed admin email and password/OTP code 123456.";
    els.userAuthTabs.classList.add("hidden");
    els.nameField.classList.add("hidden");
    els.nameInput.required = false;
    els.credentialLabel.textContent = "Password / OTP";
    els.credentialInput.placeholder = "123456";
    els.credentialInput.required = true;
    els.emailInput.placeholder = "admin@nexa.local";
    els.authSubmitBtn.textContent = "Open Dashboard";
  } else {
    els.authEyebrow.textContent = "User access";
    els.authTitle.textContent = "Welcome to NEXA";
    els.authCopy.textContent = "Create an account to receive a fresh 6-digit OTP, or sign in with your saved email and OTP.";
    els.userAuthTabs.classList.remove("hidden");
    els.emailInput.placeholder = "you@example.com";
    setUserAuthMode("login");
  }
}

function setUserAuthMode(mode) {
  authMode = mode;
  els.userLoginTab.classList.toggle("active", mode === "login");
  els.userSignupTab.classList.toggle("active", mode === "signup");
  els.nameField.classList.toggle("hidden", mode === "login");
  els.credentialField.classList.toggle("hidden", mode === "signup");
  els.credentialInput.required = mode === "login";
  els.nameInput.required = mode === "signup";
  els.credentialLabel.textContent = "Saved OTP";
  els.credentialInput.placeholder = "6-digit OTP";
  els.authSubmitBtn.textContent = mode === "signup" ? "Create Account and Generate OTP" : "Login";
  els.otpNotice.classList.add("hidden");
}

function handleAuth(event) {
  event.preventDefault();
  const email = els.emailInput.value.trim().toLowerCase();
  const credential = els.credentialInput.value.trim();

  if (chosenRole === "admin") {
    if (email === "admin@nexa.local" && credential === ADMIN_CODE) {
      session = { role: "admin", name: "NEXA Admin", email };
      save(STORAGE.session, session);
      showAdmin();
    } else {
      toast("Use admin@nexa.local and password/OTP 123456.");
    }
    return;
  }

  if (authMode === "signup") {
    const name = els.nameInput.value.trim();
    if (!name || !email) {
      toast("Enter your name and email to create an account.");
      return;
    }
    const otp = generateOtp();
    const existing = users.find((user) => user.email === email);
    if (existing) {
      existing.name = name;
      existing.otp = otp;
      existing.otpCreatedAt = new Date().toISOString();
    } else {
      users.push({ id: `USR-${Date.now()}`, name, email, otp, otpCreatedAt: new Date().toISOString() });
    }
    save(STORAGE.users, users);
    setUserAuthMode("login");
    els.emailInput.value = email;
    els.otpNotice.textContent = `Signup complete. Your new saved OTP is ${otp}. Use it to log in.`;
    els.otpNotice.classList.remove("hidden");
    return;
  }

  const user = users.find((item) => item.email === email && item.otp === credential);
  if (!user) {
    toast("Email or OTP does not match a saved user.");
    return;
  }
  session = { role: "user", id: user.id, name: user.name, email: user.email };
  save(STORAGE.session, session);
  showStore();
}

function showStore() {
  toggleRoot("storeView");
  renderStoreChrome();
  showStorePage(currentPage);
}

function showAdmin() {
  toggleRoot("adminView");
  showAdminPage("overview");
  renderAdmin();
}

function toggleRoot(id) {
  ["roleView", "authView", "storeView", "adminView"].forEach((view) => {
    els[view].classList.toggle("hidden", view !== id);
  });
}

function showStorePage(page) {
  currentPage = page;
  ["home", "shop", "arrivals", "dashboard", "about", "contact", "cart"].forEach((name) => {
    document.getElementById(`${name}Page`).classList.toggle("hidden", name !== page);
  });
  document.querySelectorAll(".store-nav button").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === page);
  });
  if (page === "home") renderHome();
  if (page === "shop") renderShop();
  if (page === "arrivals") renderArrivals();
  if (page === "dashboard") renderUserDashboard();
  if (page === "cart") renderCheckout();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showAdminPage(page) {
  const map = {
    overview: "adminOverview",
    addProduct: "adminAddProduct",
    inventory: "adminInventory",
    orders: "adminOrders"
  };
  Object.values(map).forEach((id) => document.getElementById(id).classList.add("hidden"));
  document.getElementById(map[page]).classList.remove("hidden");
  document.querySelectorAll("[data-admin-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.adminPage === page);
  });
  renderAdmin();
}

function renderStoreChrome() {
  renderHero();
  renderCategoryChips();
  updateCartCount();
}

function renderHero() {
  const slides = [
    {
      title: "Smart Finds for Modern Homes",
      copy: "Shop electronics and home upgrades with clear discounts, fast checkout, and local order tracking.",
      image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Fresh Arrivals, Better Everyday Living",
      copy: "NEXA keeps your newest products one click away, including inventory added by the admin.",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Checkout Built for Choice",
      copy: "Use UPI, card, or cash on delivery with transparent fees, coupons, and order summaries.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80"
    }
  ];
  els.heroTrack.innerHTML = slides.map((slide, index) => `
    <article class="hero-slide ${index === heroIndex ? "active" : ""}">
      <div>
        <span class="eyebrow">NEXA Commerce</span>
        <h2>${slide.title}</h2>
        <p>${slide.copy}</p>
        <button class="primary-btn mt-6 max-w-48" type="button" data-page="shop">Shop Now</button>
      </div>
      <img src="${slide.image}" alt="${slide.title}">
    </article>
  `).join("");
  els.heroDots.innerHTML = slides.map((_, index) => `<button class="${index === heroIndex ? "active" : ""}" type="button" data-hero="${index}"></button>`).join("");
  els.heroDots.querySelectorAll("[data-hero]").forEach((button) => {
    button.addEventListener("click", () => {
      heroIndex = Number(button.dataset.hero);
      renderHero();
    });
  });
  els.heroTrack.querySelector("[data-page='shop']").addEventListener("click", () => showStorePage("shop"));
}

function renderHome() {
  const best = [...products].sort((a, b) => b.discount - a.discount).slice(0, 4);
  const arrivals = getArrivals().slice(0, 4);
  els.bestSellerGrid.innerHTML = best.map(productCard).join("");
  els.homeArrivalGrid.innerHTML = arrivals.map(productCard).join("");
  bindProductButtons(els.bestSellerGrid);
  bindProductButtons(els.homeArrivalGrid);
  renderReviews();
}

function renderReviews() {
  const reviews = [
    ["Aarav M.", "The checkout summary is clear, and the UPI option feels quick and modern."],
    ["Priya S.", "I like that NEXA shows stock and discount upfront before I open the detail page."],
    ["Neha R.", "The store feels light, fast, and easy to use on mobile."]
  ];
  els.reviewSlider.innerHTML = reviews.map((review, index) => `
    <article class="review-card ${index === reviewIndex ? "active" : ""}">
      <strong>${review[0]}</strong>
      <span>${review[1]}</span>
    </article>
  `).join("");
}

function renderCategoryChips() {
  els.categoryChips.innerHTML = categories.map((category) => `
    <button class="${category === activeCategory ? "active" : ""}" type="button" data-category="${category}">${category}</button>
  `).join("");
  els.categoryChips.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      shopPageNumber = 1;
      renderCategoryChips();
      renderShop();
    });
  });
}

function renderShop() {
  let list = getFilteredProducts();
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  shopPageNumber = Math.min(shopPageNumber, totalPages);
  const visible = list.slice((shopPageNumber - 1) * PAGE_SIZE, shopPageNumber * PAGE_SIZE);
  els.productGrid.innerHTML = visible.map(productCard).join("");
  els.pageLabel.textContent = `Page ${shopPageNumber} of ${totalPages}`;
  els.prevPageBtn.disabled = shopPageNumber === 1;
  els.nextPageBtn.disabled = shopPageNumber === totalPages;
  bindProductButtons(els.productGrid);
}

function getFilteredProducts() {
  const query = els.searchInput.value.trim().toLowerCase();
  let list = products.filter((product) => {
    const categoryMatch = activeCategory === "All" || product.category === activeCategory;
    const queryMatch = !query || product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });

  if (els.sortSelect.value === "low") list = list.sort((a, b) => salePrice(a) - salePrice(b));
  if (els.sortSelect.value === "high") list = list.sort((a, b) => salePrice(b) - salePrice(a));
  if (els.sortSelect.value === "discount") list = list.sort((a, b) => b.discount - a.discount);
  return list;
}

function changeShopPage(delta) {
  shopPageNumber += delta;
  renderShop();
}

function renderArrivals() {
  els.arrivalGrid.innerHTML = getArrivals().map(productCard).join("");
  bindProductButtons(els.arrivalGrid);
}

function renderUserDashboard() {
  const user = users.find((item) => item.email === session.email);
  if (!user) return;
  els.profileName.value = user.name || "";
  els.profileEmail.value = user.email || "";
  els.profilePhone.value = user.phone || "";
  els.profileCity.value = user.city || "";
  els.profileAddress.value = user.address || "";
  els.profilePayment.value = user.preferredPayment || "UPI";
  els.profileSupport.value = user.supportPreference || "Email";

  const userOrders = orders.filter((order) => order.email === session.email);
  const delivered = userOrders.filter((order) => order.status === "Delivered").length;
  const active = userOrders.filter((order) => !["Delivered", "Cancelled"].includes(order.status)).length;
  const spent = userOrders.filter((order) => order.status !== "Cancelled").reduce((sum, order) => sum + order.summary.total, 0);
  els.userSummaryCards.innerHTML = [
    ["Total Orders", userOrders.length],
    ["Active Orders", active],
    ["Delivered", delivered],
    ["Total Spent", money.format(spent)]
  ].map(([label, value]) => `<article class="mini-stat"><span>${label}</span><strong>${value}</strong></article>`).join("");

  els.userRecentOrders.innerHTML = userOrders.length ? userOrders.slice(0, 5).map((order) => `
    <article class="recent-card">
      <strong>${order.id}</strong>
      <span>${order.items.map((item) => `${item.name} x ${item.qty}`).join(", ")}</span>
      <em>${order.status} · ${money.format(order.summary.total)}</em>
    </article>
  `).join("") : `<p class="text-slate-500">No orders yet. Shop products and your recent orders will show here.</p>`;
}

function saveUserProfile(event) {
  event.preventDefault();
  const user = users.find((item) => item.email === session.email);
  if (!user) return;
  user.name = els.profileName.value.trim();
  user.phone = els.profilePhone.value.trim();
  user.city = els.profileCity.value.trim();
  user.address = els.profileAddress.value.trim();
  user.preferredPayment = els.profilePayment.value;
  user.supportPreference = els.profileSupport.value;
  session.name = user.name;
  save(STORAGE.users, users);
  save(STORAGE.session, session);
  toast("Profile saved successfully.");
  renderUserDashboard();
}

function getArrivals() {
  return [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function productCard(product) {
  const currentPrice = salePrice(product);
  return `
    <article class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="badge">${product.discount}% OFF</span>
      </div>
      <div class="product-body">
        <div>
          <h3>${product.name}</h3>
          <div class="meta-row"><span>${product.category}</span><span>Stock: ${product.stock}</span></div>
        </div>
        <div class="price-row"><strong>${money.format(currentPrice)}</strong><span>${money.format(product.price)}</span></div>
        <div class="card-actions">
          <button type="button" data-detail="${product.id}">View Details</button>
          <button type="button" data-add="${product.id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `;
}

function bindProductButtons(root) {
  root.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.add));
  });
  root.querySelectorAll("[data-detail]").forEach((button) => {
    button.addEventListener("click", () => openDetails(button.dataset.detail));
  });
}

function openDetails(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  els.detailContent.innerHTML = `
    <div class="detail-layout">
      <img src="${product.image}" alt="${product.name}">
      <div class="grid gap-4">
        <span class="eyebrow">${product.category}</span>
        <h2>${product.name}</h2>
        <p class="text-slate-600 leading-7">${product.description}</p>
        <div class="price-row"><strong>${money.format(salePrice(product))}</strong><span>${money.format(product.price)}</span></div>
        <p class="font-black text-teal-700">${product.discount}% off · ${product.stock} units in stock</p>
        <div class="card-actions max-w-md">
          <button type="button" id="detailAdd">Add to Cart</button>
          <button type="button" id="detailBuy">Buy Now</button>
        </div>
      </div>
    </div>
  `;
  els.detailModal.classList.remove("hidden");
  document.getElementById("detailAdd").addEventListener("click", () => addToCart(id));
  document.getElementById("detailBuy").addEventListener("click", () => {
    addToCart(id);
    els.detailModal.classList.add("hidden");
    showStorePage("cart");
  });
}

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  if (!product || product.stock < 1) {
    toast("This product is out of stock.");
    return;
  }
  const line = cart.find((item) => item.productId === id);
  if (line) {
    if (line.qty >= product.stock) {
      toast("You reached available stock.");
      return;
    }
    line.qty += 1;
  } else {
    cart.push({ productId: id, qty: 1 });
  }
  save(STORAGE.cart, cart);
  updateCartCount();
  renderCheckout();
  toast("Added to cart.");
}

function updateCartCount() {
  els.cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

function renderCheckout() {
  updateCartCount();
  if (!cart.length) {
    els.cartItems.innerHTML = `<p class="text-slate-500">Your cart is empty. Add products from the shop to begin checkout.</p>`;
  } else {
    els.cartItems.innerHTML = cart.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) return "";
      return `
        <article class="cart-item">
          <img src="${product.image}" alt="${product.name}">
          <div>
            <strong>${product.name}</strong>
            <p class="text-slate-500">${product.category} · ${money.format(salePrice(product))}</p>
          </div>
          <div class="qty-control">
            <button type="button" data-minus="${product.id}">-</button>
            <strong>${item.qty}</strong>
            <button type="button" data-plus="${product.id}">+</button>
          </div>
        </article>
      `;
    }).join("");
  }
  els.cartItems.querySelectorAll("[data-minus]").forEach((button) => button.addEventListener("click", () => updateQty(button.dataset.minus, -1)));
  els.cartItems.querySelectorAll("[data-plus]").forEach((button) => button.addEventListener("click", () => updateQty(button.dataset.plus, 1)));
  renderPaymentFields();
  renderSummary();
}

function updateQty(id, delta) {
  const product = products.find((entry) => entry.id === id);
  const line = cart.find((entry) => entry.productId === id);
  if (!product || !line) return;
  line.qty += delta;
  if (line.qty <= 0) {
    cart = cart.filter((entry) => entry.productId !== id);
  } else if (line.qty > product.stock) {
    line.qty = product.stock;
    toast("You reached available stock.");
  }
  save(STORAGE.cart, cart);
  renderCheckout();
}

function renderPaymentFields() {
  const payment = getPaymentMethod();
  els.upiBox.classList.toggle("hidden", payment !== "UPI");
  els.cardBox.classList.toggle("hidden", payment !== "Card");
}

function applyCoupon() {
  const code = els.couponInput.value.trim().toUpperCase();
  if (!["UPI10", "NEXA50"].includes(code)) {
    appliedCoupon = "";
    toast("Use coupon UPI10 or NEXA50.");
  } else {
    appliedCoupon = code;
    toast(`${code} applied.`);
  }
  renderSummary();
}

function renderSummary() {
  const summary = getSummary();
  els.summaryLines.innerHTML = `
    <div><span>Subtotal</span><strong>${money.format(summary.subtotal)}</strong></div>
    <div><span>Delivery</span><strong>${money.format(summary.delivery)}</strong></div>
    <div><span>Platform fee</span><strong>${money.format(summary.platform)}</strong></div>
    <div><span>Coupon discount</span><strong>- ${money.format(summary.discount)}</strong></div>
    <div><span>COD fee</span><strong>${money.format(summary.codFee)}</strong></div>
    <div class="grand"><span>Total</span><strong>${money.format(summary.total)}</strong></div>
  `;
}

function getSummary() {
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return sum + (product ? salePrice(product) * item.qty : 0);
  }, 0);
  const delivery = subtotal > 0 ? DELIVERY_FEE : 0;
  const platform = subtotal > 0 ? PLATFORM_FEE : 0;
  const couponDiscount = appliedCoupon === "UPI10" ? Math.round(subtotal * 0.1) : appliedCoupon === "NEXA50" ? 50 : 0;
  const codFee = getPaymentMethod() === "COD" && subtotal > 0 ? COD_FEE : 0;
  const total = Math.max(0, subtotal + delivery + platform + codFee - couponDiscount);
  return { subtotal, delivery, platform, discount: couponDiscount, codFee, total };
}

function getPaymentMethod() {
  return document.querySelector("input[name='payment']:checked").value;
}

async function useLiveLocation() {
  if (!navigator.geolocation) {
    toast("Geolocation is not supported in this browser.");
    return;
  }
  toast("Requesting live location...");
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    let address = `Live location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.display_name) address = data.display_name;
    } catch {
      address += " (address lookup unavailable)";
    }
    els.addressInput.value = address;
    toast("Location added to checkout.");
  }, () => {
    toast("Location permission was denied.");
  });
}

function placeOrder() {
  if (!cart.length) {
    toast("Your cart is empty.");
    return;
  }
  if (!els.addressInput.value.trim()) {
    toast("Add a delivery address.");
    return;
  }

  const payment = getPaymentMethod();
  if (payment === "Card" && (!els.cardName.value.trim() || !els.cardNumber.value.trim() || !els.cardExpiry.value.trim() || !els.cardCvc.value.trim())) {
    toast("Enter complete card details.");
    return;
  }

  const summary = getSummary();
  const items = cart.map((entry) => {
    const product = products.find((item) => item.id === entry.productId);
    return {
      productId: product.id,
      name: product.name,
      qty: entry.qty,
      category: product.category,
      cost: product.cost,
      price: salePrice(product)
    };
  });

  items.forEach((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    product.stock = Math.max(0, product.stock - item.qty);
  });

  const status = payment === "COD" ? "COD Pending" : "Paid";
  const order = {
    id: `NEXA-${Date.now()}`,
    userId: session.id,
    customer: session.name,
    email: session.email,
    items,
    address: els.addressInput.value.trim(),
    payment,
    status,
    summary,
    coupon: appliedCoupon,
    createdAt: new Date().toISOString(),
    refundId: null
  };
  orders.unshift(order);
  cart = [];
  appliedCoupon = "";
  els.couponInput.value = "";
  els.addressInput.value = "";
  saveAll();
  renderCheckout();
  renderShop();
  showOrderPopup(order);
}

function showOrderPopup(order) {
  els.orderPopupContent.innerHTML = `
    <h2>Order Placed</h2>
    <p><strong>${order.id}</strong> is now ${order.status}. ${order.items.length} item group(s) will be delivered to your saved address.</p>
    <p>Total paid: <strong>${money.format(order.summary.total)}</strong></p>
  `;
  els.orderPopup.classList.remove("hidden");
}

function renderAdmin() {
  els.adminClock.textContent = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  renderKpis();
  renderAdminOverview();
  renderInventory();
  renderOrders();
}

function renderKpis() {
  const orderCount = orders.length;
  const activeCustomers = new Set(users.map((user) => user.email)).size;
  const productQuantity = products.reduce((sum, product) => sum + Number(product.stock), 0);
  const revenue = orders.filter((order) => order.status !== "Cancelled").reduce((sum, order) => sum + order.summary.total, 0);
  const cogs = orders.filter((order) => order.status !== "Cancelled").reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.cost * item.qty, 0);
  }, 0);
  const refundAmount = refunds.reduce((sum, refund) => sum + refund.amount, 0);
  const profitLoss = revenue - cogs - refundAmount;
  const kpis = [
    ["Order Count", orderCount],
    ["Active Customers", activeCustomers],
    ["Product Quantity", productQuantity],
    ["Profit/Loss", money.format(profitLoss)]
  ];
  els.kpiGrid.innerHTML = kpis.map(([label, value]) => `
    <article class="kpi-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `).join("");
}

function renderAdminOverview() {
  const paidOrders = orders.filter((order) => order.status === "Paid").length;
  const codPending = orders.filter((order) => order.status === "COD Pending").length;
  const inTransit = orders.filter((order) => ["Packed", "Shipped", "Out for Delivery"].includes(order.status)).length;
  const delivered = orders.filter((order) => order.status === "Delivered").length;
  const cancelled = orders.filter((order) => order.status === "Cancelled").length;
  const revenue = orders.filter((order) => order.status !== "Cancelled").reduce((sum, order) => sum + order.summary.total, 0);
  const refundAmount = refunds.reduce((sum, refund) => sum + refund.amount, 0);
  const avgOrder = orders.length ? Math.round(revenue / orders.length) : 0;
  const topCategory = getTopCategory();

  els.adminInsightGrid.innerHTML = [
    ["Revenue", money.format(revenue), "Completed and active order value"],
    ["Average Order Value", money.format(avgOrder), "Revenue divided by all orders"],
    ["Refund Liability", money.format(refundAmount), `${refunds.length} refund record(s)`],
    ["Top Category", topCategory, "Based on ordered item quantity"],
    ["Paid Orders", paidOrders, "Online payment completed"],
    ["COD Pending", codPending, "Cash collection pending"],
    ["In Transit", inTransit, "Packed, shipped, or out for delivery"],
    ["Delivered / Cancelled", `${delivered} / ${cancelled}`, "Final state tracking"]
  ].map(([label, value, note]) => `
    <article class="insight-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <em>${note}</em>
    </article>
  `).join("");

  const recentOrders = orders.slice(0, 5);
  els.recentOrderCount.textContent = `${recentOrders.length} recent`;
  els.adminRecentOrders.innerHTML = recentOrders.length ? recentOrders.map((order) => `
    <article class="recent-card">
      <strong>${order.id}</strong>
      <span>${order.customer} · ${order.payment} · ${order.items.length} item group(s)</span>
      <em>${order.status} · ${money.format(order.summary.total)}</em>
    </article>
  `).join("") : `<p class="text-slate-500">No orders yet.</p>`;

  const lowStock = [...products].filter((product) => product.stock <= 20).sort((a, b) => a.stock - b.stock).slice(0, 6);
  els.lowStockCount.textContent = `${lowStock.length} items`;
  els.lowStockList.innerHTML = lowStock.length ? lowStock.map((product) => `
    <article class="recent-card">
      <strong>${product.name}</strong>
      <span>${product.category} · Selling ${money.format(salePrice(product))}</span>
      <em>${product.stock} left in stock</em>
    </article>
  `).join("") : `<p class="text-slate-500">All products have healthy stock.</p>`;
}

function getTopCategory() {
  const counts = orders.reduce((result, order) => {
    order.items.forEach((item) => {
      result[item.category] = (result[item.category] || 0) + item.qty;
    });
    return result;
  }, {});
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0] ? `${sorted[0][0]} (${sorted[0][1]})` : "No sales yet";
}

function renderOrders() {
  if (!orders.length) {
    els.ordersTable.innerHTML = `<tr><td colspan="6">No orders yet.</td></tr>`;
    return;
  }
  els.ordersTable.innerHTML = orders.map((order) => {
    const refund = refunds.find((item) => item.orderId === order.id);
    return `
      <tr>
        <td><strong>${order.id}</strong><br><span class="text-slate-500">${new Date(order.createdAt).toLocaleString("en-IN")}</span></td>
        <td>${order.customer}<br><span class="text-slate-500">${order.email}</span><br><span class="text-slate-500">${order.address}</span></td>
        <td>${order.items.map((item) => `${item.name} x ${item.qty}`).join("<br>")}</td>
        <td>${money.format(order.summary.total)}<br><span class="text-slate-500">${order.payment}</span></td>
        <td>
          <select data-status="${order.id}">
            ${statusOptions.map((status) => `<option value="${status}" ${order.status === status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </td>
        <td>${refund ? refundMarkup(refund) : "<span class='text-slate-500'>No refund</span>"}</td>
      </tr>
    `;
  }).join("");

  els.ordersTable.querySelectorAll("[data-status]").forEach((select) => {
    select.addEventListener("change", () => updateOrderStatus(select.dataset.status, select.value));
  });
}

function renderInventory() {
  const query = els.inventorySearch.value.trim().toLowerCase();
  const list = products.filter((product) => {
    return !query || product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
  });
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const costValue = products.reduce((sum, product) => sum + product.cost * product.stock, 0);
  const retailValue = products.reduce((sum, product) => sum + salePrice(product) * product.stock, 0);
  const lowStock = products.filter((product) => product.stock <= 20).length;
  const outOfStock = products.filter((product) => product.stock === 0).length;

  els.inventorySummary.innerHTML = [
    ["Total Products", products.length],
    ["Total Stock Units", totalStock],
    ["Cost Value", money.format(costValue)],
    ["Retail Value", money.format(retailValue)],
    ["Low Stock", lowStock],
    ["Out of Stock", outOfStock]
  ].map(([label, value]) => `
    <article class="mini-stat">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `).join("");

  if (!list.length) {
    els.inventoryTable.innerHTML = `<tr><td colspan="9">No inventory products found.</td></tr>`;
    return;
  }

  els.inventoryTable.innerHTML = list.map((product) => {
    const currentPrice = salePrice(product);
    const inventoryValue = currentPrice * product.stock;
    const status = getStockStatus(product.stock);
    return `
      <tr>
        <td>
          <div class="inventory-product">
            <img src="${product.image}" alt="${product.name}">
            <div>
              <strong>${product.name}</strong>
              <span>${product.adminAdded ? "Admin added" : "Seed product"}</span>
            </div>
          </div>
        </td>
        <td>${product.category}</td>
        <td><strong>${product.stock}</strong></td>
        <td>${money.format(product.cost)}</td>
        <td>${money.format(product.price)}</td>
        <td>${product.discount}%</td>
        <td>${money.format(currentPrice)}</td>
        <td>${money.format(inventoryValue)}</td>
        <td><span class="stock-pill ${status.className}">${status.label}</span></td>
      </tr>
    `;
  }).join("");
}

function getStockStatus(stock) {
  if (stock === 0) return { label: "Out of Stock", className: "danger" };
  if (stock <= 10) return { label: "Critical", className: "danger" };
  if (stock <= 20) return { label: "Low Stock", className: "warning" };
  return { label: "Healthy", className: "good" };
}

function refundMarkup(refund) {
  return `
    <div class="refund-box">
      <strong>${refund.status}</strong>
      <span>${refund.id}</span>
      <span>${money.format(refund.amount)}</span>
      <span>${new Date(refund.initiatedAt).toLocaleString("en-IN")}</span>
    </div>
  `;
}

function updateOrderStatus(orderId, status) {
  const order = orders.find((item) => item.id === orderId);
  if (!order) return;
  order.status = status;
  if (status === "Cancelled" && !refunds.some((refund) => refund.orderId === orderId)) {
    const refund = {
      id: `RFND-${Date.now()}`,
      orderId,
      status: "Refund Initiated",
      amount: order.summary.total,
      initiatedAt: new Date().toISOString()
    };
    refunds.unshift(refund);
    order.refundId = refund.id;
    toast("Order cancelled and refund initiated.");
  } else {
    toast(`Order status changed to ${status}.`);
  }
  saveAll();
  renderAdmin();
}

function addProduct(event) {
  event.preventDefault();
  const product = {
    id: `NEXA-P-${Date.now()}`,
    name: els.newName.value.trim(),
    category: els.newCategory.value,
    cost: Number(els.newCost.value),
    price: Number(els.newPrice.value),
    discount: Number(els.newDiscount.value),
    stock: Number(els.newStock.value),
    image: els.newImage.value.trim(),
    description: els.newDescription.value.trim(),
    createdAt: new Date().toISOString(),
    adminAdded: true
  };
  products.unshift(product);
  save(STORAGE.products, products);
  els.productForm.reset();
  renderAdmin();
  toast("Product added and visible in storefront.");
}

function salePrice(product) {
  return Math.round(product.price * (1 - product.discount / 100));
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function logout() {
  session = null;
  save(STORAGE.session, null);
  showRoleView();
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => els.toast.classList.add("hidden"), 2600);
}

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  if (value === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

function saveAll() {
  save(STORAGE.users, users);
  save(STORAGE.products, products);
  save(STORAGE.cart, cart);
  save(STORAGE.orders, orders);
  save(STORAGE.refunds, refunds);
  save(STORAGE.statuses, orders.map((order) => ({ orderId: order.id, status: order.status })));
}

function seedProducts() {
  const now = Date.now();
  return [
    {
      id: "E-001",
      name: "NEXA AeroBuds Pro",
      category: "Electronics",
      cost: 1299,
      price: 2499,
      discount: 24,
      stock: 38,
      image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=700&q=80",
      description: "Wireless earbuds with punchy sound, compact charging case, and all-day comfort.",
      createdAt: new Date(now - 19 * 86400000).toISOString()
    },
    {
      id: "E-002",
      name: "Nova Smart Watch",
      category: "Electronics",
      cost: 1999,
      price: 3999,
      discount: 30,
      stock: 24,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
      description: "A sleek smartwatch for notifications, activity tracking, and everyday style.",
      createdAt: new Date(now - 18 * 86400000).toISOString()
    },
    {
      id: "E-003",
      name: "Pulse Bluetooth Speaker",
      category: "Electronics",
      cost: 899,
      price: 1899,
      discount: 18,
      stock: 45,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=80",
      description: "Portable Bluetooth speaker with deep bass and splash-resistant build.",
      createdAt: new Date(now - 17 * 86400000).toISOString()
    },
    {
      id: "E-004",
      name: "Orbit Wireless Mouse",
      category: "Electronics",
      cost: 399,
      price: 899,
      discount: 22,
      stock: 64,
      image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=700&q=80",
      description: "Lightweight wireless mouse with silent clicks and ergonomic grip.",
      createdAt: new Date(now - 16 * 86400000).toISOString()
    },
    {
      id: "E-005",
      name: "Volt Fast Charger 65W",
      category: "Electronics",
      cost: 699,
      price: 1499,
      discount: 16,
      stock: 58,
      image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=700&q=80",
      description: "Compact fast charger for phones, tablets, and USB-C laptops.",
      createdAt: new Date(now - 15 * 86400000).toISOString()
    },
    {
      id: "E-006",
      name: "Studio Mechanical Keyboard",
      category: "Electronics",
      cost: 2199,
      price: 4499,
      discount: 28,
      stock: 21,
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80",
      description: "Tactile mechanical keyboard with clean desk aesthetics and durable switches.",
      createdAt: new Date(now - 10 * 86400000).toISOString()
    },
    {
      id: "E-007",
      name: "Vision HD Webcam",
      category: "Electronics",
      cost: 1099,
      price: 2299,
      discount: 20,
      stock: 33,
      image: "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?auto=format&fit=crop&w=700&q=80",
      description: "HD webcam for video calls, classes, and streaming setups.",
      createdAt: new Date(now - 9 * 86400000).toISOString()
    },
    {
      id: "E-008",
      name: "CineView Tablet",
      category: "Electronics",
      cost: 7999,
      price: 12999,
      discount: 12,
      stock: 18,
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=700&q=80",
      description: "Slim tablet for streaming, browsing, notes, and casual work.",
      createdAt: new Date(now - 8 * 86400000).toISOString()
    },
    {
      id: "E-009",
      name: "Arc USB-C Hub",
      category: "Electronics",
      cost: 799,
      price: 1699,
      discount: 26,
      stock: 42,
      image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=700&q=80",
      description: "Multi-port USB-C hub with HDMI, USB, and card reader support.",
      createdAt: new Date(now - 3 * 86400000).toISOString()
    },
    {
      id: "E-010",
      name: "Lumen Desk Lamp",
      category: "Electronics",
      cost: 849,
      price: 1799,
      discount: 25,
      stock: 39,
      image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80",
      description: "LED desk lamp with adjustable brightness for focused workspaces.",
      createdAt: new Date(now - 2 * 86400000).toISOString()
    },
    {
      id: "H-001",
      name: "CloudSoft Bedsheet Set",
      category: "Home",
      cost: 799,
      price: 1599,
      discount: 35,
      stock: 52,
      image: "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=700&q=80",
      description: "Soft cotton bedsheet set for calm bedrooms and everyday comfort.",
      createdAt: new Date(now - 14 * 86400000).toISOString()
    },
    {
      id: "H-002",
      name: "Nordic Wall Shelf",
      category: "Home",
      cost: 599,
      price: 1299,
      discount: 18,
      stock: 29,
      image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=700&q=80",
      description: "Minimal wall shelf for books, plants, and living room styling.",
      createdAt: new Date(now - 13 * 86400000).toISOString()
    },
    {
      id: "H-003",
      name: "Serene Ceramic Dinner Set",
      category: "Home",
      cost: 1399,
      price: 2899,
      discount: 22,
      stock: 20,
      image: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=700&q=80",
      description: "Elegant ceramic dinnerware set for daily meals and special hosting.",
      createdAt: new Date(now - 12 * 86400000).toISOString()
    },
    {
      id: "H-004",
      name: "Aroma Glass Candle Duo",
      category: "Home",
      cost: 349,
      price: 799,
      discount: 15,
      stock: 61,
      image: "https://images.unsplash.com/photo-1602874801006-e26ad8f4b9c0?auto=format&fit=crop&w=700&q=80",
      description: "Scented candle pair for warm lighting and relaxed evenings.",
      createdAt: new Date(now - 11 * 86400000).toISOString()
    },
    {
      id: "H-005",
      name: "Bamboo Storage Basket",
      category: "Home",
      cost: 449,
      price: 999,
      discount: 20,
      stock: 46,
      image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=700&q=80",
      description: "Natural storage basket for laundry, toys, blankets, and shelves.",
      createdAt: new Date(now - 7 * 86400000).toISOString()
    },
    {
      id: "H-006",
      name: "Comfy Cushion Pack",
      category: "Home",
      cost: 499,
      price: 1199,
      discount: 27,
      stock: 55,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=700&q=80",
      description: "Decorative cushion pack that adds quick comfort to sofas and chairs.",
      createdAt: new Date(now - 6 * 86400000).toISOString()
    },
    {
      id: "H-007",
      name: "FreshFold Towel Set",
      category: "Home",
      cost: 699,
      price: 1499,
      discount: 24,
      stock: 44,
      image: "https://images.unsplash.com/photo-1600369671738-fa3a43efecfd?auto=format&fit=crop&w=700&q=80",
      description: "Absorbent towel set with a plush feel for everyday bathroom use.",
      createdAt: new Date(now - 5 * 86400000).toISOString()
    },
    {
      id: "H-008",
      name: "Oak Coffee Table",
      category: "Home",
      cost: 3599,
      price: 6999,
      discount: 14,
      stock: 12,
      image: "https://images.unsplash.com/photo-1532372320572-cda25653a694?auto=format&fit=crop&w=700&q=80",
      description: "Warm oak-inspired coffee table for compact living rooms.",
      createdAt: new Date(now - 4 * 86400000).toISOString()
    },
    {
      id: "H-009",
      name: "QuietCare Air Purifier",
      category: "Home",
      cost: 4499,
      price: 8999,
      discount: 19,
      stock: 16,
      image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=700&q=80",
      description: "Compact air purifier for bedrooms and workspaces.",
      createdAt: new Date(now - 1 * 86400000).toISOString()
    },
    {
      id: "H-010",
      name: "MintPlanter Ceramic Set",
      category: "Home",
      cost: 399,
      price: 899,
      discount: 21,
      stock: 48,
      image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=700&q=80",
      description: "Ceramic planter set for desks, balconies, and sunny corners.",
      createdAt: new Date(now).toISOString()
    }
  ];
}

setInterval(() => {
  heroIndex = (heroIndex + 1) % 3;
  if (!els.storeView.classList.contains("hidden") && currentPage === "home") renderHero();
}, 5000);

setInterval(() => {
  reviewIndex = (reviewIndex + 1) % 3;
  if (!els.storeView.classList.contains("hidden") && currentPage === "home") renderReviews();
}, 4200);
