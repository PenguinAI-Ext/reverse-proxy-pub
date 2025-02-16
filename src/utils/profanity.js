// WARNING: This file has citations of profanities and other ilegal stuff!
// This is just for the sake of safety of the users and the developers.

const imgprofanity = [
  "huge boobs", "boobs", "nude", "naked", "erotic", "fetish", 
  "sexual", "nsfw", "porn", "intimate", "provocative", "lewd",
  "lingerie", "swimsuit", "sexy", "seductive", "sensual", "sex",
  "breasts", "panties", "thong", "strip", "bikini", "underwear",
  "ass", "butt", "vulgar", "explicit", "obscene", "scantily clad",
  "curvy", "voluptuous", "busty", "adult", "bdsm", "submission",
  "dominatrix", "slut", "whore", "cunnilingus", "fellatio",
  "orgasm", "penetration", "masturbation", "ejaculation",
  "incest", "bestiality", "hentai", "rape", "molestation",
  "voyeurism", "exhibitionism", "g-string", "hardcore", 
  "softcore", "dominance", "submission", "pegging", "kinky",
  "pornographic", "smut", "taboo", "explicit content",
  "child", "children", "teen", "underage", "young", 
  "lolicon", "shota", "teenage", "preteens", "minors", 
  "schoolgirl", "loli", "child pornography", "cp", 
  "kid", "infant", "pedo", "pedophile"
];

let profanityList = [];
let isLoaded = false;

/**
 * Fetches profanity list from GitHub repository
 * @returns {Promise<void>}
 */
async function fetchProfanityList() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/dsojevic/profanity-list/main/src/en.json');
        profanityList = await response.json();
        isLoaded = true;
    } catch (error) {
        console.error('Error fetching profanity list:', error);
        profanityList = [];
        isLoaded = false;
    }
}

/**
 * Ensures profanity list is loaded
 * @returns {Promise<void>}
 */
async function ensureLoaded() {
    if (!isLoaded) {
        await fetchProfanityList();
    }
}

/**
 * Checks if messages array contains any profanity
 * @param {Array<{role: string, content: string}>} messages - OpenAI messages array
 * @returns {Promise<boolean>} - True if profanity is found
 */
async function hasProfanity(messages) {
    await ensureLoaded();
    const messageText = messages
        .map(msg => msg.content.toLowerCase())
        .join(' ');
    
    return profanityList.some(word => 
        messageText.includes(word.toLowerCase())
    );
}

/**
 * Checks if a message contains any image-related profanity
 * @param {string} message - Text to check
 * @returns {boolean} - True if image profanity is found
 */
function hasImageProfanity(message) {
    const lowerMessage = message.toLowerCase();
    return imgprofanity.some(word => 
        lowerMessage.includes(word.toLowerCase())
    );
}

fetchProfanityList();

module.exports = {
    hasProfanity,
    hasImageProfanity,
    fetchProfanityList,
    ensureLoaded
};

