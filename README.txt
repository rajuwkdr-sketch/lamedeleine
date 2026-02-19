# La Madeleine Location & Review Data Processing

## Overview

This project extracts location data from the La Madeleine website using the WordPress REST API and associates it with a provided Google Reviews dataset.

The solution consists of two main stages:

1. Extract all restaurant locations via API
2. Associate Google Reviews with locations and calculate aggregated metrics

---

## Project Structure

```
├── index.js                     # Extracts location data from API
├── merger.js                    # Merges location data with review data
├── locations.csv                # Extracted location dataset
├── googleReview.csv             # Provided Google Reviews dataset
├── locations_with_reviews.csv   # Final merged output
├── package.json
├── package-lock.json
└── .gitignore
```

---

## Step 1 – Extract Location Data

The script `index.js` retrieves all restaurant locations from the WordPress REST API:

```
https://lamadeleine.com/wp-json/wp/v2/restaurant-locations
```

It extracts the following fields:

- locationName
- postalCode
- streetAddress
- streetAddress2
- fullAddress
- city
- state
- storeID

Output:
```
locations.csv
```

Run:

```
node index.js
```

---

## Step 2 – Associate Locations with Reviews

The script `merger.js` merges the extracted location data with the provided Google Reviews dataset.

### Matching Logic

The Google Reviews dataset includes a `website` field in the format:

```
https://lamadeleine.com/locations/{slug}
```

To associate reviews with locations:

1. A slug is extracted from the `website` field
2. A matching slug is generated from:
   ```
   city + locationName
   ```
3. Reviews are grouped by slug using a lookup map
4. Aggregated metrics are calculated:
   - reviewCount
   - avgRating

Output:
```
locations_with_reviews.csv
```

Run:

```
node merger.js
```

---

## Installation

After cloning the repository, install dependencies:

```
npm install
```

Then run:

```
node index.js
node merger.js
```

---

## Output Fields (Final Dataset)

- locationName
- postalCode
- streetAddress
- streetAddress2
- fullAddress
- city
- state
- storeID
- reviewCount
- avgRating

---

## Technical Highlights

- Used WordPress REST API instead of HTML scraping
- Implemented defensive data handling (optional chaining, fallbacks)
- Used hash-map based grouping for efficient review association (O(n))
- Implemented slug-based matching strategy for reliable location mapping
- Clean, modular structure with reusable scripts

---

## Notes

Not all locations contain reviews in the provided dataset.  
Locations without matching review slugs are assigned:

```
reviewCount = 0
avgRating = 0
```

This behavior is intentional and reflects dataset coverage.

---

## Author

Assessment project submission.
