class CSRFService {
  private csrfToken: string | null = null;
  private tokenPromise: Promise<string> | null = null;

  async getToken(): Promise<string> {
    if (this.csrfToken) {
      return this.csrfToken;
    }

    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = this.fetchToken();
    try {
      this.csrfToken = await this.tokenPromise;
      return this.csrfToken;
    } finally {
      this.tokenPromise = null;
    }
  }

  private async fetchToken(): Promise<string> {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }

    const data = await response.json();
    return data.csrfToken;
  }

  clearToken(): void {
    this.csrfToken = null;
    this.tokenPromise = null;
  }

  async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    return {
      'X-CSRF-Token': token,
    };
  }
}

export const csrfService = new CSRFService();