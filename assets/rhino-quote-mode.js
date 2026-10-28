if (!customElements.get('rhino-quote-mode')) {
  customElements.define(
    'rhino-quote-mode',
    class RhinoQuoteMode extends HTMLElement {
      connectedCallback() {
        if (this.initialized) return;
        this.initialized = true;
        this.setupFulfillmentChoices();
        this.verifyPickupAvailability();
        this.form = this.closest('#RhinoShippingQuoteForm') || this.querySelector('#RhinoShippingQuoteForm');
        this.formState = this.querySelector('[data-rhino-quote-form-state]');
        if (!this.form || !this.formState) return;

        this.signature = this.dataset.cartSignature || '';
        this.reference = this.dataset.reference || '';
        this.completedKey = `rhino-quote:${this.signature}`;
        this.pendingKey = 'rhino-quote:pending';
        this.status = this.querySelector('[data-rhino-quote-status]');
        this.submit = this.querySelector('[data-rhino-quote-submit]');
        this.success = this.querySelector('[data-rhino-quote-success]');
        this.submissionState = 'idle';
        this.captchaResourceFailed = false;
        this.submissionTimeoutMs = 30000;
        this.strings = {
          duplicate: this.dataset.stringDuplicate || '',
          invalidCart: this.dataset.stringInvalidCart || '',
          submitting: this.dataset.stringSubmitting || '',
          captchaFailed: this.dataset.stringCaptchaFailed || '',
          submissionFailed: this.dataset.stringSubmissionFailed || '',
          challengeWaiting: this.dataset.stringChallengeWaiting || '',
        };

        this.onResourceError = (event) => this.handleResourceError(event);
        this.onPageHide = () => {
          this.navigationStarted = true;
          this.clearSubmissionTimer();
        };
        this.onPageShow = (event) => {
          if (event.persisted && ['submitting', 'challenge'].includes(this.submissionState)) {
            this.failSubmission(this.strings.submissionFailed);
          }
        };
        window.addEventListener('error', this.onResourceError, true);
        window.addEventListener('beforeunload', this.onPageHide);
        window.addEventListener('pagehide', this.onPageHide);
        window.addEventListener('pageshow', this.onPageShow);

        if (this.formState.dataset.postedSuccessfully === 'true') {
          const pending = this.readStorage(this.pendingKey);
          const completed = {
            cartSignature: this.signature,
            reference: pending?.cartSignature === this.signature ? pending.reference : this.reference,
            status: 'submitted',
          };
          sessionStorage.setItem(this.completedKey, JSON.stringify(completed));
          this.removeMatchingPending();
          this.submissionState = 'complete';
          this.success?.focus();
          return;
        }

        const prior = this.readStorage(this.completedKey);
        if (prior?.status === 'submitted' && prior.cartSignature === this.signature) {
          this.submissionState = 'complete';
          this.submit.disabled = true;
          this.submit.setAttribute('aria-disabled', 'true');
          this.setStatus(`${this.strings.duplicate} ${prior.reference}`);
          return;
        }

        const pending = this.readStorage(this.pendingKey);
        const returnedWithErrors = this.formState.dataset.hasErrors === 'true';
        if (pending?.cartSignature === this.signature || returnedWithErrors) {
          this.removeMatchingPending();
          const shippingChoice = this.querySelector('[data-rhino-fulfillment-choice][value="shipping"]');
          if (shippingChoice && !shippingChoice.checked) {
            shippingChoice.checked = true;
            shippingChoice.dispatchEvent(new Event('change', { bubbles: true }));
          }
          this.setStatus(this.strings.submissionFailed, true);
        }

        this.form.addEventListener('submit', (event) => this.handleSubmit(event));
      }

      disconnectedCallback() {
        this.clearSubmissionTimer();
        window.removeEventListener('error', this.onResourceError, true);
        window.removeEventListener('beforeunload', this.onPageHide);
        window.removeEventListener('pagehide', this.onPageHide);
        window.removeEventListener('pageshow', this.onPageShow);
      }

      handleSubmit(event) {
        if (!this.form.checkValidity()) return;
        if (!this.signature || !this.reference) {
          event.preventDefault();
          this.setStatus(this.strings.invalidCart, true);
          return;
        }
        if (this.submissionState === 'complete') {
          event.preventDefault();
          return;
        }
        if (this.captchaResourceFailed) {
          event.preventDefault();
          this.failSubmission(this.strings.captchaFailed);
          return;
        }

        const pending = {
          cartSignature: this.signature,
          reference: this.reference,
          status: 'pending',
          startedAt: Date.now(),
        };
        sessionStorage.setItem(this.pendingKey, JSON.stringify(pending));
        this.submissionState = 'submitting';
        this.navigationStarted = false;
        this.submit.disabled = true;
        this.submit.setAttribute('aria-disabled', 'true');
        this.form.setAttribute('aria-busy', 'true');
        this.setStatus(this.strings.submitting);
        this.startSubmissionTimer();
      }

      startSubmissionTimer() {
        this.clearSubmissionTimer();
        this.submissionTimer = window.setTimeout(() => {
          if (this.navigationStarted || !['submitting', 'challenge'].includes(this.submissionState)) return;
          if (this.hasVisibleCaptchaChallenge()) {
            this.submissionState = 'challenge';
            this.setStatus(this.strings.challengeWaiting);
            return;
          }
          this.failSubmission(this.strings.captchaFailed);
        }, this.submissionTimeoutMs);
      }

      clearSubmissionTimer() {
        if (this.submissionTimer) window.clearTimeout(this.submissionTimer);
        this.submissionTimer = null;
      }

      handleResourceError(event) {
        const target = event.target;
        if (!(target instanceof HTMLScriptElement) || !this.isCaptchaUrl(target.src)) return;
        this.captchaResourceFailed = true;
        if (['submitting', 'challenge'].includes(this.submissionState)) {
          this.failSubmission(this.strings.captchaFailed);
        }
      }

      isCaptchaUrl(value) {
        if (!value) return false;
        try {
          const hostname = new URL(value, window.location.href).hostname.toLowerCase();
          return hostname === 'hcaptcha.com' || hostname.endsWith('.hcaptcha.com');
        } catch (_error) {
          return false;
        }
      }

      hasVisibleCaptchaChallenge() {
        const candidates = [...document.querySelectorAll(
          'iframe[src*="hcaptcha.com"][src*="challenge"], iframe[title*="hCaptcha"][title*="challenge" i], '
          + 'iframe[title*="challenge" i][src*="hcaptcha.com"]',
        )];
        return candidates.some((element) => {
          const style = window.getComputedStyle(element);
          const bounds = element.getBoundingClientRect();
          return style.display !== 'none' && style.visibility !== 'hidden' && bounds.width > 0 && bounds.height > 0;
        });
      }

      failSubmission(message) {
        this.clearSubmissionTimer();
        this.removeMatchingPending();
        this.submissionState = 'failed';
        this.captchaResourceFailed = false;
        this.form.removeAttribute('aria-busy');
        this.submit.disabled = false;
        this.submit.removeAttribute('aria-disabled');
        this.setStatus(message, true);
      }

      setStatus(message, isError = false) {
        if (!this.status) return;
        this.status.textContent = message;
        this.status.classList.toggle('rhino-quote-mode__status--error', isError);
        this.status.setAttribute('role', isError ? 'alert' : 'status');
        this.status.setAttribute('aria-live', isError ? 'assertive' : 'polite');
      }

      removeMatchingPending() {
        const pending = this.readStorage(this.pendingKey);
        if (!pending || pending.cartSignature === this.signature) sessionStorage.removeItem(this.pendingKey);
      }

      setupFulfillmentChoices() {
        const choices = [...this.querySelectorAll('[data-rhino-fulfillment-choice]')];
        const formRegion = this.querySelector('#RhinoShippingQuotePanel');
        if (!choices.length || !formRegion) return;

        const update = () => {
          const selected = choices.find((choice) => choice.checked)?.value || '';
          formRegion.hidden = selected !== 'shipping';
          choices.forEach((choice) => choice.setAttribute('aria-expanded', String(choice.checked)));
          this.querySelectorAll('[data-rhino-fulfillment-card]').forEach((card) => {
            const choice = card.querySelector('[data-rhino-fulfillment-choice]');
            card.toggleAttribute('data-selected', Boolean(choice?.checked));
          });
        };

        choices.forEach((choice) => choice.addEventListener('change', update));
        this.querySelectorAll('[data-rhino-fulfillment-card]').forEach((card) => {
          card.addEventListener('click', (event) => {
            if (event.target.closest('button, input, label, a, select, textarea')) return;
            const choice = card.querySelector('[data-rhino-fulfillment-choice]');
            if (!choice?.checked) {
              choice.checked = true;
              choice.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });
        });
        update();
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
