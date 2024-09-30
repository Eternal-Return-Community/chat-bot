import type { Messages } from "../types/Channel"
import type { Chat } from "../types/Chat";

export interface iMessageCreate {
    message: Chat | null;
    history: Array<Messages>;
    send(content: Receiver): void
}

export type Receiver = {
    userCode?: string;
    content: string
}