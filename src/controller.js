import { requestApiGet, requestApiPost } from './axios-adapter.js';

// Link Discord account with Clash Of Clans account
export async function linkAccount(playerTag, playerToken, discordId) {
  const data = {
    tag: playerTag,
    token: playerToken,
    discordId: discordId
  };

  try {
    const response = await requestApiPost('/players/linkaccount', data);
    return response;
  } catch (error) {
    if (error.errno === -4078) return -1;
    return error.response.data.errno;
  }
}

// Untrack a clan from Discord guild
export async function untrackClan(clanTag, guildId) {
  const data = {
    tag: clanTag,
    guildId: guildId
  };

  try {
    const response = await requestApiPost('/clans/untrack', data);
    return response;
  } catch (error) {
    if (error.errno === -4078) return -1;
    return error.response.data.errno;
  }
}

// Track a clan from Discord guild
export async function trackClan(clanTag, guildId) {
  const data = {
    tag: clanTag,
    guildId: guildId
  };

  try {
    const response = await requestApiPost('/clans/track', data);
    return response;
  } catch (error) {
    if (error.errno === -4078) return -1;
    return error.response.data.errno;
  }
}

// Link Discord account with Clash Of Clans account
export async function unlinkAccount(playerTag, discordId) {
  const data = {
    tag: playerTag,
    discordId: discordId
  };

  try {
    const response = await requestApiPost('/players/unlinkaccount', data);
    return response;
  } catch (error) {
    if (error.errno === -4078) return -1;
    return error.response.data.errno;
  }
}
