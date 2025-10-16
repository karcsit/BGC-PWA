// Test script to check game types
fetch('https://dr11.webgraf.hu/web/jsonapi/node/tarsasjatek?page[limit]=20')
  .then(res => res.json())
  .then(data => {
    console.log('Sample game data:')
    console.log(JSON.stringify(data.data[0].attributes, null, 2))

    // Check for type/category fields
    const game = data.data[0].attributes
    Object.keys(game).forEach(key => {
      if (key.includes('tipus') || key.includes('kategoria') || key.includes('type') || key.includes('category')) {
        console.log(`\nFound field: ${key}`)
        console.log(game[key])
      }
    })
  })
  .catch(err => console.error(err))
