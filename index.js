const axios = require("axios");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");

const API_URL = "https://lamadeleine.com/wp-json/wp/v2/restaurant-locations?per_page=150";

async function fetchLocations() {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error API:", error.message);
    }
}

function transformData(data) {
    return data.map(location => {

        const hero = location.acf?.locationHero || {};

        const streetAddress = hero.addressLine1 || "";
        const streetAddress2 = hero.addressLine2 || "";
        const city = hero.city || "";
        const state = hero.state || "";
        const postalCode = hero.zip || "";

        return {
            locationName: hero.storeName || location.title?.rendered || "",
            postalCode,
            streetAddress,
            streetAddress2,
            fullAddress: `${streetAddress} ${streetAddress2}, ${city}, ${state} ${postalCode}`.replace(/\s+/g, " ").trim(),
            city,
            state,
            storeID: hero.id || location.id
        };
    });
}

async function exportToCSV(data) {
    const csvWriter = createCsvWriter({
        path: "locations.csv",
        header: [
            { id: "locationName", title: "locationName" },
            { id: "postalCode", title: "postalCode" },
            { id: "streetAddress", title: "streetAddress" },
            { id: "streetAddress2", title: "streetAddress2" },
            { id: "fullAddress", title: "fullAddress" },
            { id: "city", title: "city" },
            { id: "state", title: "state" },
            { id: "storeID", title: "storeID" }
        ]
    });

    await csvWriter.writeRecords(data);
    console.log("CSV has been generated");
}

(async () => {
    const rawData = await fetchLocations();
    const formattedData = transformData(rawData);

    await exportToCSV(formattedData);
})();