# Landing page fonts

Self-hosted fonts for the marketing landing page. Drop `.woff2` files into
this directory with the exact filenames below, then uncomment the
`localFont` blocks in `app/(marketing)/layout.tsx`.

Intentionally not Google Fonts — the goal is typography that doesn't read
as "another AI SaaS template".

## Required files

### Display — editorial serif (Caudex)
Source: https://www.dafont.com/caudex.font

- `caudex-regular.woff2` (400)
- `caudex-bold.woff2` (700)

### Body — Overused Grotesk
Source: https://pangrampangram.com/products/overused-grotesk (free personal use)

- `overused-grotesk-regular.woff2` (400)
- `overused-grotesk-medium.woff2` (500)
- `overused-grotesk-semibold.woff2` (600)

## Converting .ttf / .otf → .woff2

Most Dafont downloads ship `.ttf` or `.otf`. Convert with either:

```bash
# Online (no install): https://cloudconvert.com/ttf-to-woff2
# Or locally with fonttools:
pip install fonttools brotli zopfli
pyftsubset input.ttf --output-file=output.woff2 --flavor=woff2 \
  --unicodes="U+0000-00FF,U+2000-206F,U+20AC,U+2122,U+2190-21FF"
```

The `unicodes` range above keeps the file small (Latin + common symbols)
— drop it to include the full glyph set if the design ever needs it.
