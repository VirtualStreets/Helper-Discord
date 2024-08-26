module.exports = async (messageContent) => {
    // Regular expression to match the Google Maps URL
    const urlRegex = /https:\/\/maps\.app\.goo\.gl\/[a-zA-Z0-9]+/;
    const urlMatch = messageContent.match(urlRegex);

    if (!urlMatch) {
        console.log("Invalid or missing URL.");
        return;
    }

    const url = urlMatch[0];

    // Regex to match:
    // 1. Unicode emojis, including flags (which are composed of two regional indicator symbols)
    // 2. Emojis in the form :emojiName:
    // 3. Custom Discord emojis in the form <:emojiName:emojiID>
    const emojiRegex = /(\p{Extended_Pictographic}|:\w+:|<:\w+:\d+>)/gu;

    // Split the message into parts: before the URL, the URL itself, and after the URL
    const [beforeUrl, afterUrl] = messageContent.split(url);

    // Extract tags from the part before the URL
    const tags = beforeUrl.match(emojiRegex) || undefined;

    // Description is everything after the URL, including any remaining text and emojis
    const description = afterUrl.trim() || undefined;

    // Return the extracted values
    return {
        url,
        tags,
        description
    };
}
