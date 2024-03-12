import { AxiosAdapter } from './axios-adapter.js';

export class ClashOfClansAPI {
  static #INSTANCE = null;
  static #REQUEST_COUNT = 0;
  static #MAX_LIMIT_REQUEST = 30;
  static #LINK_API = 'https://api.clashofclans.com/v1';

  constructor() {
    if (ClashOfClansAPI.#INSTANCE === null) {
      ClashOfClansAPI.#INSTANCE = this;
      setInterval(() => { ClashOfClansAPI.#REQUEST_COUNT = 0; }, 1000);
    }
    return ClashOfClansAPI.#INSTANCE;
  }

  static getInstance() {
    return new ClashOfClansAPI();
  }

  // METHODS
  
  // Count the request for prevent MAX_LIMIT_REQUEST
  async #RequestCount() {
    while (ClashOfClansAPI.#REQUEST_COUNT >= ClashOfClansAPI.#MAX_LIMIT_REQUEST) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    ClashOfClansAPI.#REQUEST_COUNT++;
  }

  // Get player info
  async getPlayer(playerTag) {
    const uri = `${ClashOfClansAPI.#LINK_API}/players/${encodeURIComponent(playerTag)}`;
    try {
      await this.#RequestCount();
      const player = await AxiosAdapter.getInstance().requestApiGet(uri);
      return player;
    } catch (error) { throw new ClashOfClansError(error); }
  }

  // Get clan info
  async getClan(clanTag) { 
    const uri = `${ClashOfClansAPI.#LINK_API}/clans/${encodeURIComponent(clanTag)}`;
    try {
      await this.#RequestCount();
      const clan = await AxiosAdapter.getInstance().requestApiGet(uri);
      return clan;
    } catch (error) { throw new ClashOfClansError(error); }
  }

  // Verify player account with his token
  async verifyPlayerToken(playerTag, playerToken) {
    const uri = `${ClashOfClansAPI.#LINK_API}/players/${encodeURIComponent(playerTag)}/verifytoken`;
    const data = { "token": `${playerToken}` };
    try {
      await this.#RequestCount();
      const tokenInfo = await AxiosAdapter.getInstance().requestApiPost(uri, data);
      return tokenInfo.status === 'ok' ? true : false;
    } catch (error) { throw new ClashOfClansError(error); }
  }

  // Get clan players
  async getClanPlayers(clan) {
    const uri = `${ClashOfClansAPI.#LINK_API}/clans/${encodeURIComponent(clan)}/members`;
    try {
      await this.#RequestCount();
      const players = await AxiosAdapter.getInstance().requestApiGet(uri);
      return players.items;
    } catch (error) { throw new ClashOfClansError(error); }
  }

  // Get currentWar for clan
  async getClanCurrentWar(clan) {
    const uri = `${ClashOfClansAPI.#LINK_API}/clans/${encodeURIComponent(clan)}/currentwar`;
    try {
      await this.#RequestCount();
      const currentWar = await AxiosAdapter.getInstance().requestApiGet(uri);
      return currentWar;
    } catch (error) { throw new ClashOfClansError(error); }
  }
}