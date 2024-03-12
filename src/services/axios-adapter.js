import axios from 'axios';
import { config } from 'dotenv';
config();

export class AxiosAdapter {
  static #INSTANCE = null;
  static #AXIOSCONFIG = {
    headers: {
      'Authorization': `Bearer ${process.env.API_KEY}`,
      'Accept': 'application/json',
    },
  };

  constructor() {
    if (AxiosAdapter.#INSTANCE === null) {
      AxiosAdapter.#INSTANCE = this;
    }
    return AxiosAdapter.#INSTANCE;
  }

  static getInstance() {
    return new AxiosAdapter();
  }

  // METHODS
  async requestApiGet(uri) {
    try {
      const responseApi = await axios.get(uri, AxiosAdapter.#AXIOSCONFIG);
      return responseApi.data;
    } catch (error) { throw error; }
  }

  async requestApiPost(uri, data) {
    try {
      const responseApi = await axios.post(uri, data, AxiosAdapter.#AXIOSCONFIG);
      return responseApi.data;
    } catch (error) { throw error; }
  }
}