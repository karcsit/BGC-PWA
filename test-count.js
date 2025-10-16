// Check total game count
const API_URL = 'https://dr11.webgraf.hu/web/jsonapi/node/tarsasjatek?page[limit]=1';

fetch(API_URL, {
  headers: {
    'Accept': 'application/vnd.api+json',
  }
})
  .then(response => response.json())
  .then(data => {
    console.log('Total games:', data.meta?.count || 'unknown');
    console.log('Links:', data.links);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
