// Drupal API Service
// Fejlesztésben a Vite proxy-t használjuk (relatív URL), production-ben az abszolút URL-t
const API_BASE_URL = import.meta.env.DEV
  ? '' // Relatív URL fejlesztésben (Vite proxy-n keresztül)
  : 'https://dr11.webgraf.hu/web'; // Abszolút URL production-ben

/**
 * Fetch all games from Drupal
 * @param {Object} params - Query parameters (page, limit, filter)
 * @returns {Promise<Object>} Games data
 */
export async function fetchGames(params = {}) {
  try {
    const { page = 0, limit = 50, filter = {} } = params;

    let url = `${API_BASE_URL}/jsonapi/node/tarsasjatek?page[limit]=${limit}&page[offset]=${page * limit}&include=field_a_jatek_kepe,field_a_jatek_kepe.field_media_image`;

    // Add filters if provided
    if (filter.category) {
      url += `&filter[field_jatek_kategoria.name]=${filter.category}`;
    }
    if (filter.type) {
      url += `&filter[field_tipus.name]=${filter.type}`;
    }
    if (filter.available !== undefined) {
      url += `&filter[field_elerheto]=${filter.available ? 1 : 0}`;
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.api+json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
}

/**
 * Fetch single game by ID
 * @param {string} uuid - Game UUID
 * @returns {Promise<Object>} Game data
 */
export async function fetchGameById(uuid) {
  try {
    const response = await fetch(`${API_BASE_URL}/jsonapi/node/tarsasjatek/${uuid}`, {
      headers: {
        'Accept': 'application/vnd.api+json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching game:', error);
    throw error;
  }
}

/**
 * Fetch game categories (jatek_kategoria)
 * @returns {Promise<Array>} Categories
 */
export async function fetchGameCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/jsonapi/taxonomy_term/jatek_kategoria`, {
      headers: {
        'Accept': 'application/vnd.api+json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Fetch game types (jatek_tipusok_polcrendszerben)
 * @returns {Promise<Array>} Game types
 */
export async function fetchGameTypes() {
  try {
    const response = await fetch(`${API_BASE_URL}/jsonapi/taxonomy_term/jatek_tipusok_polcrendszerben`, {
      headers: {
        'Accept': 'application/vnd.api+json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching game types:', error);
    throw error;
  }
}

/**
 * Create a new booking
 * @param {Object} bookingData - Booking information
 * @returns {Promise<Object>} Booking response
 */
export async function createBooking(bookingData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/booking/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

/**
 * Fetch user loyalty points
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Loyalty data
 */
export async function fetchLoyaltyPoints(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/loyalty/${userId}`, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    throw error;
  }
}
