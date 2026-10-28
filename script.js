'use strict';

const cart = [];
const WHATSAPP_NUMBER = '6285156009931'; // Format: kode negara 62, tanpa tanda +.

const formatRupiah = (amount) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
}).format(amount);

const cartModal = document.getElementById('cart-modal');
const checkoutModal = document.getElementById('checkout-modal');
const cartItems = document.getElementById('cart-items');
const checkoutButton = document.getElementById('btn-show-checkout');
let lastFocusedElement;
let toastTimer;

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2400);
}

function openModal(modal) {
  lastFocusedElement = document.activeElement;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  modal.querySelector('.close-modal').focus();
}

function closeModal(modal) {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');

  if (!document.querySelector('.modal.active')) {
    document.body.classList.remove('modal-open');
    lastFocusedElement?.focus();
  }
}

function addProduct(name, price) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }

  renderCart();
}

function changeQuantity(index, amount) {
  if (!cart[index]) return;

  cart[index].qty += amount;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  renderCart();
}

function createCartItem(item, index) {
  const row = document.createElement('article');
  row.className = 'cart-item';

  const info = document.createElement('div');
  info.className = 'cart-item-info';

  const title = document.createElement('h3');
  title.textContent = item.name;

  const price = document.createElement('span');
  price.className = 'cart-item-price';
  price.textContent = formatRupiah(item.price) + ' / cup';
  info.append(title, price);

  const controls = document.createElement('div');
  controls.className = 'cart-controls';

  const minus = document.createElement('button');
  minus.type = 'button';
  minus.textContent = '−';
  minus.setAttribute('aria-label', 'Kurangi ' + item.name);
  minus.addEventListener('click', () => changeQuantity(index, -1));

  const quantity = document.createElement('span');
  quantity.textContent = item.qty;

  const plus = document.createElement('button');
  plus.type = 'button';
  plus.textContent = '+';
  plus.setAttribute('aria-label', 'Tambah ' + item.name);
  plus.addEventListener('click', () => changeQuantity(index, 1));

  controls.append(minus, quantity, plus);
  row.append(info, controls);
  return row;
}

function renderCart() {
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  document.getElementById('cart-badge').textContent = itemCount;
  document.getElementById('total-price').textContent = formatRupiah(total);
  checkoutButton.classList.toggle('hidden', cart.length === 0);

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Keranjangmu masih kosong. Yuk, pilih yang manis-manis!</p>';
    return;
  }

  cartItems.replaceChildren(...cart.map(createCartItem));
}

function renderCheckoutSummary() {
  const summary = document.getElementById('checkout-summary-list');
  const rows = cart.map((item) => {
    const row = document.createElement('div');
    row.className = 'summary-item';

    const label = document.createElement('span');
    label.textContent = item.qty + ' × ' + item.name;

    const amount = document.createElement('strong');
    amount.textContent = formatRupiah(item.qty * item.price);

    row.append(label, amount);
    return row;
  });

  summary.replaceChildren(...rows);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById('checkout-total-price').textContent = formatRupiah(total);
}

document.querySelectorAll('.add-to-cart').forEach((button) => {
  button.addEventListener('click', () => {
    addProduct(button.dataset.name, Number(button.dataset.price));
    showToast(button.dataset.name + ' masuk ke keranjang');
  });
});

document.querySelectorAll('.buy-now').forEach((button) => {
  button.addEventListener('click', () => {
    cart.splice(0, cart.length);
    addProduct(button.dataset.name, Number(button.dataset.price));
    renderCheckoutSummary();
    openModal(checkoutModal);
  });
});

document.getElementById('nav-cart-btn').addEventListener('click', () => openModal(cartModal));
document.getElementById('close-cart').addEventListener('click', () => closeModal(cartModal));
document.getElementById('close-checkout').addEventListener('click', () => closeModal(checkoutModal));

checkoutButton.addEventListener('click', () => {
  closeModal(cartModal);
  renderCheckoutSummary();
  openModal(checkoutModal);
});

[cartModal, checkoutModal].forEach((modal) => {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal(modal);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const activeModal = document.querySelector('.modal.active');
  if (activeModal) closeModal(activeModal);
});

const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');

menuToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi');
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Buka menu navigasi');
  });
});

window.matchMedia('(min-width: 1025px)').addEventListener('change', (event) => {
  if (!event.matches) return;
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Buka menu navigasi');
});

const header = document.querySelector('.site-header');
const updateHeaderOnScroll = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 12);
};

updateHeaderOnScroll();
window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealTargets = document.querySelectorAll(
    '.story-content, .menu-heading, .product-card, .menu-footnote, .order-heading, .order-step, .closing-cta'
  );

  document.documentElement.classList.add('motion-ready');
  revealTargets.forEach((element) => element.classList.add('scroll-reveal'));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.14,
    rootMargin: '0px 0px -35px 0px'
  });

  revealTargets.forEach((element) => revealObserver.observe(element));
}

document.getElementById('checkout-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (cart.length === 0) return;

  const name = document.getElementById('nama').value.trim();
  const address = document.getElementById('alamat').value.trim();
  const notes = document.getElementById('catatan').value.trim();
  const payment = document.getElementById('pembayaran').value;
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const orderLines = cart.map((item) => {
    const subtotal = formatRupiah(item.price * item.qty);
    return '• ' + item.qty + 'x ' + item.name + ' (' + subtotal + ')';
  });
  const paymentLabel = payment === 'QRIS'
    ? 'QRIS (mohon kirimkan barcode)'
    : 'COD / bayar tunai';

  const message = [
    'Halo Admin *StupReamy (Stup Creamy)*! 👋',
    '',
    'Saya mau pesan:',
    ...orderLines,
    '',
    '*Total:* ' + formatRupiah(total),
    '*Nama:* ' + name,
    '*Alamat / titik COD:* ' + address,
    '*Pembayaran:* ' + paymentLabel,
    '*Catatan:* ' + (notes || 'Tidak ada'),
    '',
    'Mohon konfirmasi pesanan saya ya. Terima kasih! ✨'
  ].join('\n');

  const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
  window.open(url, '_blank', 'noopener,noreferrer');
  closeModal(checkoutModal);
  cart.splice(0, cart.length);
  renderCart();
  event.currentTarget.reset();
});


renderCart();