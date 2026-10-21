/* Only suppresses time-expired server-approved markup. Creates no fit authority. */
if (!customElements.get('rhino-g-fit')) {
  customElements.define('rhino-g-fit', class extends HTMLElement {
    connectedCallback() {
      this.check = this.check.bind(this);
      this.check();
      window.addEventListener('pageshow', this.check);
      document.addEventListener('visibilitychange', this.check);
    }

    disconnectedCallback() {
      window.removeEventListener('pageshow', this.check);
      document.removeEventListener('visibilitychange', this.check);
      clearTimeout(this.expiryTimer);
    }

    check() {
      clearTimeout(this.expiryTimer);
      const now = Date.now();
      const from = Date.parse(this.dataset.validFrom);
      const until = Date.parse(this.dataset.expiresAt);
      const product = this.closest('product-info');
      const valid = Number.isFinite(from) && Number.isFinite(until) &&
        now >= from && now < until && product?.dataset.productId === this.dataset.productId;
      this.hidden = !valid;
      if (valid) this.expiryTimer = setTimeout(this.check, Math.min(until - now, 2147483647));
    }
  });
}

