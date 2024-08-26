module.exports = (dateStr) => {
    // Create a Date object from the string
    const date = new Date(dateStr);

    // Options for formatting the date
    const options = { year: 'numeric', month: 'long' };

    // Format the date as "Month Year"
    return date.toLocaleDateString('en-US', options);
}
