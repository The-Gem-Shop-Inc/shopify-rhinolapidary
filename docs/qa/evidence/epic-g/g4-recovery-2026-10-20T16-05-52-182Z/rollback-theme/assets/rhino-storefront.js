(() => {
    const namespace = window.RhinoLapidary = window.RhinoLapidary || {};
    const policyBodySelector = '.shopify-policy__body';
    const inlineColorSelector = '[style*="color" i]';

    namespace.version = '0.1.1';

    function removeInlineColor(element) {
        if (!element?.style?.color) {
            return;
        }

        element.style.removeProperty('color');

        if ((element.getAttribute('style') || '').trim() === '') {
            element.removeAttribute('style');
        }
    }

    function normalizePolicyInlineColors(root = document) {
        const bodies = root.matches?.(policyBodySelector)
            ? [root]
            : [...root.querySelectorAll?.(policyBodySelector) || []];

        for (const body of bodies) {
            for (const element of body.querySelectorAll(inlineColorSelector)) {
                removeInlineColor(element);
            }
        }
    }

    function observePolicyBody(body) {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (
                    mutation.type === 'attributes'
                    && mutation.attributeName === 'style'
                ) {
                    removeInlineColor(mutation.target);
                    continue;
                }

                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE) {
                        continue;
                    }

                    normalizePolicyInlineColors(node);

                    if (node.matches?.(inlineColorSelector)) {
                        removeInlineColor(node);
                    }
                }
            }
        });

        observer.observe(body, {
            attributes: true,
            attributeFilter: ['style'],
            childList: true,
            subtree: true,
        });

        return observer;
    }

    function initPolicyColorNormalization() {
        const policyBodies = [...document.querySelectorAll(policyBodySelector)];

        if (policyBodies.length === 0) {
            return;
        }

        normalizePolicyInlineColors();
        namespace.policyColorObservers = policyBodies.map(observePolicyBody);
    }

    namespace.normalizePolicyInlineColors = normalizePolicyInlineColors;

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initPolicyColorNormalization,
            { once: true },
        );
    } else {
        initPolicyColorNormalization();
    }
})();

// G3A enhances only an existing F-approved section; it never constructs Product relationships.
(() => {
    const receiptExpiresAt = Date.parse('2026-10-22T20:26:37.102Z');
    const selector = '[data-rhino-machine-browse]';
    const receiptCurrent = () => Number.isFinite(Date.now()) && Date.now() < receiptExpiresAt;

    function enhanceMachineProductEntry() {
        if (!receiptCurrent()) {
            document.querySelectorAll(selector).forEach((entry) => entry.parentElement.remove());
            return;
        }

        for (const info of document.querySelectorAll('main product-info')) {
            const section = info.querySelector('.rhino-machine-contextual');
            const target = section?.querySelector('h2[id^="OwnerContext-"]');
            const contact = info.querySelector('a.rhino-machine-contact');
            if (!target || !contact || !section.querySelector('[data-rhino-owner-compatible]')
                || document.querySelectorAll('[id="' + target.id + '"]').length !== 1
                || info.querySelector(selector)) continue;

            const wrapper = document.createElement('p');
            const link = document.createElement('a');
            link.className = 'link underlined-link';
            link.dataset.rhinoMachineBrowse = '';
            link.href = '#' + target.id;
            link.textContent = 'Browse compatible products';
            wrapper.append(link);
            contact.before(wrapper);
            target.tabIndex = -1;

            const offsetTarget = () => {
                const header = document.querySelector('.section-header');
                const height = header?.getBoundingClientRect().height || 0;
                target.style.scrollMarginTop = (height + 16) + 'px';
            };
            const focusTarget = () => {
                if (!receiptCurrent() || !target.isConnected) {
                    wrapper.remove();
                    return;
                }
                offsetTarget();
                target.focus({ preventScroll: true });
                target.scrollIntoView({ block: 'start', behavior: 'instant' });
            };
            link.addEventListener('click', (event) => {
                if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.button !== 0) return;
                offsetTarget();
                // Retain the native anchor URL/history, then place keyboard focus at its heading.
                requestAnimationFrame(focusTarget);
            });
            const followFragment = () => {
                if (window.location.hash === '#' + target.id) requestAnimationFrame(focusTarget);
            };
            window.addEventListener('hashchange', followFragment);
            followFragment();
            setTimeout(() => wrapper.remove(), Math.min(receiptExpiresAt - Date.now(), 2147483647));
        }
    }

    window.RhinoLapidary.enhanceMachineProductEntry = enhanceMachineProductEntry;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceMachineProductEntry, { once: true });
    } else enhanceMachineProductEntry();
    document.addEventListener('shopify:section:load', enhanceMachineProductEntry);
    window.addEventListener('pageshow', enhanceMachineProductEntry);
    document.addEventListener('visibilitychange', enhanceMachineProductEntry);
})();
