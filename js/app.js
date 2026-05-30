// === State ===
let products = [];
let cart = JSON.parse(localStorage.getItem('td_cart') || '[]');

// === DOM Refs ===
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const productsGrid = $('#productsGrid');
const loadingText = $('#loadingText');
const cartDrawer = $('#cartDrawer');
const cartOverlay = $('#cartOverlay');
const cartItems = $('#cartItems');
const cartFooter = $('#cartFooter');
const cartTotal = $('#cartTotal');
const cartBadge = $('#cartBadge');
const cartIcon = $('#cartIcon');
const cartClose = $('#cartClose');
const modal = $('#productModal');
const modalBody = $('#modalBody');
const modalClose = $('#modalClose');
const menuToggle = $('#menuToggle');
const mobileMenu = $('#mobileMenu');
const trendingCarousel = $('#trendingCarousel');
const reviewsGrid = $('#reviewsGrid');
const newsletterForm = $('#newsletterForm');
const newsletterEmail = $('#newsletterEmail');
const newsletterSuccess = $('#newsletterSuccess');
const newsletterFormEl = document.getElementById('newsletterForm');

// === Review Data ===
const reviews = [
  { name: 'Sarah M.', product: 'Unbrush Detangling Hair Brush', text: 'This brush is LIFE-CHANGING. My daughter has thick curly hair and for the first time ever — no tears. Absolutely worth every penny!', stars: 5, avatar: 'SM' },
  { name: 'James K.', product: 'Govee RGBIC LED Strip Lights', text: 'Setup took 5 minutes. The app control is amazing — I can change colors from my couch. My gaming room looks like a pro streamer setup now.', stars: 5, avatar: 'JK' },
  { name: 'Mia T.', product: 'Portable Neck Fan', text: 'Bought this for a trip to Thailand and it was a lifesaver. Battery lasted all day. My friends all ordered one after seeing mine.', stars: 5, avatar: 'MT' },
  { name: 'Alex R.', product: 'Sunset Lamp Projector', text: 'The sunset vibes are unreal. My room looks like a beach sunset every evening. Best $6 I ever spent on decor.', stars: 4, avatar: 'AR' },
  { name: 'Priya D.', product: 'Weighted Stuffed Animal', text: 'Got this for my anxiety and honestly it helps so much. The weight is perfect — not too heavy, not too light. So cute too!', stars: 5, avatar: 'PD' },
  { name: 'Chris L.', product: 'Automatic Electric Jar Opener', text: 'My mom has arthritis and this has been a game-changer for her kitchen. She can open anything now. Great quality.', stars: 4, avatar: 'CL' }
];

// === Init ===
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('data/products.json');
    if (!res.ok) throw new Error('Failed');
    products = await res.json();
    renderProducts(products);
    renderTrendingCarousel(products);
    renderReviews(reviews);
    loadingText.textContent = `🎯 ${products.length} trending products found`;
  } catch (err) {
    productsGrid.innerHTML = `<div style="text-align:center;padding:60px 20px;color:rgba(255,255,255,0.4)">
      <p style="font-size:2rem;margin-bottom:16px">😕</p>
      <p>Couldn't load products. Try refreshing.</p>
    </div>`;
    loadingText.textContent = 'Failed to load products';
  }
  updateCartUI();
  setupNewsletter();
});

// === Trending Carousel ===
function renderTrendingCarousel(prods) {
  trendingCarousel.innerHTML = prods.map((p, i) => `
    <button class="trending-chip" data-id="${p.id}" onclick="scrollToProducts(event)">
      <span class="trending-chip-rank">#${i + 1}</span>
      <span class="trending-chip-name">${esc(p.name)}</span>
      <span class="trending-chip-price">$${p.price.toFixed(2)}</span>
    </button>
  `).join('');
}

// Make scrollToProducts globally accessible
window.scrollToProducts = function(e) {
  const id = e.currentTarget.dataset.id;
  // Scroll to products section
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  // Open the product modal after a short delay
  setTimeout(() => openModal(id), 500);
};

