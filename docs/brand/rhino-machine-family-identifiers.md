# Rhino Machine Family Visual Identifiers

**PBI:** B-012  
**Status:** Approved foundation  
**Owner:** Product Data, Brand, Technical, Engineering, and Shopify Admin  
**Last reviewed:** 2026-07-31

## Purpose

Machine family identifiers help customers connect machines, accessories,
consumables, replacement parts, manuals, and support content.

An identifier is not proof of compatibility. It provides orientation. Product
compatibility requires a separate approved relation.

## Launch family set

| Stable key | Display name | Short code | Status |
|---|---|---|---|
| `em_1` | EM-1 | EM1 | Active identity |
| `beadmaster` | BeadMaster | BDM | Active identity |
| `shapemaster` | ShapeMaster | SHM | Active identity |
| `trimmaster` | TrimMaster | TRM | Active identity; exact model size remains under technical review |
| `lapmaster` | LapMaster | LPM | Active identity |
| `sawmaster` | SawMaster | SWM | Active identity |
| `jademaster` | JadeMaster | JDM | Family name approved; machine type and specifications remain under technical review |
| `tumblemaster` | TumbleMaster | — | Unavailable; no storefront identifier |

The identifier describes the family only. It must not display unresolved
voltage, motor, size, speed, or compatibility information.

## Identifier anatomy

A complete identifier contains:

1. A family icon or monogram
2. The visible family name
3. An optional short code for compact technical use
4. A common Rhino accent
5. A programmatic family reference

Example:

```text
[family icon] SawMaster
SWM