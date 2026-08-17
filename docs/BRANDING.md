# Branding

## Current identity

This fork currently uses the **Minimal Studios** mark as its provisional product
branding. The Chrome extension icon keeps the complete supplied blue/charcoal
crossed-brush logo uncut, scales it to the full available width and centers it
on a transparent square background. The same asset is exported at the
Chrome-required 16, 32, 48 and 128 pixel sizes.

The branding is intentionally separate from the product architecture: replacing
the mark only requires changing the files in `extension/icons/` and rebuilding
the extension. No capture, export or permission logic depends on the logo.

## Asset inventory

| Asset | Purpose |
| --- | --- |
| `extension/icons/minimal-studios-icon.png` | Transparent square master artwork kept in the repository |
| `extension/icons/icon-16.png` | Browser toolbar / compact UI |
| `extension/icons/icon-32.png` | Extension surfaces and menus |
| `extension/icons/icon-48.png` | Extension management page |
| `extension/icons/icon-128.png` | Installation and Chrome Web Store scale |

The source artwork was provided by the fork maintainer. The icon derivative
preserves the complete original mark; because Chrome toolbar icons are square
while the mark is wide, it fills the horizontal area and remains transparently
centered vertically. The assets contain no user data or runtime state.

## Naming and attribution

The product remains **ChatGPT Exporter** so that its purpose is immediately
understandable to users and compatible with the upstream project. “Minimal
Studios” identifies the current fork branding, not a claim that the fork is an
official OpenAI or upstream project.
