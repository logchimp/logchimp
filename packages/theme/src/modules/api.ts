import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

import { useUserStore } from "../store/user";

/**
 * Abstract base class for making HTTP requests using axios
 * @abstract
 */
export abstract class APIService {
  protected baseURL: string;
  private axiosInstance: AxiosInstance;

  /**
   * Creates an instance of APIService
   * @param {string} baseURL - The base URL for all HTTP requests
   */
  protected constructor(baseURL: string) {
    const { authToken } = useUserStore();

    this.baseURL = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  }

  /**
   * Makes a GET request to the specified URL
   * @param {string} url - The endpoint URL
   * @param {object} [params={}] - URL parameters
   * @param {AxiosRequestConfig} [config={}] - Additional axios configuration
   * @returns {Promise} Axios response promise
   */
  get(url: string, params = {}, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.get(url, {
      ...params,
      ...config,
    });
  }
}
