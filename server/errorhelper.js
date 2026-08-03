export class ApiError extends Error {
    constructor(status, message, details = null,log = false) {
        super(message);
        this.status = status;
        this.details = details;
        this.log = log;
    }
}
