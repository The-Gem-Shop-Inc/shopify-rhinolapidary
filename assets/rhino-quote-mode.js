if (!customElements.get('rhino-quote-mode')) {
  customElements.define(
    'rhino-quote-mode',
    class RhinoQuoteMode extends HTMLElement {
      connectedCallback() {
        this.verifyPickupAvailability();
        const form = this.querySelector('#RhinoShippingQuoteForm');
        const state = this.querySelector('[data-rhino-quote-form-state]');
        if (!form || !state) return;
        const signature = this.dataset.cartSignature || '';
        const reference = this.dataset.reference || '';
        const key = `rhino-quote:${signature}`;
        const pendingKey = 'rhino-quote:pending';
        const status = this.querySelector('[data-rhino-quote-status]');
        const submit = this.querySelector('[data-rhino-quote-submit]');
        const success = this.querySelector('[data-rhino-quote-success]');
        const strings = {
          duplicate: this.dataset.stringDuplicate || '',
          invalidCart: this.dataset.stringInvalidCart || '',
          submitting: this.dataset.stringSubmitting || '',
        };

        if (state.dataset.postedSuccessfully === 'true') {
          const pending = this.readStorage(pendingKey);
          const completed = {
            cartSignature: signature,
            reference: pending?.reference || reference,
            status: 'submitted',
          };
          sessionStorage.setItem(key, JSON.stringify(completed));
          sessionStorage.removeItem(pendingKey);
          success?.focus();
          return;
        }

        const prior = this.readStorage(key);
        if (prior?.status === 'submitted' && prior.cartSignature === signature) {
          submit.disabled = true;
          status.textContent = `${strings.duplicate} ${prior.reference}`;
          return;
        }

        form.addEventListener('submit', (event) => {
          if (!form.checkValidity()) return;
          if (!signature || !reference) {
            event.preventDefault();
            status.textContent = strings.invalidCart;
            return;
          }
          const pending = { cartSignature: signature, reference, status: 'pending' };
          sessionStorage.setItem(pendingKey, JSON.stringify(pending));
          submit.disabled = true;
          submit.setAttribute('aria-disabled', 'true');
          status.textContent = strings.submitting;
        });
      }

      async verifyPickupAvailability() {
        const checkout = this.querySelector('[data-rhino-pickup-checkout]');
        const status = this.querySelector('[data-rhino-pickup-status]');
        if (!checkout || !status || this.dataset.pickupPolicyAllowed !== 'true') return;
        const variants = (this.dataset.pickupVariants || '').split('|').filter((value) => /^[0-9]+$/.test(value));
        if (!variants.length) return;
        const locationName = this.dataset.pickupLocation || '';
        try {
          const results = await Promise.all(variants.map(async (variantId) => {
            const root = window.routes?.root_url || '/';
            const response = await fetch(`${root}variants/${variantId}/?section_id=pickup-availability`, {
              headers: { Accept: 'text/html' },
            });
            if (!response.ok) return false;
            const document = new DOMParser().parseFromString(await response.text(), 'text/html');
            return [...document.querySelectorAll('.pickup-availability-list__item h3')]
              .some((heading) => heading.textContent.trim() === locationName);
          }));
          if (!results.every(Boolean)) return;
          checkout.disabled = false;
          checkout.removeAttribute('aria-disabled');
          status.textContent = this.dataset.stringPickupAvailable || '';
          status.classList.remove('rhino-quote-mode__blocked');
          status.classList.add('rhino-quote-mode__available');
        } catch (_error) {
          status.textContent = this.dataset.stringPickupBlocked || '';
        }
      }

      readStorage(key) {
        try {
          return JSON.parse(sessionStorage.getItem(key));
        } catch (_error) {
          return null;
        }
      }
    }
  );
}
