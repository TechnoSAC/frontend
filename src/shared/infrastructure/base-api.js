import axios from "axios";

const fulltankApi = import.meta.env.VITE_FULLTANK_API_URL;
const sessionStorageKey = 'fulltank.session';

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

        this.#http.interceptors.request.use(config => {
            try {
                const session = JSON.parse(localStorage.getItem(sessionStorageKey) ?? '{}');
                if (session.token) {
                    config.headers.Authorization = `Bearer ${session.token}`;
                }
            } catch {
                // A malformed local session must not prevent public requests.
            }
            return config;
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
