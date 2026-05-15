import axios from "axios";

const fulltankApi =
    import.meta.env.PROD
        ? 'https://json-server-1-1uka.onrender.com'
        : import.meta.env.VITE_FULLTANK_API_URL;

/**
 * Shared infrastructure base class that owns the configured Axios client.
 * Bounded-context adapters extend this class to access a consistent HTTP gateway.
 *
 * @class BaseApi
 */
export class BaseApi {
    /** @type {import('axios').AxiosInstance} */
    #http;

    /** Initializes the shared Axios client with environment-driven configuration. */
    constructor() {
        this.#http = axios.create({
            baseURL: fulltankApi
        });
    }

    /**
     * Axios client used by infrastructure endpoint adapters.
     * @returns {import('axios').AxiosInstance}
     */
    get http() {
        return this.#http;
    }
}
