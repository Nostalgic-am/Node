// Replace with your own client ID and redirect URI
const clientId = '2b2230cc3a914927a7dc75b16820942b';
const redirectUri = 'http://127.0.0.1:5500/spotify.html';  // Replace with your registered redirect URI
const scopes = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative';

// Define the Spotify username you want to filter playlists by
const ownerUsername = 'x1nsanexgamingx';  // Replace this with your actual Spotify username

// Function to redirect to Spotify authentication
function authenticateSpotify() {
    console.log('Authenticating with Spotify...');
    const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
}

// Function to get access token from the URL hash
function getAccessToken() {
    const hash = window.location.hash.substring(1); // Remove the leading '#' character
    const params = new URLSearchParams(hash);  // Create URLSearchParams from the hash
    const token = params.get('access_token');  // Get the 'access_token' parameter

    if (token) {
        console.log('Access token found:', token);  // Log token for debugging
        return token;
    } else {
        console.log('No access token found.');
        return null;
    }
}

// Fetch playlists using the access token and filter by owner username
async function getPlaylists(accessToken) {
    try {
        console.log('Fetching playlists with access token:', accessToken);
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('All playlists fetched:', data);

        // Display only playlists created by the specified username
        const playlistContainer = document.querySelector('.spotify-embed');
        playlistContainer.innerHTML = ''; // Clear any previous content

        data.items
            .filter(playlist => playlist.owner.id === ownerUsername)  // Filter playlists by owner username
            .forEach(playlist => {
                const playlistDiv = document.createElement('div');
                playlistDiv.innerHTML = `
                    <iframe src="https://open.spotify.com/embed/playlist/${playlist.id}" 
                            width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
                `;
                playlistContainer.appendChild(playlistDiv);
            });

        // Handle case where no playlists matched the filter
        if (playlistContainer.innerHTML === '') {
            playlistContainer.innerHTML = `<p>No playlists found for the username "${ownerUsername}".</p>`;
        }

    } catch (error) {
        console.error('Error fetching playlists:', error);
        const playlistContainer = document.querySelector('.spotify-embed');
        playlistContainer.innerHTML = `<p>Failed to load playlists. Please try again later.</p>`;
    }
}

// Check for access token and initiate authentication if needed
const accessToken = getAccessToken();

if (!accessToken) {
    // If no access token, redirect to Spotify for authentication
    console.log('Redirecting for authentication...');
    authenticateSpotify();
} else {
    // If access token exists, fetch playlists
    console.log('Access token available, fetching playlists...');
    getPlaylists(accessToken);
}
