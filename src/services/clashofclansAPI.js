import axios from 'axios';
import { ClashOfClansError } from '../errorCreate.js';
import { config } from 'dotenv';
config();

let requestCount = 0;
export async function RequestCountClashOfClansCreate() {
  setInterval(() => { requestCount = 0 }, 1000);
}

async function RequestCount() {
  while (requestCount >= 30) await new Promise(resolve => setTimeout(resolve, 1000));
  requestCount++;
}

// Configuration API request
const axiosConfig = {
  headers: {
    'Authorization': `Bearer ${process.env.API_KEY}`,
    'Accept': 'application/json',
  },
};

// Get request
async function requestApiGet(uri) {
  try {
    await RequestCount();
    const responseApi = await axios.get(uri, axiosConfig);
    return responseApi.data;
  } catch (error) { throw error; }
}

// Post request
async function requestApiPost(uri, data) {
  try {
    await RequestCount();
    const responseApi = await axios.post(uri, data, axiosConfig);
    return responseApi.data;
  } catch (error) { throw error; }
}

// Get player info
export async function getPlayer(playerTag) {
  const uri = `${process.env.LINK_API}/players/${encodeURIComponent(playerTag)}`;
  try {
    const player = await requestApiGet(uri);
    return player;
  } catch (error) { throw new ClashOfClansError(error); }
}

// Get clan info
export async function getClan(clanTag) {
  const uri = `${process.env.LINK_API}/clans/${encodeURIComponent(clanTag)}`;
  try {
    const clan = await requestApiGet(uri);
    return clan;
  } catch (error) { throw new ClashOfClansError(error); }
}

// Verify player account with his token
export async function verifyPlayerToken(playerTag, playerToken) {
  const uri = `${process.env.LINK_API}/players/${encodeURIComponent(playerTag)}/verifytoken`;
  const data = { "token": `${playerToken}` };
  try {
    const tokenInfo = await requestApiPost(uri, data);
    return tokenInfo.status === 'ok' ? true : false;
  } catch (error) { throw new ClashOfClansError(error); }
}

// Get clan players
export async function getClanPlayers(clan) {
  const uri = `${process.env.LINK_API}/clans/${encodeURIComponent(clan)}/members`;
  try {
    const players = await requestApiGet(uri);
    return players.items;
  } catch (error) { throw new ClashOfClansError(error); }
}

// Get currentWar for clan
export async function getClanCurrentWar() {
  const uri = `${process.env.LINK_API}/clans/${encodeURIComponent(process.env.CLAN_TAG)}/currentwar`;
  try {
    const currentWar = await requestApiGet(uri);
    return currentWar;
  } catch (error) { throw new ClashOfClansError(error); }
}