export interface TMDBResult {
  id: number;
  title?: string;
  name?: string; // For TV shows
  poster_path: string | null;
  backdrop_path: string | null;
  media_type: 'movie' | 'tv' | 'person';
  vote_average: number;
  overview: string;
  release_date?: string;
  first_air_date?: string;
}

export interface TMDBResponse {
  page: number;
  results: TMDBResult[];
  total_pages: number;
  total_results: number;
}

export type CollectionStatus = 'seen' | 'watchlist';
export type Language = 'en' | 'fr';

export interface AgendaEvent {
  date: string; // YYYY-MM-DD
  title: string; // "S01E01" or "Movie Release"
  episodeTitle?: string;
  overview?: string;
}

export interface CollectionItem extends TMDBResult {
  status: CollectionStatus;
  addedAt: number;
  agendaDate?: string; // Legacy: keep for fallback
  agendaTitle?: string; // Legacy: keep for fallback
  agendaEvents?: AgendaEvent[]; // New: List of all upcoming events
}

export interface User {
  username: string;
  password: string; // In a real app, this would be hashed/tokenized
  collection: CollectionItem[];
}

export interface RecommendationRequest {
  seenTitles: string[];
}

export interface AIRecommendation {
  title: string;
  reason: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface VideoResult {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface NextEpisode {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  episode_type: string;
  production_code: string;
  runtime: number | null;
  season_number: number;
  show_id: number;
  still_path: string | null;
}

export interface SeasonDetails {
  _id?: string;
  air_date?: string;
  episodes?: NextEpisode[];
  name: string;
  overview: string;
  id: number;
  poster_path?: string | null;
  season_number: number;
  episode_count?: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MediaDetails extends TMDBResult {
  tagline?: string;
  runtime?: number; // Movies
  number_of_seasons?: number; // TV
  genres?: Genre[];
  seasons?: SeasonDetails[]; // TV
  next_episode_to_air?: NextEpisode; // TV
  credits: {
    cast: CastMember[];
  };
  videos: {
    results: VideoResult[];
  };
  'watch/providers'?: {
    results: {
      US?: {
        flatrate?: Provider[];
        rent?: Provider[];
        buy?: Provider[];
      };
      FR?: {
        flatrate?: Provider[];
        rent?: Provider[];
        buy?: Provider[];
      };
    };
  };
}