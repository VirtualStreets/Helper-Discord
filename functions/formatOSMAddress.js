module.exports = (osmData) => {
    if (!osmData || !osmData.address) {
        return '';
    }

    const address = osmData.address;

    // Step 1: Identify the most specific location
    const location = address.village || address.town || address.city || address.road || address.suburb || address.neighbourhood || '';

    // Step 2: Identify the next larger administrative unit
    const region = address.state || address.region || address.province || '';

    // Step 3: Identify the country
    const country = address.country || '';

    // Step 4: Combine into a string "1, 2, 3"
    const formattedAddress = [location, region, country].filter(Boolean).join(', ');

    return formattedAddress || 'Unknown location';
}
