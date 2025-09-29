const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      delete (config.headers as any)['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      // Handle file downloads
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
          contentType?.includes('application/zip')) {
        if (response.ok) {
          const blob = await response.blob();
          const filename = this.getFilenameFromResponse(response);
          return {
            data: { blob, filename } as T,
            status: response.status,
          };
        }
      }

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : null;

      // Ensure error is always a string
      let errorMessage = 'Une erreur est survenue';
      if (!response.ok && data?.detail) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          // Handle FastAPI validation errors
          errorMessage = data.detail.map((err: any) => err.msg || 'Validation error').join(', ');
        } else {
          errorMessage = 'Une erreur est survenue';
        }
      }

      return {
        data: response.ok ? data : undefined,
        error: !response.ok ? errorMessage : undefined,
        status: response.status,
      };
    } catch (error) {
      return {
        error: 'Erreur de connexion au serveur',
        status: 0,
      };
    }
  }

  private getFilenameFromResponse(response: Response): string {
    const contentDisposition = response.headers.get('content-disposition');
    console.log('Content-Disposition header:', contentDisposition);
    
    if (contentDisposition) {
      // Recherche la pattern filename="quelque_chose"
      let match = contentDisposition.match(/filename="([^"]+)"/);
      if (match) {
        console.log('Found quoted filename:', match[1]);
        return match[1];
      }
      
      // Recherche filename=quelque_chose (sans guillemets)
      match = contentDisposition.match(/filename=([^;,\s]+)/);
      if (match) {
        console.log('Found unquoted filename:', match[1]);
        return match[1];
      }
    }
    
    console.log('Fallback to default filename: download');
    return 'download';
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request('/api/auth/cookie/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    });
  }

  async logout() {
    return this.request('/api/auth/cookie/logout', {
      method: 'POST',
    });
  }

  async forgotPassword(email: string) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ 
        token, 
        password: newPassword 
      }),
    });
  }

  async getUserProfile() {
    return this.request('/api/user/profile');
  }

  // Dashboard methods
  async getDashboardStats() {
    return this.request('/api/dashboard/stats');
  }

  // Extraction methods
  async extractFromFile(file: File, documentNumber: string, bankCode: string, accountNumber: string) {
    const formData = new FormData();
    formData.append('document_number', documentNumber);
    formData.append('bank_code', bankCode);
    formData.append('account_number', accountNumber);
    formData.append('file', file);

    return this.request('/api/statements/extract/', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData,
    });
  }

  async batchExtractFromFiles(files: File[], documentNumber: string, bankCode: string, accountNumber: string) {
    const formData = new FormData();
    formData.append('document_number', documentNumber);
    formData.append('bank_code', bankCode);
    formData.append('account_number', accountNumber);
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return this.request('/api/statements/extract/batch', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData,
    });
  }

  // Excel file methods
  async getExcelFiles() {
    return this.request('/api/excel/files');
  }

  async downloadExcelFile(fileId: string) {
    return this.request(`/api/excel/download/${fileId}`);
  }

  async deleteExcelFile(fileId: string) {
    return this.request(`/api/excel/delete/${fileId}`, {
      method: 'DELETE',
    });
  }

  // Admin methods
  async getAdminDashboard() {
    return this.request('/api/admin/dashboard');
  }

  async getAdminUsersStats() {
    return this.request('/api/admin/users/stats');
  }

  async getUsers() {
    return this.request('/api/admin/users');
  }

  async createUser(userData: Record<string, unknown>) {
    return this.request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: Record<string, unknown>) {
    return this.request(`/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
