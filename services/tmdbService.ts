import { TMDBResponse, TMDBResult, MediaDetails, SeasonDetails } from '../types';

const API_KEY = 'ef5d138e190f392876196b60d31eee5c'; // Provided by user
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

export const getImageUrl = (path: string | null) => {
  return path ? `${IMAGE_BASE_URL}${path}` : 'https://picsum.photos/500/750?blur=2';
};

export const getBackdropUrl = (path: string | null) => {
  return path ? `${BACKDROP_BASE_URL}${path}` : 'https://picsum.photos/1920/1080?blur=2';
};

export const fetchTrending = async (language: string = 'en-US'): Promise<TMDBResult[]> => {
  try {
    const response = await fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=${language}`);
    if (!response.ok) throw new Error('Failed to fetch trending');
    const data: TMDBResponse = await response.json();
    return data.results.filter(item => item.media_type !== 'person');
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const searchMulti = async (query: string, language: string = 'en-US'): Promise<TMDBResult[]> => {
  if (!query) return [];
  try {
    const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=${language}`);
    if (!response.ok) throw new Error('Failed to search');
    const data: TMDBResponse = await response.json();
    return data.results.filter(item => item.media_type !== 'person' && (item.poster_path || item.backdrop_path));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchMediaDetails = async (id: number, type: 'movie' | 'tv', language: string = 'en-US'): Promise<MediaDetails | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=credits,videos,watch/providers&language=${language}`
    );
    if (!response.ok) throw new Error('Failed to fetch details');
    const data = await response.json();
    // IMPORTANT: API details endpoint often doesn't return media_type, but our app logic requires it.
    // We manually inject it here based on the request type.
    return { ...data, media_type: type };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchSeasonDetails = async (tvId: number, seasonNumber: number, language: string = 'en-US'): Promise<SeasonDetails | null> => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=${language}`);
    if (!response.ok) throw new Error('Failed to fetch season details');
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};