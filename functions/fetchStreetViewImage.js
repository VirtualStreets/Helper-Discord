const {get} = require("axios");
const STREET_VIEW_BASE_URL = 'https://maps.googleapis.com/maps/api/streetview';
const { GOOGLE_API_KEY } = require('../config');


module.exports = async (lat, lng, heading, pitch, fov) => {
    const url = `${STREET_VIEW_BASE_URL}?size=1600x900&location=${lat},${lng}&heading=${heading}&pitch=${pitch-90}&fov=${fov}&key=${GOOGLE_API_KEY}`;

    const response = await get(url, { responseType: 'arraybuffer' });
    return response.data;
}
