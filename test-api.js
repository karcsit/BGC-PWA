// Test script to check API structure
fetch('https://dr11.webgraf.hu/web/jsonapi/node/tarsasjatek?page[limit]=1')
  .then(res => res.json())
  .then(data => {
    console.log(JSON.stringify(data.data[0].attributes, null, 2))
  })
  .catch(err => console.error(err))
