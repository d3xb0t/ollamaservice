export const asyncErrorHandler = (func) => {
    return (requests, response, next) => {
        func(requests, response, next).catch(err => next(err)) 
    }
}