// === Reviews ===
function renderReviews(reviews) {
  reviewsGrid.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
      <p class="review-text">"${esc(r.text)}"</p>
      <div class="review-author">
        <div class="review-avatar">${esc(r.avatar)}</div>
        <div>
          <div class="review-name">${esc(r.name)}</div>
          <div class="review-product">${esc(r.product)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// === Newsletter ===
function setupNewsletter() {
  const subscribed = localStorage.getItem('td_newsletter');
  if (subscribed === 'true') {
    newsletterFormEl.style.display = 'none';
    newsletterSuccess.style.display = 'block';
    newsletterSuccess.querySelector('.newsletter-success-text').textContent = "You're already subscribed! 🎉";
    return;
  }

  newsletterFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterEmail.value.trim();
    if (!email) return;

    // Store subscription
    localStorage.setItem('td_newsletter', 'true');
    localStorage.setItem('td_newsletter_email', email);

    // Show success
    newsletterFormEl.style.display = 'none';
    newsletterSuccess.style.display = 'block';
  });
}

// === Render Products ===
function renderProducts(prods) {
  // Shuffle for visual variety
  const shuffled = [...prods].sort(() => Math.random() - 0.5);

  productsGrid.innerHTML = shuffled.map((p, i) => {
    const savePercent = p.tiktok_price ? Math.round((1 - p.price / p.tiktok_price) * 100) : 0;
    const imgSrc = `https://picsum.photos/seed/${p.id}/600/400`;

    return `<div class="product-card" data-id="${p.id}">
      <div class="product-image-wrap">
        <img class="product-image" src="${imgSrc}" alt="${esc(p.name)}" loading="lazy" />
        ${p.badge ? `<span class="product-badge">${esc(p.badge)}</span>` : ''}
      </div>
      <div class="product-info">
        <h3 class="product-title">${esc(p.name)}</h3>
        ${savePercent > 0 ? `<span class="product-save-badge">Save ${savePercent}% vs TikTok</span>` : ''}
        <div class="product-price-row">
          <span class="product-price">$${p.price.toFixed(2)}</span>
          ${p.tiktok_price ? `<span class="product-tiktok-price">$${p.tiktok_price.toFixed(2)}</span>` : ''}
        </div>
        <p class="product-supplier">✈ Ships from ${esc(p.supplier)} • ${p.delivery}</p>
        <button class="product-buy-btn" data-id="${p.id}">Buy Now →</button>
      </div>
    </div>`;
  }).join('');

  // Product card click -> modal
  productsGrid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.product-buy-btn')) return;
      openModal(card.dataset.id);
    });
  });

  // Buy buttons -> cart + checkout
  productsGrid.querySelectorAll('.product-buy-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      addToCart(btn.dataset.id);
    });
  });
}

// === Product Modal ===
function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  const savePercent = p.tiktok_price ? Math.round((1 - p.price / p.tiktok_price) * 100) : 0;
  const imgSrc = `https://picsum.photos/seed/${p.id}/600/400`;
  const productReviews = reviews.filter(r => r.product.toLowerCase().includes(p.name.split(' ')[0].toLowerCase()));

  let reviewsHtml = '';
  if (productReviews.length > 0) {
    reviewsHtml = `<div style="margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06)">
      <p style="font-size:0.85rem;color:rgba(255,255,255,0.4);margin-bottom:12px">⭐ Customer Reviews</p>
      ${productReviews.slice(0, 2).map(r => `
        <div style="margin-bottom:12px">
          <div style="color:#ffd93d;font-size:0.85rem">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
          <p style="font-size:0.85rem;color:rgba(255,255,255,0.55);font-style:italic;margin:4px 0">"${esc(r.text)}"</p>
          <p style="font-size:0.75rem;color:rgba(255,255,255,0.3)">— ${esc(r.name)}</p>
        </div>
      `).join('')}
    </div>`;
  }

  modalBody.innerHTML = `
    <img class="modal-product-img" src="${imgSrc}" alt="${esc(p.name)}" />
    <h2 class="modal-product-name">${esc(p.name)}</h2>
    <div class="modal-product-price">$${p.price.toFixed(2)}</div>
    ${p.tiktok_price ? `<div class="modal-product-tiktok">TikTok price: $${p.tiktok_price.toFixed(2)} ${savePercent > 0 ? `• Save ${savePercent}%` : ''}</div>` : ''}
    <p class="modal-product-desc">${esc(p.description)}</p>
    <div class="modal-product-supplier">
      Ships from <span>${esc(p.supplier)}</span> • Estimated delivery: <span>${p.delivery}</span>
    </div>
    ${reviewsHtml}
    <button class="modal-buy-btn" data-id="${p.id}" style="margin-top:16px">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      Buy Now — $${p.price.toFixed(2)}
    </button>
  `;

  modalBody.querySelector('.modal-buy-btn').addEventListener('click', () => {
    addToCart(id);
    modal.classList.remove('active');
  });

  modal.classList.add('active');
}

