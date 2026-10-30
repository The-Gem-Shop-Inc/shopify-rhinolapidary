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

        this.automationEnabled = this.dataset.automationEnabled === 'true';
        this.draftClient = window.RhinoQuoteDraftClient;
        this.signature = this.dataset.cartSignature || '';
        this.reference = this.dataset.reference || '';
        this.completedKey = `rhino-quote:${this.signature}`;
        this.pendingKey = 'rhino-quote:pending';
        this.status = this.querySelector('[data-rhino-quote-status]');
        this.submit = this.querySelector('[data-rhino-quote-submit]');
        this.draftSubmit = this.querySelector('[data-rhino-draft-submit]');
        this.emailSubmit = this.querySelector('[data-rhino-email-submit]') || this.submit;
        this.success = this.querySelector('[data-rhino-quote-success]');
        this.emailBodyTemplate = this.form.elements.namedItem('contact[body]')?.value || '';
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
          automationUnavailable: this.dataset.stringAutomationUnavailable || '',
          cartChanged: this.dataset.stringCartChanged || '',
          confirmed: this.dataset.stringConfirmed || '',
          fallbackRequired: this.dataset.stringFallbackRequired || '',
          uncertain: this.dataset.stringUncertain || '',
          rejected: this.dataset.stringRejected || '',
          referenceTemplate: this.dataset.stringReferenceTemplate || 'Quotation reference: {reference}',
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
            reference: pending?.cartSignature === this.signature ? pending.reference : (this.reference || 'Email reference unavailable'),
            status: 'submitted',
          };
          sessionStorage.setItem(this.completedKey, JSON.stringify(completed));
          this.reference = completed.reference;
          this.updateReferenceDisplay(completed.reference);
          const confirmedReference = this.querySelector('[data-rhino-email-confirmed-reference]');
          if (confirmedReference) confirmedReference.textContent = completed.reference;
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
        this.draftSubmit?.addEventListener('click', () => this.submitDraftOrder());
        if (this.automationEnabled) {
          const active = this.readActiveRequest();
          if (active && ['submitting', 'uncertain'].includes(active.state)) {
            this.reference = active.reference || '';
            this.updateReferenceDisplay(this.reference);
            this.submissionState = 'uncertain';
            this.setSubmissionControls({ draftDisabled: true, emailDisabled: true });
            this.setStatus(this.strings.uncertain, true);
          }
          this.baselinePromise = this.captureCartBaseline();
        }
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
        const active = this.automationEnabled ? this.readActiveRequest() : null;
        if (active && ['submitting', 'uncertain'].includes(active.state)) {
          event.preventDefault();
          this.setSubmissionControls({ draftDisabled: true, emailDisabled: true });
          this.setStatus(this.strings.uncertain, true);
          return;
        }
        if (!this.reference && this.draftClient) {
          this.reference = this.draftClient.createReference(this.dataset.cartQuantity || 1);
        }
        this.updateReferenceDisplay(this.reference);
        this.syncFallbackFields();
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

      async captureCartBaseline() {
        if (!this.automationEnabled || !this.draftClient) return false;
        try {
          const cart = await this.fetchCart();
          this.cartBaseline = this.draftClient.canonicalJson(this.draftClient.cartMaterial(cart));
          const active = this.readActiveRequest();
          if (active?.state === 'confirmed' && active.cartMaterial === this.cartBaseline && active.staffIdentifier) {
            this.showConfirmed(active.reference, active.staffIdentifier, true);
          }
          return true;
        } catch (_error) {
          this.cartBaseline = null;
          return false;
        }
      }

      async fetchCart() {
        const root = window.Shopify?.routes?.root || window.routes?.root_url || '/';
        const response = await fetch(`${root}cart.js`, {
          credentials: 'same-origin',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('CART_UNAVAILABLE');
        return response.json();
      }

      formValues() {
        const value = (name) => this.form.elements.namedItem(name)?.value || '';
        return {
          firstName: value('contact[first_name]'),
          lastName: value('contact[last_name]'),
          email: value('contact[email]'),
          phone: value('contact[phone]'),
          company: value('contact[company]'),
          address1: value('contact[address_line_1]'),
          address2: value('contact[address_line_2]'),
          city: value('contact[city]'),
          provinceCode: value('contact[state]'),
          zip: value('contact[postal_code]'),
          addressType: value('contact[delivery_type]'),
          liftgateRequired: value('contact[liftgate_required]') === 'Yes',
          accessInformation: value('contact[access_information]'),
          insuranceRequested: Boolean(this.form.elements.namedItem('contact[insurance_options_requested]')?.checked),
        };
      }

      syncFallbackFields(reference = this.reference) {
        const values = this.formValues();
        const combinedName = `${values.firstName} ${values.lastName}`.trim();
        const nameInput = this.form.elements.namedItem('contact[name]');
        if (nameInput) nameInput.value = combinedName;
        const referenceInput = this.querySelector('[data-rhino-quote-reference]');
        if (referenceInput && reference) referenceInput.value = reference;
        const body = this.form.elements.namedItem('contact[body]');
        if (body && reference) body.value = this.emailBodyTemplate.replaceAll('REFERENCE_PENDING', reference);
      }

      updateReferenceDisplay(reference) {
        if (!reference) return;
        const display = this.querySelector('[data-rhino-reference-display]');
        if (display) display.textContent = this.strings.referenceTemplate.replace('{reference}', reference);
      }

      readActiveRequest() {
        try {
          return JSON.parse(localStorage.getItem(this.draftClient.ACTIVE_REQUEST_KEY));
        } catch (_error) {
          return null;
        }
      }

      writeActiveRequest(value) {
        try {
          localStorage.setItem(this.draftClient.ACTIVE_REQUEST_KEY, JSON.stringify(value));
          return true;
        } catch (_error) {
          return false;
        }
      }

      setSubmissionControls({ draftDisabled, emailDisabled = false, busy = false }) {
        if (this.draftSubmit) {
          this.draftSubmit.disabled = draftDisabled;
          this.draftSubmit.toggleAttribute('aria-disabled', draftDisabled);
        }
        if (this.emailSubmit) {
          this.emailSubmit.disabled = emailDisabled;
          this.emailSubmit.toggleAttribute('aria-disabled', emailDisabled);
        }
        this.form.toggleAttribute('aria-busy', busy);
      }

      showConfirmed(reference, staffIdentifier, duplicate = false) {
        this.submissionState = 'confirmed';
        this.reference = reference;
        this.updateReferenceDisplay(reference);
        this.syncFallbackFields(reference);
        this.setSubmissionControls({ draftDisabled: true, emailDisabled: true });
        const template = this.strings.confirmed || 'Quotation {reference} is confirmed as {draft}.';
        this.setStatus(template.replace('{reference}', reference).replace('{draft}', staffIdentifier));
        const confirmation = this.querySelector('[data-rhino-draft-confirmation]');
        if (confirmation) {
          confirmation.hidden = false;
          confirmation.querySelector('[data-rhino-confirmed-reference]').textContent = reference;
          confirmation.querySelector('[data-rhino-confirmed-draft]').textContent = staffIdentifier;
          confirmation.dataset.duplicate = String(duplicate);
          confirmation.focus();
        }
      }

      async submitDraftOrder() {
        if (!this.automationEnabled || !this.draftClient) {
          this.setStatus(this.strings.automationUnavailable, true);
          return;
        }
        if (!this.form.reportValidity()) return;

        const values = this.formValues();
        let cart;
        let proxyStarted = false;
        try {
          this.submissionState = 'validating';
          this.setSubmissionControls({ draftDisabled: true, busy: true });
          this.setStatus(this.strings.submitting);
          const baselineReady = await this.baselinePromise;
          if (!baselineReady || !this.cartBaseline) {
            this.submissionState = 'failed';
            this.setSubmissionControls({ draftDisabled: false });
            this.setStatus(this.strings.automationUnavailable, true);
            return;
          }
          cart = await this.fetchCart();
          const currentCart = this.draftClient.canonicalJson(this.draftClient.cartMaterial(cart));
          if (this.cartBaseline && currentCart !== this.cartBaseline) {
            this.submissionState = 'failed';
            this.setSubmissionControls({ draftDisabled: false });
            this.setStatus(this.strings.cartChanged, true);
            return;
          }
          const discount = this.draftClient.discountRepresentation(cart);
          if (!discount.supported || this.draftClient.normalizeItems(cart).some((item) => item.sellingPlanId)) {
            this.submissionState = 'fallback';
            this.setSubmissionControls({ draftDisabled: true });
            this.setStatus(this.strings.fallbackRequired, true);
            return;
          }
          const nextFingerprint = await this.draftClient.fingerprint(cart, values);
          const totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
          const identity = this.draftClient.decideIdentity(this.readActiveRequest(), nextFingerprint, totalQuantity);
          if (identity.blocked) {
            this.submissionState = 'uncertain';
            this.setSubmissionControls({ draftDisabled: true, emailDisabled: true });
            this.setStatus(this.strings.uncertain, true);
            return;
          }
          this.reference = identity.reference;
          this.updateReferenceDisplay(this.reference);
          this.syncFallbackFields(this.reference);
          const active = this.readActiveRequest();
          if (identity.reuse && active?.state === 'confirmed' && active.staffIdentifier) {
            this.showConfirmed(identity.reference, active.staffIdentifier, true);
            return;
          }
          const cartToken = await this.draftClient.safeCartToken(cart.token);
          const payload = this.draftClient.buildPayload({ cart, values, quoteReference: this.reference, cartToken });
          if (!this.writeActiveRequest({
            fingerprint: nextFingerprint,
            cartMaterial: currentCart,
            reference: this.reference,
            state: 'submitting',
            startedAt: Date.now(),
          })) {
            throw new Error('STORAGE_UNAVAILABLE');
          }
          this.submissionState = 'submitting';
          proxyStarted = true;
          const response = await fetch(this.dataset.proxyEndpoint || '/apps/rhino-quote-draft', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          let body = null;
          try { body = await response.json(); } catch (_error) { body = null; }
          const result = this.draftClient.classifyResponse(response.status, body);
          if (result.kind === 'confirmed' && result.reference === this.reference) {
            this.writeActiveRequest({
              fingerprint: nextFingerprint,
              cartMaterial: currentCart,
              reference: this.reference,
              state: 'confirmed',
              staffIdentifier: result.staffIdentifier,
              confirmedAt: Date.now(),
            });
            this.showConfirmed(this.reference, result.staffIdentifier, result.duplicate);
            return;
          }
          if (result.kind === 'rejected' || result.kind === 'recoverable') {
            this.writeActiveRequest({
              fingerprint: nextFingerprint,
              cartMaterial: currentCart,
              reference: this.reference,
              state: result.kind === 'recoverable' ? 'retryable' : 'rejected',
              code: result.code,
            });
            this.submissionState = result.kind === 'recoverable' ? 'failed' : 'fallback';
            this.setSubmissionControls({ draftDisabled: result.kind === 'rejected' });
            this.setStatus(result.kind === 'rejected' ? this.strings.rejected : this.strings.submissionFailed, true);
            return;
          }
          throw new Error('UNCONFIRMED_RESULT');
        } catch (_error) {
          if (!proxyStarted) {
            this.submissionState = 'failed';
            this.setSubmissionControls({ draftDisabled: false });
            this.setStatus(this.strings.automationUnavailable || this.strings.submissionFailed, true);
            return;
          }
          const active = this.readActiveRequest();
          if (active?.state === 'submitting') this.writeActiveRequest({ ...active, state: 'uncertain', uncertainAt: Date.now() });
          this.submissionState = 'uncertain';
          this.setSubmissionControls({ draftDisabled: true, emailDisabled: true });
          this.setStatus(this.strings.uncertain, true);
        } finally {
          this.form.removeAttribute('aria-busy');
        }
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
