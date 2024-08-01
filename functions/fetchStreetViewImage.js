const {get} = require("axios");
const settings = require("../settings.json");
const STREET_VIEW_BASE_URL = 'https://maps.googleapis.com/maps/api/streetview';

module.exports = async (lat, lng, heading, pitch) => {
    const url = `${STREET_VIEW_BASE_URL}?size=1600x900&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&key=${settings.googleApiKey}`;

    const response = await get(url, { responseType: 'arraybuffer' });
    return response.data;
}
