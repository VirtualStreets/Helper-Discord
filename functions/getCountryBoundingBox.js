const {get} = require("axios");

module.exports = async (country) => {
    const response = await get(`https://nominatim.openstreetmap.org/search?country=${encodeURIComponent(country)}&format=json&limit=1`);

    if (response.data.length === 0) {
        console.log('No results found');
        return;
    }

    const { boundingbox } = response.data[0];
    const bbox = {
        minLat: boundingbox[0],
        maxLat: boundingbox[1],
        minLon: boundingbox[2],
        maxLon: boundingbox[3]
    };

    return bbox;
}
