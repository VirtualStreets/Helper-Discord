const Eris = require("eris")
const extractCoordinatesFromUrl = require("../functions/extractCoordinatesFromUrl")
const expandShortUrl = require("../functions/expandShortUrl")
const getStreetviewMetadata = require("../functions/getStreetviewMetadata")
const getGeocodingData = require("../functions/getGeocodingData")
const validateGoogleMapsUrl = require("../functions/validateGoogleMapsUrl")
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

const assistanceSelectMenuTags = [
    {
        label: "New road",
        emoji: {
            id: null,
            name: "🆕"
        },
        value: "newroad",
        description: "New road description"
    },
    {
        label: "New town",
        value: "newtown"
    }
]

const assistancePhrases = [
    "assistance", "help", "assist"
]

const noTagPhrases = [
    "no tag"
]

module.exports.run = async (client, interaction) => {

    let url = interaction.data.options[0]?.value
    let tags = interaction.data.options[1]?.value
    let description = interaction.data.options[2]?.value
    
    let assistance = false
    let noTag = false
    
    if (assistancePhrases.includes(tags.trim().toLowerCase())) {
        assistance = true
    }
    
    if (noTagPhrases.includes(tags.trim().toLowerCase())) {
        noTag = true
    }
    
    url = await validateGoogleMapsUrl(url)

    if (!url.valid) return interaction.createMessage({
        content: url.response
    })
  
    
    const coordinates = extractCoordinatesFromUrl(url.response)
    
    const {lat, lng} = coordinates

    // I don't need streetview metadata, because openstreetmap api does all stuff so far
    // const streetviewMetadata = await getStreetviewMetadata(settings.googleApiKey, lat, lng)
    //
    // console.log(streetviewMetadata)

    const geocodingData = await getGeocodingData(lat, lng)

    console.log(geocodingData)

    const town = geocodingData.address.town
    const village = geocodingData.address.village
    const city = geocodingData.address.city
    const neighbourhood = geocodingData.address.neighbourhood
    const suburb = geocodingData.address.suburb
    const province = geocodingData.address.province
    const state = geocodingData.address.state
    const country = geocodingData.address.country
    const code = geocodingData.address.country_code
    const discordEmojiFlag = `:flag_${code.toLowerCase()}:`
    
    console.log(interaction)

    
    if (!assistance) {
        await interaction.createMessage(`Coordinates: ${coordinates.lat}, ${coordinates.lng}, Description: ${description}, Tags: ${tags}, Town: ${town}, State: ${state}, Country: ${country}, Code: ${code}, Discord Emoji Flag: ${discordEmojiFlag}`)
    } else {
        await interaction.createMessage({content:"Choose tags that fit your location the best.", components:[{
            type: 1,
                components: [{
                    type: 3,
                    custom_id: `assistance${interaction.member.id}`,
                    options: assistanceSelectMenuTags,
                    placeholder: "Choose tag/s",
                    min_values: 1,
                    max_values: assistanceSelectMenuTags.length
                }]
            }]})
    }
}

module.exports.help = {
    name: "update-coverage",
    description: "New coverage appeared? Let others know about that!",
    options: [
        {
            type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
            name: "url",
            description: "The crucial one. Enter google maps url so we both know about that loc.",
            required: true
        },
        {
            type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
            name: "tags",
            description: "Specify the coverage with tags. Not sure, then type \"help\"",
            required: true
        },
        {
            type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
            name: "description",
            description: "Want to add something special? You can so here!"
        },
    ]
}
