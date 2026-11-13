import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { useUserStore } from "../store/user";
import type { components } from "@logchimp/api-ts-types";

type PrimitiveType = string | number | boolean;

// `meta` isn't a built-in axios field — declare it so TS is happy.
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    meta?: { start: number };
  }
}

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
    this.baseURL = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
    });

    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const { authToken } = useUserStore();

        if (authToken) {
          config.headers.set("Authorization", `Bearer ${authToken}`);
        } else {
          config.headers.delete("Authorization");
        }

        config.meta = { start: performance.now() };

        return config;
      },
    );

    // Console.log error-ed API calls
    this.axiosInstance.interceptors.response.use(
      (res) => res,
      (error) => {
        if (!axios.isCancel(error) && axios.isAxiosError(error)) {
          const { config, response } = error as AxiosError<
            components["schemas"]["GenericAPIErrorResponseBody"]
          >;
          const method = (config?.method ?? "GET").toUpperCase();
          const url = config ? axios.getUri(config) : "";
          const status = response?.status ?? error.code ?? "NETWORK";
          const errorMsg = response?.data?.message ?? error.message;
          const errorCode = response?.data?.code;
          const duration =
            config?.meta?.start !== undefined
              ? `(${Math.round(performance.now() - config.meta.start)}ms)`
              : "";

          const parts = [
            status,
            method,
            url,
            "→",
            errorMsg && `'${errorMsg}'`,
            errorCode && `[${errorCode}]`,
            duration,
          ].filter(Boolean);
          console.log(parts.join(" "));
        }
        return Promise.reject(error);
      },
    );
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
      ...config,
      params,
    });
  }

  /**
   * Makes a PATCH request to the specified URL
   * @param {string} url - The endpoint URL
   * @param {object} [data={}] - Request body data
   * @param {AxiosRequestConfig} [config={}] - Additional axios configuration
   * @returns {Promise} Axios response promise
   */
  patch(url: string, data = {}, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.patch(url, data, config);
  }

  /**
   * Makes a PUT request to the specified URL
   * @param {string} url - The endpoint URL
   * @param {object} [data={}] - Request body data
   * @param {AxiosRequestConfig} [config={}] - Additional axios configuration
   * @returns {Promise} Axios response promise
   */
  put(url: string, data = {}, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.put(url, data, config);
  }

  /**
   * Makes a POST request to the specified URL
   * @param {string} url - The endpoint URL
   * @param {object} [data={}] - Request body data
   * @param {AxiosRequestConfig} [config={}] - Additional axios configuration
   * @returns {Promise} Axios response promise
   */
  post(url: string, data = {}, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.post(url, data, config);
  }

  /**
   * Makes a DELETE request to the specified URL
   * @param {string} url - The endpoint URL
   * @param {any} [data] - Request body data
   * @param {AxiosRequestConfig} [config={}] - Additional axios configuration
   * @returns {Promise} Axios response promise
   */
  delete(url: string, data?: any, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.delete(url, { data, ...config });
  }

  protected buildQueryParams(
    query?: Record<string, PrimitiveType | PrimitiveType[] | null | undefined>,
  ): URLSearchParams {
    const searchParams = new URLSearchParams();

    if (query) {
      for (const queryKey of Object.keys(query)) {
        const value = query[queryKey];
        if (value !== undefined && value !== null) {
          searchParams.set(queryKey, String(value));
        }
      }
    }

    return searchParams;
  }
}
