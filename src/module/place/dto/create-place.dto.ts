export class CreatePlaceDto {
  name: string;
  formatted_address: string;
  lat: number;
  lng: number;
  viewport_northeast_lat: number;
  viewport_northeast_lng: number;
  viewport_southwest_lat: number;
  viewport_southwest_lng: number;
  photos: string; // JSON string
  place_id: string;
  rating: number;
  user_ratings_total: number;
  website: string;
}
