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
