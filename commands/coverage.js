const Eris = require("eris")
const extractCoordinatesFromUrl = require("../functions/extractCoordinatesFromUrl")
const expandShortUrl = require("../functions/expandShortUrl")
const getStreetviewMetadata = require("../functions/getStreetviewMetadata")
const getGeocodingData = require("../functions/getGeocodingData")
const settings = require("../settings.json")

// :newcountry:                             when a country gets its first coverage of the month
// :newregion:                              when a region gets its first coverage of the month, region being a generic term for any first-level subdivision (like states for US, provinces or territory for Canada...); usually we go for the subdivisions visible on Google Maps or the top left widget in Street View
// :newarea:                                when an area without any coverage closer than 50km around gets its first blue line
// :newgen4:                                when a country or region gets its first gen 4 coverage ever
// :gen1update: :gen2update: :gen3update:   when gen 1 / 2 / 3 coverage is updated to gen 4
// :ariupdate:                              when an third-party coverage (ari) is replaced by new official coverage
// :newtrekker:                             when new coverage is a trekker (does not include road coverage made with a trekker on a pickup)
// :newtripod:                              when new coverage is made with a regular camera on a tripod (usually indoors)
// :newroad:                                when a new road is added
// :newstreet:                              when a new street is added in a town (new road variant)
// :newtown:                                when a new town is added
// :newisland:                              when a new island is added

const choices = [
    {
        name: "New Country",
        value: "new-country"
    },
    {
        name: "New Region",
        value: "new-region"
    },
    {
        name: "New Area",
        value: "new-area"
    },
    {
        name: "New Gen 4",
        value: "new-gen-four"
    },
    {
        name: "Gen 1 Update",
        value: "gen-one-update"
    },
    {
        name: "Gen 2 Update",
        value: "gen-two-update"
    },
    {
        name: "Gen 3 Update",
        value: "gen-three-update"
    },
    {
        name: "ARI Update",
        value: "ari-update"
    },
    {
        name: "New Trekker",
        value: "new-trekker"
    },
    {
        name: "New Tripod",
        value: "new-tripod"
    },
    {
        name: "New Road",
        value: "new-road"
    },
    {
        name: "New Street",
        value: "new-street"
    },
    {
        name: "New Town",
        value: "new-town"
    },
    {
        name: "New Island",
        value: "new-island"
    }
];

const genReplaceChoices = [
    {
        name: "Gen 1 Update",
        value: "gen-one-update"
    },
    {
        name: "Gen 2 Update",
        value: "gen-two-update"
    },
    {
        name: "Gen 3 Update",
        value: "gen-three-update"
    },
    {
        name: "ARI Update",
        value: "ari-update"
    }
];

module.exports.run = async (client, interaction) => {

    let url = interaction.data.options[0].value
    let genReplace = interaction.data.options[1].value

    if (url.includes("https://maps.app.goo.gl/")) {
        url = await expandShortUrl(url)
    }
    const coordinates = extractCoordinatesFromUrl(url)

    const streetviewMetadata = await getStreetviewMetadata(settings.googleApiKey, coordinates.lat, coordinates.lng)

    console.log(streetviewMetadata)

    const geocodingData = await getGeocodingData(coordinates.lat, coordinates.lng)

    console.log(geocodingData)

    const town = geocodingData.address.town
    const state = geocodingData.address.state
    const country = geocodingData.address.country
    const code = geocodingData.address.country_code
    const discordEmojiFlag = `:flag_${code.toLowerCase()}:`


    await interaction.createMessage(`Coordinates: ${coordinates.lat}, ${coordinates.lng}, Gen Replace: ${genReplace}, Town: ${town}, State: ${state}, Country: ${country}, Code: ${code}, Discord Emoji Flag: ${discordEmojiFlag}`)
}

module.exports.help = {
    name: "update-coverage",
    description: "New coverage appeared? Let others know about that!",
    options: [
        {
            name: "url",
            description: "Url of the new coverage",
            type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
            required: true
        },
        {
            name: "gen-replace",
            description: "Did this new coverage replace an older one? If so, what kind of coverage was replaced?",
            type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
            choices: genReplaceChoices
        },

    ]
}
