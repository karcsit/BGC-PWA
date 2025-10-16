// Test script to check game image structure
const API_URL = 'https://dr11.webgraf.hu/web/jsonapi/node/tarsasjatek?page[limit]=3&include=field_a_jatek_kepe,field_a_jatek_kepe.field_media_image';

console.log('Checking game image structure...\n');

fetch(API_URL, {
  headers: {
    'Accept': 'application/vnd.api+json',
  }
})
  .then(response => response.json())
  .then(data => {
    console.log('First game data:');
    const game = data.data[0];
    console.log('Title:', game.attributes?.title);
    console.log('\nImage field structure:');
    console.log(JSON.stringify(game.attributes?.field_a_jatek_kepe, null, 2));

    console.log('\nRelationships:');
    console.log(JSON.stringify(game.relationships?.field_a_jatek_kepe, null, 2));

    console.log('\nIncluded resources count:', data.included?.length || 0);
    if (data.included) {
      console.log('\nIncluded types:');
      data.included.forEach(item => {
        console.log(' -', item.type, ':', item.id.substring(0, 20) + '...');
      });

      const mediaImage = data.included.find(i => i.type === 'media--image');
      if (mediaImage) {
        console.log('\nMedia entity found!');
        console.log('Media relationships:', JSON.stringify(mediaImage.relationships, null, 2));
      }

      const imageFile = data.included.find(i => i.type === 'file--file');
      if (imageFile) {
        console.log('\nFile entity found!');
        console.log('Image URL:', imageFile.attributes?.uri?.url);
        console.log('Full URL:', 'https://dr11.webgraf.hu/web' + imageFile.attributes?.uri?.url);
      } else {
        console.log('\nNo file--file entity found in included resources');
      }
    }
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
