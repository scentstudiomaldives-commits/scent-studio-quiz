# Testing Checklist

## Quiz flow
- [ ] Welcome screen shows both "Take the Scent Quiz" and "Find Something Similar"
- [ ] Each question shows one at a time with a working progress bar
- [ ] Previous/Continue navigation works at every step
- [ ] Continue is disabled until a required question is answered
- [ ] Optional questions (disliked notes, loved perfume) can be skipped
- [ ] Multi-select questions allow multiple choices with visible selected state
- [ ] Selecting "None" under disliked notes clears other selections (and vice versa)
- [ ] Refreshing mid-quiz restores progress (sessionStorage)
- [ ] "I'm open to slightly higher-priced suggestions" checkbox affects results

## Recommendation engine
- [ ] Out-of-stock products never appear in results (test by setting a sample product's
      Shopify inventory to 0)
- [ ] Admin-excluded products never appear (toggle "Exclude" in `/admin/products`)
- [ ] Selecting a disliked note that's in a product's notes visibly lowers its score
- [ ] Match % changes when scoring weights are changed in `/admin/weights`
- [ ] Setting a low budget with "allow higher" unchecked filters out expensive products
- [ ] Setting a low budget with "allow higher" checked still shows some pricier options,
      scored lower
- [ ] Gender preference influences but doesn't exclude (a "Women" search can still surface
      a strong unisex match)
- [ ] Taking the quiz with very narrow/contradictory preferences triggers the
      "not enough strong matches" message instead of forcing weak results

## Results page
- [ ] Scent profile summary reflects the answers given
- [ ] Top 3 matches show image, brand, price (MVR), match %, stock, families, notes,
      occasions, performance, climate fit, and a personalised reason
- [ ] "View Product" opens the real Shopify product page
- [ ] "Add to Cart" creates a cart and redirects to Shopify checkout
- [ ] "Retake Quiz" clears state and restarts cleanly
- [ ] "Share My Results" copies/shares a working link
- [ ] Opening a shared results link on a fresh device/browser reconstructs the same
      recommendations
- [ ] Comparison table renders correctly for 2-3 products

## Find Something Similar
- [ ] Typing a perfume name shows live autocomplete suggestions
- [ ] Selecting a suggestion returns relevant, in-stock similar products
- [ ] Searching for a perfume with no close matches shows a graceful fallback message

## Admin dashboard
- [ ] `/admin` prompts for basic-auth credentials and rejects wrong passwords
- [ ] Product attributes save correctly and persist on reload
- [ ] Scoring weights reject totals that don't sum to 100%
- [ ] Budget ranges can be added/edited and immediately affect quiz results
- [ ] Analytics page shows real session counts, top scent families, top recommended
      products, and add-to-cart conversion rate

## Responsive / performance / accessibility
- [ ] Full quiz usable one-handed on a small phone screen (test at 360px width)
- [ ] All interactive elements have visible focus states (keyboard tab through the quiz)
- [ ] Images lazy-load and don't cause layout shift
- [ ] Page loads reasonably fast on a throttled 3G connection (Shopify data is cached 5 min)
- [ ] No console errors in production build (`npm run build && npm run start`)
