if (!customElements.get('cart-feedback-toast')) {
  customElements.define(
    'cart-feedback-toast',
    class CartFeedbackToast extends HTMLElement {
      constructor() {
        super();
        this.message = this.querySelector('[data-cart-feedback-message]');
        this.liveRegion = this.querySelector('[data-cart-feedback-live]');
        this.dismissButton = this.querySelector('[data-cart-feedback-dismiss]');
        this.dismissButton?.addEventListener('click', () => this.dismiss());
        this.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') this.dismiss();
        });
        this.addEventListener('mouseenter', () => this.pauseAutoDismiss());
        this.addEventListener('mouseleave', () => this.resumeAutoDismiss());
        this.addEventListener('focusin', () => this.pauseAutoDismiss());
        this.addEventListener('focusout', () => {
          setTimeout(() => {
            if (!this.contains(document.activeElement)) this.resumeAutoDismiss();
          });
        });
      }

      format(template, values) {
        return Object.entries(values).reduce(
          (message, [key, value]) => message.replaceAll(`[${key}]`, String(value ?? '')),
          template || ''
        );
      }

      cartCountLabel(count) {
        const template = count === 1 ? this.dataset.cartCountOne : this.dataset.cartCountOther;
        return this.format(template, { count });
      }

      feedbackMessage(status, { productTitle = '', quantity = 0, error = '' } = {}) {
        const templateByStatus = {
          pending: this.dataset.pending,
          added: this.dataset.added,
          updated: this.dataset.updated,
          removed: this.dataset.removed,
          rejected: this.dataset.rejected,
          uncertain: this.dataset.uncertain,
        };
        return this.format(templateByStatus[status], {
          product: productTitle,
          quantity,
          error,
        });
      }

      show({ status, productTitle, quantity, error, announce = status !== 'pending' }) {
        const message = this.feedbackMessage(status, { productTitle, quantity, error });
        if (!message) return;

        clearTimeout(this.dismissTimer);
        clearTimeout(this.announcementTimer);
        this.dismissTimer = null;
        this.hidden = false;
        this.dataset.status = status;
        this.message.textContent = message;
        this.liveRegion.textContent = '';

        if (announce) {
          this.announcementTimer = setTimeout(() => {
            if (!this.hidden && this.message.textContent === message) this.liveRegion.textContent = message;
          }, 250);
        }

        if (status !== 'pending') {
          this.style.setProperty('--cart-feedback-duration', '4000ms');
          this.dataset.timer = 'active';
          // Restart the duration indicator when a rapid update replaces the current message.
          void this.offsetWidth;
          this.remainingDuration = 4000;
          this.resumeAutoDismiss();
        } else {
          delete this.dataset.timer;
        }
      }

      pauseAutoDismiss() {
        if (!this.dismissTimer) return;
        clearTimeout(this.dismissTimer);
        this.dismissTimer = null;
        this.remainingDuration = Math.max(0, this.dismissAt - Date.now());
        this.dataset.paused = 'true';
      }

      resumeAutoDismiss() {
        if (this.hidden || this.dataset.status === 'pending' || this.dismissTimer) return;
        const duration = this.remainingDuration ?? 4000;
        this.dismissAt = Date.now() + duration;
        delete this.dataset.paused;
        this.dismissTimer = setTimeout(() => this.dismiss(), duration);
      }

      dismiss() {
        clearTimeout(this.dismissTimer);
        clearTimeout(this.announcementTimer);
        this.hidden = true;
        this.liveRegion.textContent = '';
        delete this.dataset.timer;
        delete this.dataset.paused;
        this.dismissTimer = null;
      }
    }
  );
}
