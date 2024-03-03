function getClashOfClansErrorMessage(error) {
    let codeError = error.response.status;
    if (codeError === 400) return 'Client provided incorrect parameters for the request.';
    if (codeError === 403) return 'Access denied, either because of missing/incorrect credentials or used API token does not grant access to the requested resource.';
    if (codeError === 404) return 'Resource was not found.';
    if (codeError === 429) return 'Request was throttled, because amount of requests was above the threshold defined for the used API token.';
    if (codeError === 500) return 'Unknown error happened when handling the request.';
    if (codeError === 503) return 'Service is temprorarily unavailable because of maintenance.';
    if (codeError === 504) return 'The server did not get a response in time from the upstream server that it needed in order to complete the request.'
}

export class ClashOfClansError extends Error {
    constructor (error) {
        super(getClashOfClansErrorMessage(error));
        this.name = 'CLASHOFCLANS_ERROR';
        this.code = error.response.status;
        this.stack = null;
    }
}

export class DatabaseError extends Error {
    constructor (error) {
        super(error.message);
        this.name = 'DATABASE_ERROR';
        this.code = error.errno;
        this.stack = null;
    }
}