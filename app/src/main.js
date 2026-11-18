import { Capacitor } from '@capacitor/core';
import { PRODUCTS } from './domain/products.js';
import {
  addProduct, calculateItemCount, calculateTotal, clearCart,
  processPayment, removeProduct
} from './domain/cashier.js';
import { createReceipt } from './domain/receipt.js';
import { formatRupiah } from './domain/format.js';

const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '1.0.0';
const BUILD_ID = globalThis.KASIR_APP_CONFIG?.buildId ?? APP_VERSION;
const CART_STORAGE_KEY = 'kasir-alfamidi-cart-v1';
const INITIAL_RECEIPT = [
  '       ALFAMIDI MINI MARKET',
  '     SISTEM KASIR SEDERHANA',
  '--------------------------------',
  ' Silakan masukkan barang belanja',
  '--------------------------------',
  ''
].join('\n');

const elements = {
  productSelect: document.querySelector('#product-select'),
  quantityInput: document.querySelector('#quantity-input'),
  addForm: document.querySelector('#add-form'),
  cartBody: document.querySelector('#cart-body'),
  cartEmpty: document.querySelector('#cart-empty'),
  cartCount: document.querySelector('#cart-count'),
  cartHint: document.querySelector('#cart-hint'),
  summaryItems: document.querySelector('#summary-items'),
  clearCart: document.querySelector('#clear-cart'),
  totalAmount: document.querySelector('#total-amount'),
  totalItemsLabel: document.querySelector('#total-items-label'),
  paymentInput: document.querySelector('#payment-input'),
  changeAmount: document.querySelector('#change-amount'),
  payButton: document.querySelector('#pay-button'),
  receiptContent: document.querySelector('#receipt-content'),
  receiptStatus: document.querySelector('#receipt-status'),
  toast: document.querySelector('#toast'),
  connectionDot: document.querySelector('#connection-dot'),
  connectionLabel: document.querySelector('#connection-label'),
  todayLabel: document.querySelector('#today-label'),
  appVersion: document.querySelector('#app-version'),
  footerVersion: document.querySelector('#footer-version'),
  apkDownload: document.querySelector('#apk-download')
};

const state = {
  cart: readSavedCart(),
  payment: '',
  change: 0,
  receipt: INITIAL_RECEIPT,
  paid: false,
  toastTimer: null
};

function readSavedCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) => {
      const product = PRODUCTS.find((candidate) => candidate.code === item.code);
      return product && Number.isSafeInteger(item.quantity) && item.quantity > 0;
    }).map((item) => {
      const product = PRODUCTS.find((candidate) => candidate.code === item.code);
      return { ...product, quantity: item.quantity, subtotal: product.price * item.quantity };
    });
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart.map(({ code, quantity }) => ({ code, quantity }))));
  } catch (error) {
    console.warn('Keranjang tidak dapat disimpan di perangkat ini:', error);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function renderProducts() {
  elements.productSelect.innerHTML = PRODUCTS.map((product) =>
    `<option value="${product.code}">${product.code} — ${escapeHtml(product.name)} — ${formatRupiah(product.price)}</option>`
  ).join('');
}

function renderCart() {
  const total = calculateTotal(state.cart);
  const itemCount = calculateItemCount(state.cart);
  elements.cartBody.innerHTML = state.cart.map((item) => `
    <tr>
      <td data-label="Produk"><span class="product-code">${item.code}</span><strong>${escapeHtml(item.name)}</strong></td>
      <td data-label="Harga">${formatRupiah(item.price)}</td>
      <td data-label="Qty"><span class="quantity-badge">${item.quantity}</span></td>
      <td data-label="Subtotal" class="subtotal-cell">${formatRupiah(item.subtotal)}</td>
      <td class="row-action"><button type="button" class="remove-button" data-remove="${item.code}" aria-label="Hapus ${escapeHtml(item.name)}">×</button></td>
    </tr>
  `).join('');

  elements.cartEmpty.hidden = state.cart.length > 0;
  elements.cartBody.closest('table').hidden = state.cart.length === 0;
  elements.cartCount.textContent = `${itemCount} item`;
  elements.cartHint.textContent = `${itemCount} barang dalam transaksi`;
  elements.summaryItems.textContent = state.cart.length;
  elements.totalAmount.textContent = formatRupiah(total);
  elements.totalItemsLabel.textContent = `${itemCount} barang · ${state.cart.length} jenis produk`;
  elements.clearCart.disabled = state.cart.length === 0;
  elements.payButton.disabled = state.cart.length === 0;
}

function renderPayment() {
  elements.changeAmount.textContent = formatRupiah(state.change);
  elements.receiptStatus.textContent = state.paid ? 'Pembayaran berhasil · struk berhasil dibuat' : 'Struk tersedia setelah pembayaran';
  elements.receiptContent.textContent = state.receipt;
}

function invalidatePayment() {
  state.paid = false;
  state.change = 0;
  state.receipt = INITIAL_RECEIPT;
  renderPayment();
}

function showToast(message, type = 'info') {
  elements.toast.textContent = message;
  elements.toast.dataset.type = type;
  elements.toast.classList.add('is-visible');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => elements.toast.classList.remove('is-visible'), 3200);
}

