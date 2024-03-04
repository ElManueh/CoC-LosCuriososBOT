function getClashOfClansErrorMessage(error) {
    let errno = error.response.status;
    if (errno === 400) return 'Client provided incorrect parameters for the request.';
    if (errno === 403) return 'Access denied, either because of missing/incorrect credentials or used API token does not grant access to the requested resource.';
    if (errno === 404) return 'Resource was not found.';
    if (errno === 429) return 'Request was throttled, because amount of requests was above the threshold defined for the used API token.';
    if (errno === 500) return 'Unknown error happened when handling the request.';
    if (errno === 503) return 'Service is temprorarily unavailable because of maintenance.';
    if (errno === 504) return 'The server did not get a response in time from the upstream server that it needed in order to complete the request.'
}

export class ClashOfClansError extends Error {
    constructor (error) {
        super(getClashOfClansErrorMessage(error));
        this.name = 'CLASHOFCLANS_ERROR';
        this.errno = error.response.status;
        this.stack = null;
    }
}

const SQLITE_CONSTRAINT = 19;
export const SQLITE_CONSTRAINT_FOREIGNKEY = 'SQLITE_CONSTRAINT_FOREIGNKEY';
export const SQLITE_CONSTRAINT_UNIQUE = 'SQLITE_CONSTRAINT_UNIQUE';

function getDatabaseError(error) {
    let errno = error.errno;
    switch(errno) {  
        case SQLITE_CONSTRAINT:
            let message = error.message;
            if (message.indexOf('FOREIGN KEY') !== -1) {
                return SQLITE_CONSTRAINT_FOREIGNKEY;
            } else if (message.indexOf('UNIQUE') !== -1) {
                return SQLITE_CONSTRAINT_UNIQUE;
            }
        default:
            return 'SQLITE_ERROR';
    }
}

export class DatabaseError extends Error {
    constructor (error) {
        super(error.message);
        this.name = 'DATABASE_ERROR';
        this.errno = error.errno;
        this.code = getDatabaseError(error);
        this.stack = null;
    }
}