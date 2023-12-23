let pin;

function loadMastodonMessages(messageIds){
  // Define the Mastodon instance URL
const instanceUrl = 'https://mastodon.social';

// Define the message IDs
//const messageIds = ['110652345253413282', '109800465763084151'];

// Function to fetch and display Mastodon messages
async function fetchAndDisplayMessages() {
  try {
    // Fetch the messages using the Mastodon API
    const messages = await Promise.all(
      messageIds.map(async (messageId) => {
        const response = await fetch(`${instanceUrl}/api/v1/statuses/${messageId}`);
        return response.json();
      })
    );

    // Display the messages in the sidebar
    const messageList = document.getElementById('message-list');
    messages.forEach((message) => {
      const { content, account, created_at } = message;

      // Create message container
      const messageContainer = document.createElement('div');
      messageContainer.classList.add('message');

      // Create profile picture
      const profilePicture = document.createElement('img');
      profilePicture.classList.add('profile-picture');
      profilePicture.src = account.avatar;

      // Create message content container
      const messageContentContainer = document.createElement('div');
      messageContentContainer.classList.add('message-content');

      // Create username
      const username = document.createElement('div');
      username.classList.add('username');
      username.textContent = account.username;

      // Create message content
      const messageContent = document.createElement('div');
      messageContent.classList.add('content');
      messageContent.innerHTML = content;

      // Create creation date
      const creationDate = document.createElement('div');
      creationDate.classList.add('creation-date');
      creationDate.textContent = formatCreationDate(created_at);

      // Add click event listener to message container
      messageContainer.addEventListener('click', () => {
        navigateToGeohash(content);
      });

      // Append elements to the message content container
      messageContentContainer.appendChild(username);
      messageContentContainer.appendChild(messageContent);
      messageContentContainer.appendChild(creationDate);

      // Append elements to the message container
      messageContainer.appendChild(profilePicture);
      messageContainer.appendChild(messageContentContainer);

      // Append message container to the message list
      messageList.appendChild(messageContainer);
    });
  } catch (error) {
    console.error('Error fetching Mastodon messages:', error);
  }
}

// Call the function to fetch and display messages
fetchAndDisplayMessages();

// Function to format creation date
function formatCreationDate(creationDate) {
  const date = new Date(creationDate);
  return date.toLocaleString();
}

// Function to navigate to geohash location
function navigateToGeohash(content) {
  const geohashRegex = /https:\/\/map.decarbnow.space\/@([a-zA-Z0-9]+)\//;
  const match = content.match(geohashRegex);

  if (match && match[1]) {
    const geohash = match[1];
    if (geohash) {
      const { latitude, longitude } = decodeGeohash(geohash);

      // Remove existing pin if present
      if (pin) {
        map.removeLayer(pin);
      }

      // Create new pin marker and add it to the map
      pin = L.marker([latitude, longitude]).addTo(map);

      // Set the Leaflet map view to the location
      map.setView([latitude, longitude]);
    }
  }

  const zoomLevel = 14; // Default zoom level if not specified in the URL
  // const mapUrl = `https://map.decarbnow.space/@${geohash}/z=${zoomLevel}/ls=light,no2_2021_test,tweets`;

  // Perform the necessary actions with the map URL, such as setting the Leaflet map view
  // console.log(`Navigating to: ${mapUrl}`);
}


}
