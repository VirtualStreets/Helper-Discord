const Eris = require("eris");
const extractCoordinatesFromUrl = require("../functions/extractCoordinatesFromUrl");
const getGeocodingData = require("../functions/getGeocodingData");
const validateGoogleMapsUrl = require("../functions/validateGoogleMapsUrl");
const settings = require("../settings.json");
const { createCanvas, loadImage } = require("canvas");
const fetchStreetviewImage = require("../functions/fetchStreetViewImage");
const createCanvasImage = require("../functions/createCanvasImage");
const getStaticMap = require("../functions/getStaticMap");
const applyClippingPath = require("../functions/applyClippingPath");
const formatOSMAddress = require("../functions/formatOSMAddress");
const createRoundedImage = require("../functions/createRoundedImage");
const getStreetviewMetadata = require("../functions/getStreetviewMetadata");
const streetviewPanoramaFunctionPython = require("../functions/streetviewPanoramaFunctionPython");
const convertDate = require("../functions/convertDate");


const choices = [
    { name: "New Country", value: "new-country" },
    { name: "New Region", value: "new-region" },
    { name: "New Area", value: "new-area" },
    { name: "New Gen 4", value: "new-gen-four" },
    { name: "Gen 1 Update", value: "gen-one-update" },
    { name: "Gen 2 Update", value: "gen-two-update" },
    { name: "Gen 3 Update", value: "gen-three-update" },
    { name: "ARI Update", value: "ari-update" },
    { name: "New Trekker", value: "new-trekker" },
    { name: "New Tripod", value: "new-tripod" },
    { name: "New Road", value: "new-road" },
    { name: "New Street", value: "new-street" },
    { name: "New Town", value: "new-town" },
    { name: "New Island", value: "new-island" }
];

const assistanceSelectMenuTags = [
    { label: "New road", emoji: { id: null, name: "🆕" }, value: "newroad", description: "New road description" },
    { label: "New town", emoji: { id: null, name: "🐳" }, value: "newtown" }

];

const assistancePhrases = ["assistance", "help", "assist"];
const noTagPhrases = ["no tag", "no tags", "none", "nothing", "no"];

