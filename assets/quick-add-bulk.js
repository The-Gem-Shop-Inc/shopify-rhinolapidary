(() => {
if (window.CollectionCartCoordinator && customElements.get('quick-add-bulk')) return;

class CollectionCartCoordinator {
  static components = new Set();
  static mutationTail = Promise.resolve();
  static reconcileTimer = null;
  static reconcileGeneration = 0;
  static cartUpdateUnsubscriber = null;

  static register(component) {
    this.components.add(component);
    if (this.cartUpdateUnsubscriber) return;

    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event = {}) => {
      if (event.source === 'quick-add-bulk' || event.collectionCartConfirmed) return;
      this.scheduleReconcile();
    });
  }

  static unregister(component) {
    this.components.delete(component);
    if (this.components.size !== 0 || !this.cartUpdateUnsubscriber) return;

    this.cartUpdateUnsubscriber();
    this.cartUpdateUnsubscriber = null;
  }

  static enqueueMutation(operation) {
    const result = this.mutationTail.catch(() => undefined).then(operation);
    this.mutationTail = result.catch(() => undefined);
    return result;
  }

  static isCartState(cart) {
    return Boolean(cart && Array.isArray(cart.items) && Number.isFinite(Number(cart.item_count)));
  }

  static quantityForVariant(cart, variantId) {
    if (!this.isCartState(cart)) return 0;

    return cart.items.reduce((quantity, item) => {
      const itemVariantId = Number(item.variant_id ?? item.id);
      return itemVariantId === Number(variantId) ? quantity + (Number(item.quantity) || 0) : quantity;
    }, 0);
  }

  static applyConfirmedCart(cart, { forceComponents = [] } = {}) {
    if (!this.isCartState(cart)) return false;

    const forced = new Set(forceComponents);
    this.components.forEach((component) => {
      const quantity = this.quantityForVariant(cart, component.dataset.index);
      component.applyConfirmedQuantity(quantity, component.hasPendingCartIntent && !forced.has(component));
    });
    this.renderCartBadgeFallback(Number(cart.item_count));
    return true;
  }

  static renderCartBadgeFallback(itemCount) {
    const cartLink = document.getElementById('cart-icon-bubble');
    if (!cartLink || !Number.isFinite(itemCount)) return;

    let bubble = cartLink.querySelector('.cart-count-bubble');
    if (itemCount === 0) {
      bubble?.remove();
      return;
    }

    const feedback = document.querySelector('cart-feedback-toast');
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.className = 'cart-count-bubble';
      bubble.innerHTML = '<span aria-hidden="true"></span><span class="visually-hidden"></span>';
      cartLink.appendChild(bubble);
    }

    const visibleCount = bubble.querySelector('[aria-hidden="true"]');
    if (visibleCount) visibleCount.textContent = itemCount < 100 ? String(itemCount) : '';
    const accessibleCount = bubble.querySelector('.visually-hidden');
    if (accessibleCount) accessibleCount.textContent = feedback?.cartCountLabel(itemCount) || String(itemCount);
  }

  static showFeedback(status, details = {}) {
    document.querySelector('cart-feedback-toast')?.show({ status, ...details });
  }

  static announceConfirmedChange(productTitle, previousQuantity, confirmedQuantity) {
    const status = confirmedQuantity === 0 ? 'removed' : previousQuantity === 0 ? 'added' : 'updated';
    this.showFeedback(status, { productTitle, quantity: confirmedQuantity, announce: true });
  }

  static scheduleReconcile() {
    const generation = ++this.reconcileGeneration;
    clearTimeout(this.reconcileTimer);
    this.reconcileTimer = setTimeout(async () => {
      await this.mutationTail;
      if (generation !== this.reconcileGeneration) return;

      await this.reconcileFromShopify({
        shouldApply: () => generation === this.reconcileGeneration,
      });
    }, 80);
  }

  static async fetchConfirmedCart() {
    const cartUrl = (typeof routes !== 'undefined' && routes?.cart_url) || '/cart';
    const response = await fetch(`${cartUrl}.js`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Cart reconciliation failed (${response.status})`);

    const cart = await response.json();
    if (!this.isCartState(cart)) throw new Error('Cart reconciliation returned an invalid cart');
    return cart;
  }

  static async reconcileFromShopify({ component = null, forceComponents = [], shouldApply = () => true } = {}) {
    const surfaceOwner = component || [...this.components].find((candidate) => candidate.isConnected);
    try {
      const cart = await this.fetchConfirmedCart();
      if (!shouldApply()) return null;

      this.applyConfirmedCart(cart, { forceComponents });
      if (surfaceOwner) await surfaceOwner.recoverSharedSections(cart, shouldApply);
      return shouldApply() ? cart : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

window.CollectionCartCoordinator = {
  enqueueMutation: (operation) => CollectionCartCoordinator.enqueueMutation(operation),
  isCartState: (cart) => CollectionCartCoordinator.isCartState(cart),
  quantityForVariant: (cart, variantId) => CollectionCartCoordinator.quantityForVariant(cart, variantId),
  applyConfirmedCart: (cart, options) => CollectionCartCoordinator.applyConfirmedCart(cart, options),
  reconcileFromShopify: (options) => CollectionCartCoordinator.reconcileFromShopify(options),
  showFeedback: (status, details) => CollectionCartCoordinator.showFeedback(status, details),
  announceConfirmedChange: (productTitle, previousQuantity, confirmedQuantity) =>
    CollectionCartCoordinator.announceConfirmedChange(productTitle, previousQuantity, confirmedQuantity),
};

if (!customElements.get('quick-add-bulk')) {
  customElements.define(
    'quick-add-bulk',
    class QuickAddBulk extends BulkAdd {
      constructor() {
        super();
        this.quantity = this.querySelector('quantity-input');

        const debouncedOnChange = debounce(({ target, value, index }) => {
          // A different Product can finish while this change is still debouncing.
          // Keep the captured customer intent instead of reading a subsequently
          // synchronized input value from the live DOM.
          target.value = value;
          if (parseInt(value) === 0) {
            this.startQueue(index, parseInt(value));
          } else {
            this.validateQuantity({ target });
          }
          this.pendingInputValue = null;
        }, ON_CHANGE_DEBOUNCE_TIMER);

        this.addEventListener('change', (event) => {
          this.pendingInputValue = {
            target: event.target,
            value: event.target.value,
            index: event.target.dataset.index,
          };
          debouncedOnChange(this.pendingInputValue);
        });
        this.listenForActiveInput();
        this.listenForKeydown();
        this.lastActiveInputId = null;
      }

      connectedCallback() {
        CollectionCartCoordinator.register(this);
      }

      disconnectedCallback() {
        CollectionCartCoordinator.unregister(this);
      }

      get input() {
        return this.querySelector('quantity-input input');
      }

      get hasPendingCartIntent() {
        return Boolean(this.pendingInputValue) || this.requestStarted || this.queue.length > 0;
      }

      get productTitle() {
        return this.dataset.productTitle || '';
      }

      selectProgressBar() {
        return this.querySelector('.progress-bar-container');
      }

      listenForActiveInput() {
        if (!this.classList.contains('hidden')) {
          this.input?.addEventListener('focusin', (event) => event.target.select());
        }
        this.isEnterPressed = false;
      }

      listenForKeydown() {
        this.input?.addEventListener(
          'keydown',
          (event) => {
            if (event.key === 'Enter') {
              this.input?.blur();
              this.isEnterPressed = true;
            }
          }
        );
      }

      cleanErrorMessageOnType(event) {
        event.target.addEventListener(
          'keypress',
          () => {
            event.target.setCustomValidity('');
          },
          { once: true }
        );
      }

      get sectionId() {
        if (!this._sectionId) {
          this._sectionId = this.closest('.collection-quick-add-bulk')?.dataset.id;
        }

        return this._sectionId;
      }

      getSectionsUrl() {
        const pageParams = new URLSearchParams(window.location.search);
        const pageNumber = decodeURIComponent(pageParams.get('page') || '');

        return `${window.location.pathname}${pageNumber ? `?page=${pageNumber}` : ''}`;
      }

      getSectionsToRender() {
        return [
          {
            id: 'cart-icon-bubble',
            section: 'cart-icon-bubble',
            selector: '.shopify-section',
          },
          {
            id: 'CartDrawer',
            selector: '.drawer__inner',
            section: 'cart-drawer',
          },
        ];
      }

      applyConfirmedQuantity(quantity, preservePendingValue = false) {
        const input = this.input;
        if (!input) return;

        input.dataset.cartQuantity = String(quantity);
        if (preservePendingValue) return;

        input.value = String(quantity);
        input.setAttribute('value', String(quantity));
        this.querySelector('quantity-input')?.validateQtyRules?.();
      }

      parseSection(html, selector) {
        if (typeof html !== 'string' || !html.trim()) return null;
        return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
      }

      renderSharedSections(cart) {
        const missingSections = [];
        const sections = cart?.sections;

        this.getSectionsToRender().forEach((section) => {
          const sectionElement = document.getElementById(section.id);
          if (!sectionElement) return;

          const source = this.parseSection(sections?.[section.section], section.selector);
          if (!source) {
            missingSections.push(section.section);
            return;
          }

          if (section.section === 'cart-drawer') {
            sectionElement.closest('cart-drawer')?.classList.toggle('is-empty', Number(cart.item_count) === 0);
          }

          const target = sectionElement.querySelector(section.selector) || sectionElement;
          target.replaceChildren(...source.cloneNode(true).childNodes);
        });

        CollectionCartCoordinator.renderCartBadgeFallback(Number(cart.item_count));
        return missingSections;
      }

      async recoverSharedSections(cart, shouldApply = () => true) {
        const sectionIds = this.getSectionsToRender()
          .filter((section) => document.getElementById(section.id))
          .map((section) => section.section);
        if (sectionIds.length === 0) return;

        const url = new URL(this.getSectionsUrl(), window.location.origin);
        url.searchParams.set('sections', [...new Set(sectionIds)].join(','));

        try {
          const response = await fetch(`${url.pathname}${url.search}`, { headers: { Accept: 'application/json' } });
          if (!response.ok) throw new Error(`Cart section reconciliation failed (${response.status})`);
          const sections = await response.json();
          if (!shouldApply()) return;
          this.renderSharedSections({ ...cart, sections });
        } catch (error) {
          console.error(error);
        }
      }

      desiredQuantitiesMatch(cart, items) {
        return Object.entries(items).every(
          ([variantId, quantity]) =>
            CollectionCartCoordinator.quantityForVariant(cart, variantId) === Number(quantity)
        );
      }

      responseError(parsedState, response) {
        const message = parsedState?.errors || parsedState?.description || parsedState?.message;
        if (!response.ok || message) {
          const text = typeof message === 'string' ? message : window.cartStrings.error;
          const rejected = response.status === 404 || response.status === 422 || Boolean(parsedState?.errors);
          throw Object.assign(new Error(text), { code: rejected ? 'INVALID' : 'UNCERTAIN' });
        }
      }

      async submitUpdate(items, ids, previousQuantity, linesUpdate) {
        const body = JSON.stringify({
          updates: items,
          sections: this.getSectionsToRender().map((section) => section.section),
          sections_url: this.getSectionsUrl(),
        });

        try {
          const response = await fetch(`${routes.cart_update_url}`, { ...fetchConfig(), body });
          let parsedState;
          try {
            parsedState = await response.json();
          } catch {
            throw Object.assign(new Error(window.cartStrings.error), { code: 'UNCERTAIN' });
          }

          this.responseError(parsedState, response);
          if (!CollectionCartCoordinator.isCartState(parsedState)) {
            throw Object.assign(new Error(window.cartStrings.error), { code: 'UNCERTAIN' });
          }

          const hasNewerIntent =
            Boolean(this.pendingInputValue) || this.queue.some((entry) => ids.includes(String(entry.id)));
          const forceComponents = hasNewerIntent ? [] : [this];
          CollectionCartCoordinator.applyConfirmedCart(parsedState, { forceComponents });
          const missingSections = this.renderSharedSections(parsedState);
          if (missingSections.length > 0) await this.recoverSharedSections(parsedState);

          linesUpdate?.resolve(parsedState);
          publish(PUB_SUB_EVENTS.cartUpdate, { source: 'quick-add-bulk', cartData: parsedState });

          if (!hasNewerIntent) {
            const confirmedQuantity = CollectionCartCoordinator.quantityForVariant(parsedState, ids[0]);
            CollectionCartCoordinator.announceConfirmedChange(
              this.productTitle,
              previousQuantity,
              confirmedQuantity
            );
          }
        } catch (error) {
          const reconciledCart = await CollectionCartCoordinator.reconcileFromShopify({
            component: this,
            forceComponents: [this],
          });
          const confirmed = reconciledCart && this.desiredQuantitiesMatch(reconciledCart, items);

          if (confirmed) {
            linesUpdate?.resolve(reconciledCart);
            publish(PUB_SUB_EVENTS.cartUpdate, { source: 'quick-add-bulk', cartData: reconciledCart });
            const confirmedQuantity = CollectionCartCoordinator.quantityForVariant(reconciledCart, ids[0]);
            CollectionCartCoordinator.announceConfirmedChange(
              this.productTitle,
              previousQuantity,
              confirmedQuantity
            );
            return;
          }

          if (error.code !== 'INVALID') console.error(error);
          const message = error.code === 'INVALID' ? error.message : window.cartStrings.error;
          this.dispatchCartErrorEvent(message, error.code || 'SERVICE_UNAVAILABLE');
          linesUpdate?.reject(error);
          CollectionCartCoordinator.showFeedback(reconciledCart ? 'rejected' : 'uncertain', {
            productTitle: this.productTitle,
            error: message,
            announce: true,
          });
        }
      }

      updateMultipleQty(items) {
        this.selectProgressBar()?.classList.remove('hidden');

        const ids = Object.keys(items);
        const previousQuantity = this.getCartQuantityForLine(ids[0]);
        const linesUpdate = this.startCartLinesUpdate(items);
        CollectionCartCoordinator.showFeedback('pending', { productTitle: this.productTitle, announce: false });

        CollectionCartCoordinator.enqueueMutation(() =>
          this.submitUpdate(items, ids, previousQuantity, linesUpdate)
        ).finally(() => {
          this.selectProgressBar()?.classList.add('hidden');
          this.setRequestStarted(false);
        });
      }
    }
  );
}
})();
