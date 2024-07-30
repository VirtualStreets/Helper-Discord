const {get} = require("axios");
module.exports = async (apiKey, lat, lng) => {
    const url = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${apiKey}`;
    const response = await get(url);

    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error: ${response.status}, ${response.statusText}`);
    }
}
