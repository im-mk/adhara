import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Base API class using Axios
export abstract class ApiClient {
  protected apiUrl: string;

  constructor() {
    // Read the API URL from the environment variable
    this.apiUrl = process.env.REACT_APP_API_URL || '';
  }

  /**
   * Make an API request using Axios.
   *
   * @param endpoint - The relative URL endpoint (e.g., "/orders/1")
   * @param config - Axios request configuration (method, headers, data, etc.)
   * @param onSuccess - Callback function to process the successful response data
   * @param onError - Callback function to process errors
   */
  protected async request<T>(
    endpoint: string,
    config: AxiosRequestConfig = {},
    onSuccess: (data: T) => void,
    onError: (error: any) => void
  ): Promise<void> {
    try {
      // Create the full URL and merge the config options
      const response: AxiosResponse<T> = await axios({
        url: `${this.apiUrl}${endpoint}`,
        ...config,
      });
      // Pass the response data to the success callback
      onSuccess(response.data);
    } catch (error) {
      // Pass any errors to the error callback
      onError(error);
    }
  }

  /**
   * Send a GET request.
   *
   * @param endpoint - The relative URL endpoint
   * @param onSuccess - Callback for successful response
   * @param onError - Callback for handling errors
   */
  public async get<T>(
    endpoint: string,
    onSuccess: (data: T) => void,
    onError: (error: any) => void
  ): Promise<void> {
    await this.request<T>(
      endpoint,
      { method: 'GET' },
      onSuccess,
      onError
    );
  }

  /**
   * Send a PUT request.
   *
   * @param endpoint - The relative URL endpoint
   * @param data - The data to be sent in the request body
   * @param onSuccess - Callback for successful response
   * @param onError - Callback for handling errors
   */
  public async put<T>(
    endpoint: string,
    data: any,
    onSuccess: (data: T) => void,
    onError: (error: any) => void
  ): Promise<void> {
    await this.request<T>(
      endpoint,
      { method: 'PUT', data },
      onSuccess,
      onError
    );
  }

  /**
   * Send an update (PATCH) request.
   *
   * @param endpoint - The relative URL endpoint
   * @param data - The data to be sent for updating
   * @param onSuccess - Callback for successful response
   * @param onError - Callback for handling errors
   */
  public async update<T>(
    endpoint: string,
    data: any,
    onSuccess: (data: T) => void,
    onError: (error: any) => void
  ): Promise<void> {
    await this.request<T>(
      endpoint,
      { method: 'PATCH', data },
      onSuccess,
      onError
    );
  }

  /**
   * Send a DELETE request.
   *
   * @param endpoint - The relative URL endpoint
   * @param onSuccess - Callback for successful response
   * @param onError - Callback for handling errors
   */
  public async delete<T>(
    endpoint: string,
    onSuccess: (data: T) => void,
    onError: (error: any) => void
  ): Promise<void> {
    await this.request<T>(
      endpoint,
      { method: 'DELETE' },
      onSuccess,
      onError
    );
  }
}
