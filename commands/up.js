const validateGoogleMapsUrl = require("../functions/validateGoogleMapsUrl");
const extractCoordinatesFromUrl = require("../functions/extractCoordinatesFromUrl");
const getGeocodingData = require("../functions/getGeocodingData");
const streetviewPanoramaFunctionPython = require("../functions/streetviewPanoramaFunctionPython");
const formatOSMAddress = require("../functions/formatOSMAddress");
const convertDate = require("../functions/convertDate");
const validateAndExtractMessage = require("../functions/validateAndExtractMessage");

module.exports.run = async (client, message) => {
    const channel = message.channel
    const author = message.author
    const messageContent = message.content
    console.log(messageContent)
    await message.delete()

    const result = await validateAndExtractMessage(messageContent);

    console.log(result)

    if (!result) {
        return channel.createMessage({ content: "Please provide a Google Maps URL." });
    }
    
    const urlInput = result.url;
    const tagsInput = result.tags;
    const descriptionInput = result.description;

    if (!urlInput) {
        return channel.createMessage({ content: "Please provide a Google Maps URL." });
    }

    const validatedUrl = await validateGoogleMapsUrl(urlInput);
    if (!validatedUrl.valid) {
        return channel.createMessage({ content: validatedUrl.response });
    }

    const coordinates = extractCoordinatesFromUrl(validatedUrl.response);
    const { lat, lng, fov, heading, pitch } = coordinates;

    const geocodingData = await getGeocodingData(lat, lng);

    console.log("python metadata")
    const pythonMetadata = await streetviewPanoramaFunctionPython(parseFloat(lat), parseFloat(lng));

    const dateString = convertDate(pythonMetadata.date);
    const { country_code: code } = geocodingData.address;
    const discordEmojiFlag = `:flag_${code.toLowerCase()}:`;

    const formattedAddress = formatOSMAddress(geocodingData);

    await channel.createMessage({
        content: `${discordEmojiFlag}${tagsInput ? " " + tagsInput : ""} ${dateString} in ${formattedAddress}  •  [Location link](<${pythonMetadata.permalink}>) by ${author.mention}${descriptionInput?"  •  " + descriptionInput : ""}`,
        allowedMentions: {
            users: false,  // Disable user mentions
            roles: false    ,  // Disable role mentions
            everyone: false  // Disable everyone/here mentions
        }
    })
}

module.exports.help = {
    name: "up",
    description: "Update report!",
}
