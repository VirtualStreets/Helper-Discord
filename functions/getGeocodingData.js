const {get} = require("axios");
module.exports = async (lat, lng) => {
    // Construct the URL for the Nominatim API
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

    // Make the request to the API
    const response = await get(url);

    // Check if the request was successful
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error: ${response.status}, ${response.statusText}`);
    }}
