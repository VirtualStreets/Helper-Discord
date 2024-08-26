const axios = require('axios');

/**
 * Fetches a static map image with optional multiple markers styled as red circles.
 *
 * @param {number} lat - Latitude of the center of the map.
 * @param {number} lng - Longitude of the center of the map.
 * @param {number} zoom - Zoom level of the map.
 * @param {number} width - Width of the map image.
 * @param {number} height - Height of the map image.
 * @param {string} apiKey - Google Maps API key.
 * @param {Array<Object>} markers - Array of marker objects {lat: number, lng: number}.
 * @param {string} markerStyle - Style of the marker ('default' for pin, 'circle' for red circles).
 * @param {number} circleRadius - Radius of the circles (in degrees, e.g., 0.01).
 * @param {string} circleColor - Color of the circles (e.g., 'red').
 * @returns {Buffer} - The image buffer.
 */
async function getStaticMap(
    lat,
    lng,
    zoom = 15,
    width = 600,
    height = 300,
    apiKey,
    markers = [],
    markerStyle = 'circle',
    circleRadius = 0.01,
    circleColor = 'red'
) {
    if (!apiKey) {
        throw new Error('API key is required');
    }

    const size = `${width}x${height}`;

    let url;

    if (markers.length === 1 && markerStyle === 'default') {
        // Use default marker style (pin) when there's only one marker and 'default' is selected
        const marker = markers[0];
        const markerParams = `markers=${marker.lat},${marker.lng}`;
        url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&${markerParams}&key=${apiKey}`;
    } else {
        // Use custom circle markers when there are multiple markers or when 'circle' style is selected
        const pathParams = markers.map(marker =>
            `path=fillcolor:${circleColor}%7Ccolor:${circleColor}%7Cenc:${encodeCircle(marker.lat, marker.lng, circleRadius)}`
        ).join('&');

        url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&${pathParams}&key=${apiKey}`;
    }

    const response = await axios.get(url, { responseType: 'arraybuffer' });
    if (response.status !== 200) {
        throw new Error('Failed to fetch the static map');
    }

    return response.data;
}

/**
 * Encodes the coordinates for a circle into the Polyline encoding format.
 *
 * @param {number} lat - Latitude of the circle's center.
 * @param {number} lng - Longitude of the circle's center.
 * @param {number} radius - Radius of the circle.
 * @returns {string} - Encoded polyline string representing the circle.
 */
function encodeCircle(lat, lng, radius) {
    const numPoints = 32; // Number of points to define the circle
    const points = [];

    for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * (2 * Math.PI);
        const pointLat = lat + radius * Math.cos(angle);
        const pointLng = lng + radius * Math.sin(angle);
        points.push({ lat: pointLat, lng: pointLng });
    }

    return encodePolyline(points);
}

/**
 * Encodes an array of coordinates into the Google Maps polyline encoding format.
 *
 * @param {Array<Object>} points - Array of points with lat and lng.
 * @returns {string} - Encoded polyline string.
 */
function encodePolyline(points) {
    let lastLat = 0;
    let lastLng = 0;
    let result = '';

    points.forEach(point => {
        let lat = Math.round(point.lat * 1e5);
        let lng = Math.round(point.lng * 1e5);

        let dLat = lat - lastLat;
        let dLng = lng - lastLng;

        result += encodeSignedNumber(dLat) + encodeSignedNumber(dLng);

        lastLat = lat;
        lastLng = lng;
    });

    return result;
}

function encodeSignedNumber(num) {
    let sgnNum = num << 1;
    if (num < 0) {
        sgnNum = ~sgnNum;
    }
    return encodeNumber(sgnNum);
}

function encodeNumber(num) {
    let encodeString = '';
    while (num >= 0x20) {
        encodeString += String.fromCharCode((0x20 | (num & 0x1f)) + 63);
        num >>= 5;
    }
    encodeString += String.fromCharCode(num + 63);
    return encodeString;
}

module.exports = getStaticMap;
