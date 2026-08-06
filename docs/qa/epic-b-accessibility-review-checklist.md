# Epic B Accessibility Review Checklist

**PBI:** B-029  
**Status:** Framework complete; PBI remains open until B-020 motion rules and all applicable brand-system PBIs are reviewed  
**Target:** WCAG 2.2 AA and the repository storefront quality baseline

## 1. Color and contrast

- [ ] Normal text has at least 4.5:1 contrast.
- [ ] Large text has at least 3:1 contrast.
- [ ] UI controls, focus indicators, icons conveying meaning, and component boundaries have at least 3:1 contrast where required.
- [ ] White normal text is not placed on logo red `#ED1C24`.
- [ ] Workshop gold is not used as text on white.
- [ ] Primary filled actions use Action Red `#B51820` with white text.
- [ ] Link red `#A3151C` remains visibly distinct from surrounding text and is underlined or otherwise identifiable without color alone.
- [ ] Sale, error, warning, compatibility, warranty, and machine-family meanings include text or an icon in addition to hue.
- [ ] Dark and light logo variants are tested on their approved backgrounds.
- [ ] Forced-color and high-contrast modes retain understandable controls and labels.

## 2. Typography and text scaling

- [ ] Body text remains readable at 200% browser zoom.
- [ ] Layout reflows without horizontal page scrolling at a 320 CSS px equivalent viewport, except for genuinely two-dimensional tables that receive an accessible overflow treatment.
- [ ] Heading levels follow document hierarchy rather than visual size.
- [ ] All-caps text is limited to short labels and badges.
- [ ] Product names, variants, dimensions, and model numbers wrap without overlap or clipping.
- [ ] Technical values use tabular numerals where alignment assists comparison.
- [ ] Letter spacing is not compressed to imitate the striped logo.
- [ ] No critical copy is embedded only in an image.

## 3. Focus and keyboard interaction

- [ ] Every interactive element has a visible keyboard focus indicator.
- [ ] Focus order follows the visual and semantic order.
- [ ] Focus is not obscured by sticky headers, drawers, or overlays.
- [ ] Logo links have an accessible name.
- [ ] Icon-only controls have accessible names.
- [ ] Modal, drawer, product-media zoom, quick-order, and filter interactions retain or restore focus correctly.
- [ ] Disabled controls are programmatically disabled and not represented by color alone.

## 4. Logo, icons, badges, and motifs

- [ ] The full logo is not displayed below its minimum legible size.
- [ ] The rhino mark used alone has adjacent or programmatic brand text where context requires it.
- [ ] Decorative motifs use empty alt text or CSS backgrounds.
- [ ] Technical icons have text labels or accessible names.
- [ ] Badges do not rely only on shape or color when the meaning affects purchase decisions.
- [ ] Connector lines and framed labels do not alter reading order.
- [ ] Decorative gear, armor, or line motifs are not announced by screen readers.

## 5. Photography and media

- [ ] Product media alt text identifies the product, view, and relevant configuration.
- [ ] Alt text does not claim that an accessory is included unless confirmed.
- [ ] Primary images show the complete product and do not crop essential controls or interfaces.
- [ ] Text overlays meet contrast requirements at every crop.
- [ ] Product-media zoom is keyboard operable.
- [ ] Captions or adjacent copy identify optional versus included components.
- [ ] Videos have captions.
- [ ] Instructional videos have transcripts or equivalent text instructions.
- [ ] No media auto-plays with sound.
- [ ] Motion and animated media respect `prefers-reduced-motion`.

## 6. Diagrams and specifications

- [ ] Diagram color is supplemented by labels, line styles, symbols, or numbering.
- [ ] Complex diagrams have an adjacent text description or data table.
- [ ] Connector lines do not imply inaccurate technical relationships.
- [ ] Specification tables have headings and associations understandable to assistive technology.
- [ ] Table overflow remains keyboard and touch usable.
- [ ] Units are written consistently and are understandable when read aloud.
- [ ] Downloadable specification or warranty documents are identified by file type and purpose.

## 7. Forms and states

- [ ] Inputs have persistent labels.
- [ ] Required fields are identified in text and programmatically.
- [ ] Errors identify the affected field and explain recovery.
- [ ] Error, success, and loading messages are announced where appropriate.
- [ ] Placeholder text is not the only label.
- [ ] Color is not the only difference among default, error, success, disabled, and loading states.
- [ ] Customer-data forms receive privacy review.
- [ ] Support contact methods remain usable without relying on an embedded third-party form.

## 8. Motion

B-029 cannot close until B-020 defines and validates:

- [ ] Reduced-motion behavior
- [ ] Scroll reveal policy
- [ ] Loading and progress indicators
- [ ] Cart and quick-order state transitions
- [ ] Video and media transition behavior
- [ ] Animation duration and cancellation
- [ ] No flashing or rapid repeated movement

## 9. PBI evidence map

| PBI | Required accessibility evidence |
|---|---|
| B-004 | Desktop and mobile style-direction review; reading and specification density review |
| B-005 | Contrast matrix and semantic color review |
| B-006 | Zoom, wrapping, heading hierarchy, and long-name tests |
| B-007 | Reflow, spacing, panel boundaries, and dense table tests |
| B-008 | Keyboard focus and state tests for every CTA class |
| B-009 | Form labeling, errors, live regions, and recovery tests |
| B-010 | Badge meaning without color |
| B-011 | Icon labels and decorative-icon handling |
| B-012 | Machine-family identifiers with text or symbols |
| B-013 | Diagram descriptions and noncolor distinctions |
| B-014 | Texture contrast and readability |
| B-015 | Logo contrast, minimum size, and accessible name |
| B-016 | Small-icon recognition and browser-context tests |
| B-017 | Social-image text legibility and metadata |
| B-018 | Alt text, crop, zoom, and included-item clarity |
| B-019 | Captions, transcripts, keyboard controls, and embed privacy |
| B-020 | Reduced motion and state-announcement evidence |
| B-021–B-024 | Plain language, link purpose, policy readability, and claim clarity |
| B-025–B-028 | Token, CSS, section, and theme-setting implementation evidence |
| B-035 | Complete preview accessibility report |

## 10. Evidence requirements

For every implemented brand PBI, record:

- Preview URL or theme
- Commit or admin change record
- Tested page and product fixture
- Viewport
- Browser
- Keyboard result
- Automated accessibility result
- Manual contrast or screen-reader result where applicable
- Known limitations
- Reviewer
- Date

Use:

`docs/qa/manual-qa-evidence-template.md`

Run the repository’s canonical accessibility command from `README.md` or `package.json`. Resolve the current documentation/script naming discrepancy before treating either name as a release gate.

## 11. Closure rule

B-029 remains **In progress** after this checklist is adopted. It closes only when:

1. B-020 is complete.
2. Applicable design-system PBIs include evidence.
3. The checklist has been exercised against the first preview implementation slice.
4. Any introduced P0 accessibility defects are resolved or block release.