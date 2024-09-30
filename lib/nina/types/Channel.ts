export type Channel = {
    topic: string;
    category: string;
    items: Array<Messages>;
    totalSize: number;
    next: boolean
}

export type Messages = {
    id: string;
    from: string;
    created: string;
    payload: string
}