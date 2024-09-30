export type Chat = {
    id: string | null;
    senderUserCode: string;
    chatType: number;
    chattingUIType: number;
    teamUserIds?: any;
    contents: Contents
}

export type Contents = {
    senderUserInfo: SenderUserInfo;
    characterCode: number,
    contents: string,
    parameters?: any
}

export type SenderUserInfo = {
    userId: number;
    userCode: string,
    nickName: string,
    avatar: number,
    memo?: any,
    emblemMark: number,
    emblemBg: number,
    emblemOutline: number,
}
