export interface iFriend extends iFriendList {
    accept(userCode: string): Promise<void>
    delete(userCode: string): Promise<void>
    reject(userCode: string): Promise<void>
    request(userCode: string): Promise<void>
}

export interface iFriendList {
    receiveFriends: Array<ReceiveFriends>
    friends: Array<Friends>
}

interface ReceiveFriends extends Friends { };

interface Friends {
    friendUserNum: number;
    friendNickname: string;
    emblem: number;
    leftoverMessage: string;
    friendUserCode: string
}