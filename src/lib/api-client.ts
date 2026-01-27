/**
 * API Client Helper
 * Wrapper untuk fetch API dengan error handling yang konsisten
 */

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Generic API client dengan error handling
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  /**
   * Build URL dengan query params
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }
    return url.toString();
  }

  /**
   * Generic fetch wrapper
   */
  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(`${this.baseUrl}${endpoint}`, params);

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", params });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

/**
 * Specific API endpoints untuk setiap resource
 */
export const productsApi = {
  getAll: (params?: Record<string, string>) => 
    apiClient.get("/products", params),
  getById: (id: number) => 
    apiClient.get(`/products/${id}`),
  create: (data: unknown) => 
    apiClient.post("/products", data),
  update: (id: number, data: unknown) => 
    apiClient.patch(`/products/${id}`, data),
  delete: (id: number) => 
    apiClient.delete(`/products/${id}`),
};

export const newsApi = {
  getAll: (params?: Record<string, string>) => 
    apiClient.get("/news", params),
  getById: (id: number) => 
    apiClient.get(`/news/${id}`),
  create: (data: unknown) => 
    apiClient.post("/news", data),
  update: (id: number, data: unknown) => 
    apiClient.patch(`/news/${id}`, data),
  delete: (id: number) => 
    apiClient.delete(`/news/${id}`),
};

export const messagesApi = {
  getAll: (params?: Record<string, string>) => 
    apiClient.get("/messages", params),
  getById: (id: number) => 
    apiClient.get(`/messages/${id}`),
  update: (id: number, data: unknown) => 
    apiClient.patch(`/messages/${id}`, data),
  delete: (id: number) => 
    apiClient.delete(`/messages/${id}`),
};

export const classesApi = {
  getAll: (params?: Record<string, string>) => 
    apiClient.get("/classes", params),
  getById: (id: number) => 
    apiClient.get(`/classes/${id}`),
  create: (data: unknown) => 
    apiClient.post("/classes", data),
  update: (id: number, data: unknown) => 
    apiClient.patch(`/classes/${id}`, data),
  delete: (id: number) => 
    apiClient.delete(`/classes/${id}`),
};

export const enrollmentsApi = {
  getAll: (params?: Record<string, string>) => 
    apiClient.get("/enrollments", params),
  create: (data: unknown) => 
    apiClient.post("/enrollments", data),
  update: (id: number, data: unknown) => 
    apiClient.patch(`/enrollments/${id}`, data),
  delete: (id: number) => 
    apiClient.delete(`/enrollments/${id}`),
};
