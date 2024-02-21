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

// Get user info
export async function getUserInfo(userTag) {
  const uri = `${process.env.LINK_API}/players/${encodeURIComponent(userTag)}`;
  try {
    const user = await requestApiGet(uri);
    return user;
  } catch (error) { throw new ClashOfClansError(error); }
}

// Verify user account with token
export async function verifyUserToken(userTag, userToken) {
  const uri = `${process.env.LINK_API}/players/${encodeURIComponent(userTag)}/verifytoken`;
  const data = { "token": `${userToken}` };
  try {
    const tokenInfo = await requestApiPost(uri, data);
    return tokenInfo.status === 'ok' ? true : false;
  } catch (error) { throw new ClashOfClansError(error); }
}

// Get users from clan
export async function getUsersClan() {
  const uri = `${process.env.LINK_API}/clans/${encodeURIComponent(process.env.CLAN_TAG)}/members`;
  try {
    const users = await requestApiGet(uri);
    return users.items;
  } catch (error) { throw new ClashOfClansError(error); }
}

// Get currentWar for clan
export async function getCurrentWarClan() {
  const uri = `${process.env.LINK_API}/clans/${encodeURIComponent(process.env.CLAN_TAG)}/currentwar`;
  try {
    const currentWar = await requestApiGet(uri);
    return currentWar;
  } catch (error) { throw new ClashOfClansError(error); }
}