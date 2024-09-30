export default class NinaError extends Error {
    constructor(message: string) {
        super()
        this.name = 'Nina Error'
        this.message = message
    }
}