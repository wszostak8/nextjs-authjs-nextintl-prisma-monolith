export function devLog(message: string, ...args: any[]) {
    if (process.env.NODE_ENV !== 'production') {
        console.log(message, ...args)
    }
}

export function devError(message: string, ...args: any[]) {
    if (process.env.NODE_ENV !== 'production') {
        console.error(message, ...args)
    }
}
