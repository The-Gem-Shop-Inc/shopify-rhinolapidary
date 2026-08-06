# Rhino Video Thumbnail and Embedded Video System

**PBI:** B-019  
**Status:** Approved foundation  
**Owner:** Content, Media, Technical, Accessibility, Privacy, Performance, and Engineering  
**Last reviewed:** 2026-08-04

## Purpose

Rhino videos should help customers select, operate, maintain, and support
technical equipment without imposing hidden third-party requests, inaccessible
instruction, or inconsistent visual treatment.

## Video categories

Every video receives one category:

- Product overview
- Setup
- Operation
- Maintenance
- Technique
- Troubleshooting
- Comparison
- Support
- Delivery and uncrating
- Replacement or installation

The category determines placement, review owner, and transcript requirements.

## Canonical source requirement

Before publication, record:

- Canonical channel or host
- Account owner
- Video owner
- Usage rights
- Video URL or Shopify file
- Upload date
- Last technical review
- Product or machine relation
- Caption status
- Transcript status
- Thumbnail owner
- Replacement or retirement status

Do not migrate an old Rhino or The Gem Shop video merely because it is publicly
available.

## Thumbnail composition

### Ratio

Use:

`16:9`

### Required elements

- Clear product or task image
- One short title
- Visible play control
- Optional category label
- Optional short duration
- Quiet Rhino ownership treatment

### Title

- Maximum two lines
- Approximately 45 characters when practical
- Sentence case
- Describes the customer task
- Does not repeat the full product page heading unnecessarily

Examples:

- Set up the EM-1 water system
- Replace a grinding wheel
- Prepare a SawMaster for delivery
- Clean the polishing area

Avoid:

- Watch now
- Amazing machine
- You won’t believe this
- Complete guide when the video is incomplete
- Unsupported performance claims
- Tiny title text embedded into an image

### Logo

The full horizontal logo is usually too detailed for a video thumbnail.

Use:

- Small Rhino mark
- Consistent corner placement
- Approved clear space
- No logo over the primary product detail

Do not use a large framed logo that competes with the video subject.

### Play control

- Centered or placed in a consistent clear area
- Minimum 48 px visible control
- High contrast
- Accompanied by an accessible button name
- Not baked into the thumbnail as the only control

## Poster ownership

Prefer a Rhino-controlled poster rather than loading a third-party thumbnail.

The poster follows:

- B-018 photography rules
- 16:9 safe crop
- 160 KB delivery target
- Stable dimensions
- sRGB
- Responsive delivery
- Alt text or accessible button label

## Embed decision

### Preferred launch behavior

Use click-to-load.

Before activation, render:

- Poster
- Video title
- Duration when known
- Play button
- Optional privacy notice
- Optional transcript link

Do not create the YouTube or Vimeo iframe until deliberate customer activation.

### Shopify-hosted video

Shopify-hosted product video may be used when:

- It fits the product-media workflow.
- Captions and controls meet requirements.
- File size and delivery are acceptable.
- It does not duplicate a heavier third-party player.

### Third-party video

YouTube or Vimeo requires:

- Privacy review
- Script or embed register review
- Performance evidence
- Consent behavior review
- Click-to-load
- Removal path
- Account ownership
- Caption verification

Do not install a video app merely to render an ordinary embed.

## Autoplay

Autoplay is not approved.

This includes:

- Muted autoplay
- Background hero video
- Auto-playing carousel video
- Video starting when it enters the viewport
- Video starting after an unrelated click

## Captions and transcripts

### Captions

Every instructional or spoken video requires synchronized captions.

Auto-generated captions must be reviewed for:

- Machine names
- Part names
- Units
- Grit
- Dimensions
- Safety terms
- Technical language

### Transcript

A transcript or equivalent complete written procedure is required for:

- Setup
- Maintenance
- Troubleshooting
- Installation
- Safety-relevant operation
- Technical comparison

The transcript should be HTML when practical rather than only a downloadable
document.

### Visual information

When essential information appears only visually, provide:

- Spoken description
- Captions where appropriate
- Adjacent written instructions
- Diagram or image alternative where useful

## Placement

### Product page

Use videos for:

- Overview
- Setup
- Maintenance
- Product-specific operation

Do not place a heavy player above essential price, availability, or purchase
information.

### Support page

Use videos beside:

- Written instructions
- Parts
- Manuals
- Contact or escalation path

### Education page

May contain several videos, but only the activated player should load its
third-party resources.

### Product card

Do not embed video.

A card may show a small `Video available` signal only when governed content
exists and the signal does not displace purchase-critical information.

## Mobile

- Preserve 16:9 ratio.
- Keep the play target at least 48 px.
- Keep title readable without becoming part of the poster bitmap.
- Do not force landscape orientation.
- Do not auto-enter fullscreen.
- Do not make transcript access dependent on opening the player.
- Test orientation changes and browser back behavior.

## Reduced motion

- No autoplay.
- No animated poster.
- No pulsing play control.
- No entrance animation.
- Player controls remain usable.
- Animated GIF previews are not approved.

## Performance

Before activation:

- No player iframe
- No player JavaScript
- No tracking request to the video provider
- One responsive poster
- Minimal Rhino CSS
- No video application dependency

After activation:

- Load only the selected player.
- Preserve layout dimensions.
- Show a specific loading state.
- Avoid loading several players concurrently.
- Remove or stop a prior player if the architecture permits only one.

## Privacy notice

When policy requires disclosure before loading a third party, use clear text:

`Playing this video loads content from {provider}.`

Do not use vague language such as:

`External content`

The exact consent behavior depends on the approved privacy architecture.

## Structured data

Future video implementation should coordinate with the SEO architecture for
VideoObject data.

Do not generate structured data unless these values are available:

- Name
- Description
- Thumbnail
- Upload date
- Duration
- Content URL or embed URL
- Publisher identity
- Associated product or page

Visible page content and structured data must agree.

## Video inventory follow-up

The video migration or education PBI must inventory:

- Title
- URL
- Host
- Channel owner
- Category
- Machine
- Age
- Current accuracy
- Caption status
- Transcript status
- Thumbnail quality
- Rights
- Privacy behavior
- Performance behavior
- Keep, revise, replace, or retire decision

## Completion condition

B-019 closes when this system is approved.

No player, app, or video upload is required to close the planning PBI.