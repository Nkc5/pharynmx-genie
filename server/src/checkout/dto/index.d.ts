declare type checkoutData = {
    productId: string
}

declare type price = {
    productId: string,
    clerkId: string
}

declare type payloadData = {
    clerkId: string,
    productId: string,
    payload: any,
    operation: string
}

declare type paymentDetail = {
    currency: string,
    amount: number
}