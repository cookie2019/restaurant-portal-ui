export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "seated"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Reservation {
  id: number;
  restaurant_id: string;
  table_id: number | null;
  customer_name: string;
  customer_phone: string;
  party_size: number;
  reservation_date: string; // YYYY-MM-DD
  reservation_time: string; // HH:MM
  status: ReservationStatus;
  special_requests: string | null;
  internal_notes: string | null;
  ride_requested: boolean;
  ride_booking_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Table {
  id: number;
  restaurant_id: string;
  table_number: string;
  section: string | null;
  capacity: number;
  notes: string | null;
  is_active: boolean;
}

export interface LoyaltyCustomer {
  id: number;
  restaurant_id: string;
  customer_phone: string;
  customer_name: string;
  visit_count: number;
  first_seen_at: string;
  last_seen_at: string;
  notes: string | null;
}

export interface AvailabilitySlot {
  time: string;
  tablesAvailable: number;
  tableIds: number[];
}