modalClose.addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('active'); });

// === Cart ===
function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  const existing = cart.find(item => item.id === id);
  if (existing) { existing.qty += 1; }
  else { cart.push({ id, qty: 1 }); }

  saveCart();
  updateCartUI();

  // Visual feedback
  const btn = document.querySelector(`.product-buy-btn[data-id="${id}"]`);
  if (btn) {
    btn.textContent = '✓ Added!';
    btn.style.background = 'linear-gradient(135deg, #4ECDC4, #3dbdb5)';
    setTimeout(() => {
      btn.textContent = 'Buy Now →';
      btn.style.background = '';
    }, 1200);
  }

  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartUI();
}

function saveCart() { localStorage.setItem('td_cart', JSON.stringify(cart)); }

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const p = products.find(x => x.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function getCartCount() { return cart.reduce((sum, item) => sum + item.qty, 0); }

function updateCartUI() {
  const count = getCartCount();
  cartBadge.textContent = count;
  cartBadge.style.display = count > 0 ? 'flex' : 'none';
  const mobileCount = document.getElementById('mobileCartCount');
  if (mobileCount) mobileCount.textContent = count;
  renderCartItems();
}

function renderCartItems() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
    cartFooter.style.display = 'none';
    return;
  }

  cartFooter.style.display = 'block';
  const total = getCartTotal();

  cartItems.innerHTML = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return '';
    return `<div class="cart-item">
      <img class="cart-item-img" src="https://picsum.photos/seed/${p.id}/600/400" alt="${esc(p.name)}" />
      <div class="cart-item-info">
        <div class="cart-item-title">${esc(p.name)}</div>
        <div class="cart-item-price">$${(p.price * item.qty).toFixed(2)}</div>
        <button class="cart-item-remove" data-id="${p.id}">Remove</button>
      </div>
    </div>`;
  }).join('');

  cartTotal.textContent = `$${total.toFixed(2)}`;

  cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });

  // Checkout button opens AliExpress for each item
  const checkoutBtn = document.getElementById('checkoutBtn');
  checkoutBtn.onclick = () => {
    if (cart.length === 0) return;
    // Open all unique AliExpress URLs in new tabs
    const urls = [...new Set(cart.map(item => {
      const p = products.find(x => x.id === item.id);
      return p ? p.aliexpress_url : null;
    }).filter(Boolean))];
    urls.forEach(url => window.open(url, '_blank'));
    // Clear cart
    cart = [];
    saveCart();
    updateCartUI();
    closeCart();
  };
}

// === Cart Drawer ===
cartIcon.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
const mobileCartBtn = document.getElementById('mobileCartBtn');
if (mobileCartBtn) {
  mobileCartBtn.addEventListener('click', () => { mobileMenu.classList.remove('active'); openCart(); });
}

function openCart() {
  cartDrawer.classList.add('active');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('active');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

// === Mobile Menu ===
menuToggle.addEventListener('click', () => mobileMenu.classList.toggle('active'));
document.querySelectorAll('.mobile-link').forEach(l => {
  l.addEventListener('click', () => mobileMenu.classList.remove('active'));
});

// === Helpers ===
function esc(text) {
  if (!text) return '';
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}