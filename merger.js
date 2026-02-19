/**
 * merger.js
 *
 * This script:
 * 1. Loads previously extracted location data (locations.csv)
 * 2. Loads provided Google Reviews dataset (googleReview.csv)
 * 3. Associates reviews with locations using a slug extracted from the website URL
 * 4. Aggregates review count and average rating per location
 * 5. Exports a merged dataset to locations_with_reviews.csv
 */

const fs = require("fs");
const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const locations = [];
const reviews = [];

function loadLocations() {
    return new Promise((resolve) => {
        fs.createReadStream("locations.csv")
            .pipe(csv())
            .on("data", (row) => {
                // Ensure storeID has no trailing spaces
                row.storeID = row.storeID.trim();
                locations.push(row);
            })
            .on("end", resolve);
    });
}

function loadReviews() {
    return new Promise((resolve) => {
        fs.createReadStream("googleReview.csv")
            .pipe(csv())
            .on("data", (row) => {
                reviews.push(row);
            })
            .on("end", resolve);
    });
}

/**
 * Convert a string into a URL-friendly slug.
 */
function slugify(str) {
    return String(str || "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

/**
 * Merge location data with review data.
 *
 * Matching logic:
 * - Extract slug from review.website (e.g. /locations/irving-macarthur)
 * - Generate a slug from location.city + location.locationName
 * - Match both values
 *
 * For each location:
 * - Count associated reviews
 * - Calculate average rating
 */
function mergeData() {

    // Build a lookup map of reviews grouped by slug
    const reviewMap = {};

    reviews.forEach(r => {

        if (!r.website) return;

        const slug = r.website
            .split("/locations/")[1]
            ?.replace("/", "")
            ?.trim();

        if (!slug) return;

        if (!reviewMap[slug]) {
            reviewMap[slug] = [];
        }

        reviewMap[slug].push(r);
    });

    // Merge review data into locations
    return locations.map(location => {

        // Combine city + locationName to recreate expected slug
        const combined = `${location.city} ${location.locationName}`;
        const locationSlug = slugify(combined);

        const locationReviews = reviewMap[locationSlug] || [];

        const reviewCount = locationReviews.length;

        const avgRating = reviewCount
            ? (
                locationReviews.reduce((sum, r) =>
                    sum + Number(r.reviewRating || 0), 0
                ) / reviewCount
            ).toFixed(2)
            : 0;

        return {
            ...location,
            reviewCount,
            avgRating
        };
    });
}

/**
 * Export merged dataset to CSV.
 * The output contains original location fields + reviewCount + avgRating.
 */
async function exportCSV(data) {

    const csvWriter = createCsvWriter({
        path: "locations_with_reviews.csv",
        header: Object.keys(data[0]).map(key => ({
            id: key,
            title: key
        }))
    });

    await csvWriter.writeRecords(data);
    console.log("Merged file successfully generated.");
}

/**
 * Main execution flow:
 * 1. Load locations
 * 2. Load reviews
 * 3. Merge datasets
 * 4. Export results
 */
(async () => {

    await loadLocations();
    await loadReviews();

    const merged = mergeData();

    await exportCSV(merged);

})();