module.exports.run = async (client, interaction) => {

    const author = interaction.member;
    const channel = interaction.channel;
    interaction.acknowledge();

    const userSelections = {};

    const urlInput = interaction.data.options[0]?.value;
    const tagsInput = interaction.data.options[1]?.value;
    const descriptionInput = interaction.data.options[2]?.value;

    const useOptionalImage = false;

    const isAssistance = assistancePhrases.includes(tagsInput.trim().toLowerCase());
    const isNoTag = noTagPhrases.includes(tagsInput.trim().toLowerCase());

    const validatedUrl = await validateGoogleMapsUrl(urlInput);
    if (!validatedUrl.valid) {
        return interaction.createMessage({ content: validatedUrl.response });
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

    // const canvasWidth = 550 + 565 + (useOptionalImage ? 565 : 0);
    // const canvasHeight = 470;
    // const canvas = createCanvas(canvasWidth, canvasHeight);
    // const ctx = canvas.getContext("2d");
    //
    // ctx.fillStyle = "rgba(0,0,0,0)";
    // ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    //
    // const staticMapImageProps = { width: 550, height: 470, offset: { x: 0, y: 20 } };
    // const staticMapImageBuffer = await getStaticMap(lat, lng, 6, staticMapImageProps.width, staticMapImageProps.height, settings.googleApiKey, [{ lat, lng }], 'default', 0.2, 'red');
    // await createRoundedImage(ctx, staticMapImageProps, staticMapImageBuffer);
    //
    // const middleImageProps = { width: 550, height: 470, offset: { x: 565, y: 20 } };
    // if (useOptionalImage) {
    //     const markerCoordinates = [
    //         { lat: 51.5074, lng: -0.1278 },
    //         { lat: 40.7128, lng: -74.0060 }
    //     ];
    //     const optionalMapBuffer = await getStaticMap(lat, lng, 1, middleImageProps.width, middleImageProps.height, settings.googleApiKey, markerCoordinates, 'circle', 0.14, 'red');
    //     await createRoundedImage(ctx, middleImageProps, optionalMapBuffer);
    // } else {
    //     const streetviewImageBuffer = await fetchStreetviewImage(lat, lng, heading, pitch, fov);
    //     const streetviewCanvasBuffer = await createCanvasImage(streetviewImageBuffer, middleImageProps.width, middleImageProps.height);
    //     await createRoundedImage(ctx, middleImageProps, streetviewCanvasBuffer);
    // }
    //
    // if (useOptionalImage) {
    //     const streetviewImageProps = { width: 550, height: 450, offset: { x: 1130, y: 20 } };
    //     const streetviewImageBuffer = await fetchStreetviewImage(lat, lng, heading, pitch, fov);
    //     const streetviewCanvasBuffer = await createCanvasImage(streetviewImageBuffer, streetviewImageProps.width, streetviewImageProps.height);
    //     await createRoundedImage(ctx, streetviewImageProps, streetviewCanvasBuffer);
    // }
    //
    // const buffer = await canvas.toBuffer("image/png");

    if (!isAssistance) {
        await interaction.createFollowup({content: "posted", flags:64}).then((msg) => {msg.delete()});
        await channel.createMessage(
            {
                content: `${discordEmojiFlag}${!isNoTag ? " " + tagsInput : ""} ${dateString} in ${formattedAddress}  •  [Location link](<${pythonMetadata.permalink}>) by ${author.mention}${descriptionInput?"  •  " + descriptionInput : ""}`,
                allowedMentions: {
                    users: false,  // Disable user mentions
                    roles: false    ,  // Disable role mentions
                    everyone: false  // Disable everyone/here mentions
                }
            }
        );
    } else {
        await interaction.createMessage({
            content: "Choose tags that fit your location the best.",
            flags: 64, // Ephemeral message
            components: [ {
                type: 1, // Action Row
                components: [
                    {
                        type: 3, // Select menu
                        custom_id: `assistance${interaction.member.id}`,
                        options: assistanceSelectMenuTags, // Assuming `assistanceSelectMenuTags` is defined
                        placeholder: "Choose tag/s",
                        min_values: 1,
                        max_values: assistanceSelectMenuTags.length
                    }
                ]
            },
                {
                    type: 1, // Action Row
                    components: [
                        {
                            type: 2, // Button
                            label: "Submit",
                            style: 1, // Primary style
                            custom_id: `submit_button${interaction.member.id}`
                        }
                    ]
                }]
        }).then((msg) => {
            // Create a custom collector for component interactions
            const filter = (m) => m.member.id === interaction.member.id;
            const collectorTimeout = 60000; // 60 seconds

            const collector = (componentInteraction) => {
                return componentInteraction instanceof ComponentInteraction &&
                    componentInteraction.data.custom_id.startsWith(interaction.member.id) &&
                    filter(componentInteraction);
            };

            const collectorHandler = (componentInteraction) => {
                if (componentInteraction.data.custom_id === `assistance${interaction.member.id}`) {
                    // Store the user's selected options
                    userSelections[interaction.member.id] = componentInteraction.data.values;
                    componentInteraction.acknowledge(); // Acknowledge the interaction
                } else if (componentInteraction.data.custom_id === `submit_button${interaction.member.id}`) {
                    // Handle the button click
                    if (userSelections[interaction.member.id]) {
                        const selectedOptions = userSelections[interaction.member.id].map(value => {
                            const option = assistanceSelectMenuTags.find(tag => tag.value === value);
                            return option ? `${option.emoji ? `${option.emoji.name} ` : ''}${option.label}` : value;
                        }).join(', ');

                        componentInteraction.channel.createMessage(   {
                            content: `${discordEmojiFlag}${selectedOptions}   •   ${dateString}   •   ${formattedAddress}   •   [Location link](<${validatedUrl.response}>)${"   •   " + descriptionInput || ""}`,
                        });
                    } else {
                        componentInteraction.createMessage({
                            content: "You didn't select any options.",
                            flags: 64 // Ephemeral message
                        });
                    }
                    cleanupCollector();
                }
            };

            const cleanupCollector = () => {
                client.off('interactionCreate', collectorHandler); // Remove the collector
            };

            // Start the collector
            client.on('interactionCreate', collectorHandler);

            // Set a timeout to stop the collector after 60 seconds
            setTimeout(() => {
                cleanupCollector();

            }, collectorTimeout);
        });
    }
};

module.exports.help = {
    name: "report-update",
    description: "New coverage appeared? Let others know about that!",
    options: [
        { type: Eris.Constants.ApplicationCommandOptionTypes.STRING, name: "url", description: "The crucial one. Enter google maps url so we both know about that loc.", required: true },
        { type: Eris.Constants.ApplicationCommandOptionTypes.STRING, name: "tags", description: "Specify the coverage with tags. Not sure, then type \"help\"", required: true },
        { type: Eris.Constants.ApplicationCommandOptionTypes.STRING, name: "description", description: "Want to add something special? You can so here!" }
    ]
};