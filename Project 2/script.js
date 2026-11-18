const apiKey = "405451e5c3b1453dab4f6c50a16dad87";

// Get HTML elements
const artistMenu = document.getElementById("artistMenu");
const artistSearch = document.getElementById("artistSearch");
const albumData = document.getElementById("albumData");
const searchButton = document.getElementById("search");

// Page number of the results
const page = 1;

// Number of albums to retrieve per page
const limit = 10;

// Store the selected artist
let selectedArtist = "Nirvana";

// Update selected an artist when dropdown changes
function selectArtist() {

    selectedArtist = artistMenu.value;

}

// Search button event
searchButton.addEventListener("click", function() {

    // Get the user's search input
    const searchQuery = artistSearch.value.trim();

    // Only search if the input is not empty
    if (searchQuery) {
        getAlbum(searchQuery);
    } else {
        albumData.textContent = "Please enter an album name.";
    }

});





// Fetch and display album data
async function getTopAlbums(searchQuery) {

    // Use search query if provided, otherwise use selected dropdown artist
    const artist = searchQuery || selectedArtist;

    // Display loading message
    albumData.textContent = "Loading album data...";

    try {

        // Send GET request to Last.fm API
        const response = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${encodeURIComponent(artist)}&autocorrect=1&page=${page}&limit=${limit}&api_key=${apiKey}&format=xml`
        );

        // Check if the response was successful
        if (!response.ok) {
            throw new Error("Album data could not be loaded.");
        }

        // Read response as text
        const xmlData = await response.text();

        // Parse XML data
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, "text/xml");

        // Check for XML parsing errors
        if (xmlDoc.querySelector("parsererror")) {
            throw new Error("Invalid XML data received.");
        }

        // Check for Last.fm API errors
        const apiError = xmlDoc.querySelector("lfm error");

        if (apiError) {
            throw new Error(apiError.textContent);
        }

        // Extracts albums
        const albums = xmlDoc.querySelectorAll("topalbums > album");

        // Extracts artist name
        const artistName =
            xmlDoc.querySelector("topalbums > album artist > name")?.textContent
            || artist;

        // Clears loading message
        albumData.replaceChildren();

        // Displays heading
        const heading = document.createElement("h2");
        heading.textContent = `Top Albums by ${artistName}`;
        albumData.appendChild(heading);

        // Checks if albums were found
        if (albums.length === 0) {
            albumData.append("No albums found for this artist.");
            return;
        }

        // Displays each album
        albums.forEach((album) => {

            const albumName = album.querySelector("name")?.textContent;
            const playCount = album.querySelector("playcount")?.textContent;
            const listeners = album.querySelector("listeners")?.textContent;
            const albumUrl = album.querySelector("url")?.textContent;
            const image = album.querySelector("image[size='large']")?.textContent;

            // Create album container
            const container = document.createElement("div");

            // Display album image
            if (image) {
                const img = document.createElement("img");
                img.src = image;
                img.alt = albumName || "Album cover";
                img.width = 150;
                container.appendChild(img);
            }

            // Displays album name
            const title = document.createElement("h3");
            title.textContent = albumName || "Unknown album";

            // Displays play count
            const plays = document.createElement("p");
            plays.textContent = `Play count: ${playCount || "Unavailable"}`;

            // Displays listeners
            const listenerInfo = document.createElement("p");
            listenerInfo.textContent = `Listeners: ${listeners || "Unavailable"}`;

            // Displays album link
            if (albumUrl) {
                const link = document.createElement("a");
                link.href = albumUrl;
                link.textContent = "View album on Last.fm";
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                container.appendChild(link);
            }

            container.append(title, plays, listenerInfo);

            albumData.appendChild(container);

        });

    } catch (error) {

        // Handle errors
        albumData.textContent = "Error: " + error.message;

    }
}