function refreshNetworkStatus() {
  const online = navigator.onLine;
  elements.connectionDot.classList.toggle('is-offline', !online);
  elements.connectionLabel.textContent = online ? 'Online · Offline siap' : 'Offline · Mode lokal';
}

function configureDownloadLink() {
  const config = globalThis.KASIR_APP_CONFIG ?? {};
  const repository = config.repository ?? '';
  const releaseTag = config.releaseTag ?? 'prototype-latest';
  const validRepository = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository);
  const validReleaseTag = /^[A-Za-z0-9_.-]+$/.test(releaseTag);
  if (validRepository && validReleaseTag) {
    elements.apkDownload.href = `https://github.com/${repository}/releases/download/${releaseTag}/KasirAlfamidi.apk`;
    elements.apkDownload.removeAttribute('aria-disabled');
    elements.apkDownload.removeAttribute('title');
  } else {
    elements.apkDownload.href = '#download-apk';
    elements.apkDownload.setAttribute('aria-disabled', 'true');
    elements.apkDownload.title = 'Tautan unduhan aktif setelah repository GitHub dikonfigurasi dan APK dirilis.';
  }
}

function configureDates() {
  const now = new Date();
  elements.todayLabel.textContent = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(now);
  elements.appVersion.textContent = APP_VERSION;
  elements.footerVersion.textContent = `v${APP_VERSION}`;
}

async function registerOfflineSupport() {
  const isNative = Capacitor.isNativePlatform();
  const supportsServiceWorker = 'serviceWorker' in navigator;
  const secureOrigin = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  if (!isNative && supportsServiceWorker && secureOrigin) {
    try {
      const scriptUrl = new URL(`../sw.js?v=${encodeURIComponent(BUILD_ID)}`, import.meta.url);
      await navigator.serviceWorker.register(scriptUrl, { scope: new URL('../', import.meta.url).pathname });
    } catch (error) {
      console.warn('Service Worker belum dapat diaktifkan:', error);
    }
  }
}

function handleAddProduct(event) {
  event.preventDefault();
  try {
    state.cart = addProduct(state.cart, elements.productSelect.value, elements.quantityInput.value);
    elements.quantityInput.value = '1';
    invalidatePayment();
    saveCart();
    renderCart();
    showToast('Barang berhasil ditambahkan ke transaksi.', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function handleCartAction(event) {
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  state.cart = removeProduct(state.cart, button.dataset.remove);
  invalidatePayment();
  saveCart();
  renderCart();
  showToast('Barang dihapus dari transaksi.', 'success');
}

function handleClearCart() {
  if (!state.cart.length) return;
  state.cart = clearCart();
  state.payment = '';
  elements.paymentInput.value = '';
  invalidatePayment();
  saveCart();
  renderCart();
  showToast('Transaksi berhasil dikosongkan.', 'success');
}

function handlePayment() {
  const result = processPayment(state.cart, elements.paymentInput.value);
  if (!result.ok) {
    showToast(result.message, 'error');
    elements.paymentInput.focus();
    return;
  }

  state.payment = String(result.paid);
  state.change = result.change;
  state.receipt = createReceipt(state.cart, result.paid).text;
  state.paid = true;
  renderPayment();
  showToast(`Pembayaran berhasil. Kembalian ${formatRupiah(result.change)}.`, 'success');
}

function attachEvents() {
  elements.addForm.addEventListener('submit', handleAddProduct);
  elements.cartBody.addEventListener('click', handleCartAction);
  elements.clearCart.addEventListener('click', handleClearCart);
  elements.payButton.addEventListener('click', handlePayment);
  window.addEventListener('online', refreshNetworkStatus);
  window.addEventListener('offline', refreshNetworkStatus);
  elements.apkDownload.addEventListener('click', (event) => {
    if (elements.apkDownload.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
      showToast('Tautan APK akan aktif setelah website dipublikasikan dari repository GitHub.', 'info');
    }
  });
}

function initialize() {
  renderProducts();
  renderCart();
  renderPayment();
  attachEvents();
  refreshNetworkStatus();
  configureDates();
  configureDownloadLink();
  registerOfflineSupport();
}

initialize();
