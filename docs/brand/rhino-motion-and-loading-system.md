# Rhino Motion and Loading System

**PBI:** B-020  
**Status:** Approved foundation  
**Owner:** Brand, Engineering, Accessibility, Performance, and QA  
**Last reviewed:** 2026-08-04

## Purpose

Rhino motion communicates interaction, state, and mechanical relationships.

It must not distract from specifications, suggest machine behavior that has not
been verified, or delay a customer trying to evaluate or purchase a product.

## Launch decision

Rhino will not use decorative brand animation at launch.

Launch motion is limited to:

- Interaction feedback
- Disclosure and drawer transitions
- Cart and quick-order state changes
- Loading indicators
- Product-media controls
- Focus and hover feedback
- Optional educational diagrams where movement is necessary to understand a
  verified process

The following Trade setting should be disabled during the later B-026 theme
settings implementation:

`animations_reveal_on_scroll: false`

Do not select the Trade vertical-lift or 3d-lift hover modes for launch.

## Motion categories

### Immediate feedback

Used for:

- Button press
- Checkbox or radio selection
- Focus treatment
- Link underline change
- Quantity-control state

Target duration:

`80 ms`

### Standard interface transition

Used for:

- Accordion expansion
- Filter disclosure
- Cart notification
- Small state change
- Thumbnail selection
- Inline validation

Target duration:

`160 ms`

### Overlay transition

Used for:

- Drawer
- Modal
- Product media lightbox
- Large mobile navigation panel

Target duration:

`240 ms`

No ordinary interface transition should exceed 300 ms.

## Approved easing

### Standard

`cubic-bezier(0.2, 0, 0, 1)`

Use for entering, expanding, and ordinary state changes.

### Exit

`cubic-bezier(0.4, 0, 1, 1)`

Use for closing and removal when an exit transition improves comprehension.

Avoid:

- Elastic easing
- Bounce
- Overshoot
- Spring animation
- Repeated pulsing
- Long deceleration that makes controls feel unresponsive

## Approved motion

- Opacity change
- Small color or border transition
- Small transform no greater than 8 px when needed to show layering
- Drawer or modal entrance
- Accordion height behavior already supplied by the theme
- Rotational spinner used only during an active operation
- Progress indicator tied to measurable progress
- Verified flow or rotation arrows inside an instructional diagram

## Prohibited motion

- Parallax
- Auto-advancing product or content carousels
- Decorative logo animation
- Charging, striking, or running Rhino animations
- Continuously moving geological textures
- Shimmering skeletons
- Pulsing CTA buttons
- Bouncing sale badges
- Moving backgrounds
- Animated gears used as decoration
- 3D product-card lift
- Hover movement that causes adjacent layout shift
- Animation that begins only because content entered the viewport
- Animation libraries for ordinary interface behavior

## Reduced motion

When `prefers-reduced-motion: reduce` is active:

- Disable nonessential animation.
- Remove transform-based entrance movement.
- Replace smooth scrolling with immediate scrolling.
- Stop loading spinner rotation where visible loading text remains.
- Show the final state of educational motion diagrams.
- Do not auto-play video or animated images.
- Preserve state changes through color, border, icon, and text.
- Preserve focus movement and focus visibility.
- Do not hide useful content because its animation was removed.

Reduced-motion handling is a required state, not an optional enhancement.

## Loading-state principles

1. Keep the existing layout stable.
2. Name the operation when practical.
3. Prevent duplicate submission.
4. Use `aria-busy="true"` on the affected region.
5. Announce completion or failure through the appropriate live region.
6. Preserve the customer’s prior valid state after failure.
7. Avoid indefinite animation without visible context.
8. Do not use a skeleton when the final layout is too variable for an accurate
   placeholder.
9. Do not replace every word with gray blocks.
10. Do not use loading motion as brand decoration.

## Context rules

### Search and filters

- Retain the current results until new results are available.
- Mark the results region busy.
- Keep filter controls operable only when concurrent changes are safe.
- Announce the new result count.
- Do not clear the page while loading.

### Cart and quick order

- Keep line dimensions stable.
- Identify the affected line.
- Prevent duplicate updates to the same line.
- Preserve the last valid quantity after failure.
- Announce added, updated, removed, and failed states.
- Do not animate price or quantity changes in a way that obscures the new value.

### Product media

- Use a stable poster or media frame.
- Show loading text when a large asset takes noticeable time.
- Do not display a blank black rectangle.
- Avoid loading all media variants before the customer requests them.

### Forms

- Preserve entered values.
- Change the submit label to a specific progressive label, such as:
    - `Submitting…`
    - `Adding…`
    - `Updating…`
- Restore the original label after success or failure.
- Move focus only when required for error recovery or completion.

### Video

- Load the poster first.
- Do not load a third-party player until the customer activates the video.
- The play control must remain visible and keyboard operable.
- Show a loading state between activation and player readiness.

## Skeletons

Skeletons are allowed only for:

- A stable repeated row
- A stable product-card shell
- A stable media ratio

Skeletons:

- Do not shimmer.
- Use Mist and Alloy.
- Have the same dimensions as the expected content.
- Are hidden from assistive technology.
- Must not replace a real status message.

## Technical motion

Motion inside a technical diagram must:

- Come from an approved technical source.
- Have an adjacent static explanation.
- Use arrows, line style, and labels in addition to movement.
- Provide a static reduced-motion state.
- Avoid implying speed, direction, flow rate, or sequence not supported by
  evidence.
- Never become the only explanation of a safety or maintenance process.

## JavaScript constraints

- Prefer existing Trade behavior and CSS.
- Do not add a JavaScript animation dependency.
- New Rhino JavaScript must follow the repository JavaScript architecture.
- New storefront events require the established event-contract process.
- Use animation frames only for behavior that cannot be expressed through CSS
  or native media controls.
- Stop observers and timers when their component disconnects.

## QA

Test:

- Keyboard operation
- `prefers-reduced-motion`
- Cart update success and failure
- Quick-order update success and failure
- Search and filter refresh
- Drawer and modal focus
- Product media loading
- Video activation
- Slow network simulation
- 200% zoom
- Mobile Safari and mobile Chrome
- Desktop Chrome, Edge, and Safari

## Completion condition

B-020 closes when this guide is approved and its motion tokens are registered.

Motion implementation occurs in the relevant component PBIs rather than through
a global animation pass.