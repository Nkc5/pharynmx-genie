declare type addUser = {
    clerkId: string,
    email: string,
    username: string,
    country: string,
    wallet: number
}

declare type updateUser = {
    clerkId: string,
    wallet: number,
    operation: string
}