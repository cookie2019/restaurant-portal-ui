const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("portal_token");
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.message || "Request failed"), {
      status: res.status,
      code: err.error,
    });
  }

  return res.json();
}

// Auth
export async function login(restaurantId: string, apiKey: string) {
  const data = await apiFetch<{
    data: { token: string; expiresIn: string; restaurantId: string };
  }>(`/v1/restaurants/${restaurantId}/auth`, {
    method: "POST",
    body: JSON.stringify({ apiKey }),
  });
  return data.data;
}

// Reservations
export async function getReservations(
  restaurantId: string,
  date?: string
): Promise<{ reservations: import("./types").Reservation[] }> {
  const qs = date ? `?date=${date}` : "";
  const data = await apiFetch<{
    data: { reservations: import("./types").Reservation[] };
  }>(`/v1/restaurants/${restaurantId}/reservations${qs}`);
  return data.data;
}

export async function createReservation(
  restaurantId: string,
  body: {
    customerName: string;
    customerPhone: string;
    partySize: number;
    date: string;
    time: string;
    specialRequests?: string;
  }
) {
  const data = await apiFetch<{
    data: { reservation: import("./types").Reservation };
  }>(`/v1/restaurants/${restaurantId}/reservations`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return data.data.reservation;
}

export async function updateReservationStatus(
  restaurantId: string,
  id: number,
  status: import("./types").ReservationStatus
) {
  const data = await apiFetch<{
    data: { reservation: import("./types").Reservation };
  }>(`/v1/restaurants/${restaurantId}/reservations/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return data.data.reservation;
}

// Tables
export async function getTables(restaurantId: string) {
  const data = await apiFetch<{
    data: { tables: import("./types").Table[] };
  }>(`/v1/restaurants/${restaurantId}/tables`);
  return data.data.tables;
}

// Availability
export async function getAvailability(
  restaurantId: string,
  date: string,
  partySize: number
) {
  const data = await apiFetch<{
    data: {
      slots: import("./types").AvailabilitySlot[];
      date: string;
      partySize: number;
    };
  }>(
    `/v1/restaurants/${restaurantId}/availability?date=${date}&party_size=${partySize}`
  );
  return data.data;
}

// Customers
export async function getCustomers(restaurantId: string) {
  const data = await apiFetch<{
    data: { customers: import("./types").LoyaltyCustomer[] };
  }>(`/v1/restaurants/${restaurantId}/customers`);
  return data.data.customers;
}
