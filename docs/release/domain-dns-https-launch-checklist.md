# Domain, DNS, and HTTPS Launch Checklist

## Purpose

This checklist verifies that Rhino Lapidary has a clean canonical domain, correct DNS routing, working HTTPS, and predictable redirects before production launch.

## Canonical domain decision

The canonical production storefront host is:

```text
TODO: www.rhinolapidary.com or rhinolapidary.com
```

Decision owner:

```text
TODO
```

Decision date:

```text
TODO
```

## Recommended strategy

Use one canonical customer-facing hostname.

Recommended default:

```text
www.rhinolapidary.com
```

Use the root domain only as a redirect unless there is a business reason to make the root canonical.

The final decision must match Shopify Admin → Settings → Domains.

## Domain inventory

| Host                                                  | Current platform     | Future behavior                           | Shopify status | SSL/TLS status  | Owner | Notes                               |
| ----------------------------------------------------- | -------------------- | ----------------------------------------- | -------------- | --------------- | ----- | ----------------------------------- |
| rhinolapidary.com                                     | TODO                 | Redirect to canonical                     | TODO           | TODO            | TODO  | Root domain                         |
| [www.rhinolapidary.com](http://www.rhinolapidary.com) | TODO                 | Canonical or redirect                     | TODO           | TODO            | TODO  | Recommended canonical               |
| rhino-lapidary.myshopify.com                          | Shopify              | Shopify-native fallback                   | Connected      | Shopify-managed | TODO  | Permanent Shopify store domain      |
| Legacy Weebly host                                    | TODO                 | Retire after redirects verified           | N/A            | TODO            | TODO  | Confirm actual legacy configuration |
| The Gem Shop Rhino URLs                               | The Gem Shop Shopify | Canonical/redirect/keep decision required | N/A            | N/A             | TODO  | See redirect architecture           |

## Shopify admin locations

Review:

* Shopify Admin → Settings → Domains
* Shopify Admin → Online Store → Navigation → URL redirects
* Shopify Admin → Settings → Customer events
* Shopify Admin → Online Store → Preferences
* DNS provider or Cloudflare dashboard
* Legacy Weebly account, if still controlling any hostname

## DNS requirements

Before launch:

* [ ] Canonical hostname points to Shopify as required by Shopify’s domain setup.
* [ ] Root/non-root redirect behavior is decided.
* [ ] No legacy Weebly DNS records still serve the canonical hostname.
* [ ] No stale Cloudflare page rules conflict with Shopify routing.
* [ ] No proxy/CDN setting blocks Shopify SSL issuance.
* [ ] DNS TTL is reduced before launch if the provider allows it.
* [ ] DNS record changes are documented with timestamp and owner.

## HTTPS requirements

* [ ] Canonical domain loads over HTTPS.
* [ ] Non-canonical domain redirects to HTTPS canonical URL.
* [ ] `http://` requests redirect to `https://`.
* [ ] Browser shows no certificate warning.
* [ ] Shopify Admin reports SSL/TLS as active.
* [ ] Mixed-content warnings are absent.
* [ ] Product images, videos, manuals, and embedded assets load over HTTPS.
* [ ] Legacy links do not force customers back to HTTP.

## Redirect behavior

Expected behavior:

| Input                                  | Expected output                                                                   |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| `http://rhinolapidary.com`             | `https://CANONICAL_HOST/`                                                         |
| `https://rhinolapidary.com`            | `https://CANONICAL_HOST/`                                                         |
| `http://www.rhinolapidary.com`         | `https://CANONICAL_HOST/`                                                         |
| `https://www.rhinolapidary.com`        | `https://CANONICAL_HOST/`                                                         |
| `https://rhino-lapidary.myshopify.com` | Redirect or remain Shopify fallback, depending on Shopify primary-domain behavior |
| Legacy Weebly product/category URLs    | Target Shopify URLs from redirect map                                             |

## Verification commands

Replace hosts with the final values.

```powershell
curl.exe -I http://rhinolapidary.com
curl.exe -I https://rhinolapidary.com
curl.exe -I http://www.rhinolapidary.com
curl.exe -I https://www.rhinolapidary.com
```

Expected:

* HTTP should return a redirect.
* HTTPS should return a successful storefront response or redirect to the canonical HTTPS host.
* No response should serve a legacy Weebly page after launch.

## Browser verification

* [ ] Open canonical homepage in a clean browser profile.
* [ ] Open root/non-root alternate hostname.
* [ ] Open HTTP version.
* [ ] Open `.myshopify.com` fallback.
* [ ] Confirm the address bar ends on the intended canonical host.
* [ ] Confirm no SSL warning.
* [ ] Confirm cart works on canonical host.
* [ ] Confirm checkout can be reached.
* [ ] Confirm product media loads.

## Launch blocker

Production launch is blocked if:

* Canonical domain is undecided.
* SSL/TLS is not active.
* HTTP does not redirect to HTTPS.
* Root and `www` serve different storefronts.
* Legacy Weebly still serves the canonical host.
* Checkout cannot be reached from the canonical host.
* Product media or scripts fail because of mixed content.

## Evidence

Attach:

* Screenshot of Shopify domain status.
* Screenshot or copied DNS records.
* `curl -I` output for each host.
* Browser screenshot of canonical homepage.
* Link to redirect map.
