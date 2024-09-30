import type { Messages } from "../types/Channel";
import type { Chat } from "../types/Chat";

export default (x: Messages): (Chat | null) => {
    try {
        const chat = JSON.parse(x.payload) as Chat;
        const contents = JSON.parse(chat.contents as unknown as string)

        chat.id = x.id
        chat.contents = contents

        return chat;
    } catch (e: unknown) {
        return null;
    }
}