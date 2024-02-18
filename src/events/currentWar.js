

import {databaseGet, databaseAll, databaseRun} from '../database.js';

try {
    let resp = await databaseGet('SELECT * from usuarioscoc')
    console.log
} catch (error) {
    console.log(error)
}
