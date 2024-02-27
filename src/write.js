import { appendFile } from 'fs/promises';

export async function writeConsoleANDLog (message) {
	const logFile = 'latest.log';
	console.log(message);
	await appendFile(logFile, message + '\n');
}