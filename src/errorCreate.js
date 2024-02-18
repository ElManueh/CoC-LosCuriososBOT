export class DatabaseError extends Error {
    constructor (message) {
         super(message)
         this.name = 'DatabaseError'
    }
}

export class ClashofclansError extends Error {
    constructor (message) {
         super(message)
         this.name = 'ClashofclansError'
    }
}