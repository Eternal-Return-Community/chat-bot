import HTTPClient, { BASEURL } from "./HTTPClient";
import type { PlayerStatus } from "./types/PlayerStatus";
import type { Channel } from "./types/Channel";
import type { iMessageCreate, Receiver } from "./interface/iMessageCreate";
import parse from "./utils/parse";
import type { Response } from "./types/Response";
import Cache from "./cache/Cache";
import Account from "./cache/Account";
import NinaError from "./exceptions/NinaError";
import type { FriendCondition } from "./types/FriendCondition";
import type { iFriendList } from "./interface/iFriendList";

interface iClient {
    readonly prefix: string;
    readonly gameStatus?: PlayerStatus;
    readonly bio?: string;
}

export default class Client extends HTTPClient implements iClient {

    public readonly gameStatus: PlayerStatus;
    public readonly bio: string;
    public readonly prefix: string;

    private _cache = Cache;
    private friendUserCode: string = '';

    constructor(client: iClient) {
        super()
        this.prefix = client?.prefix || '!';
        this.gameStatus = client?.gameStatus || 'InLobby';
        this.bio = client?.bio || 'Template Bot'
    }

    public get cache() {
        return this._cache;
    }

    public status(gameStatus: PlayerStatus): this {
        this.instance({
            method: 'POST',
            baseURL: BASEURL.BSER,
            endpoint: '/users/presence',
            body: { userCode: Account.userCode, gamestatus: gameStatus }
        })
            .then((r: Response) => {
                if (r?.cod == 200) return console.log('gameStatus:', gameStatus)
                console.log('Not possible to change Game Status');
            })

        return this;
    }

    public memo(bio: string): this {

        if (bio.length > 20) throw new NinaError('Bio size must be less than 20 digits')

        this.instance({
            method: 'POST',
            baseURL: BASEURL.BSER,
            endpoint: '/friends/leftoverMessage',
            body: bio
        })
            .then((r: Response) => {
                if (r?.cod == 200) return console.log('Bio:', bio)
                console.log('Not possible to change Memo');
            })
        return this;
    }

    private friendList(): this {
        setInterval(async () => {

            const response = await this.instance({
                method: 'GET',
                baseURL: BASEURL.BSER,
                endpoint: '/friends',
            });

            const { friends, receiveFriends }: iFriendList = response?.rst;

            this.emit('friendList', {
                friends,
                receiveFriends,
                accept: (userCode: string) => this.friendCondition(userCode, 'accept'),
                delete: (userCode: string) => this.friendCondition(userCode, 'delete'),
                reject: (userCode: string) => this.friendCondition(userCode, 'reject'),
                request: (userCode: string) => this.friendCondition(userCode, 'request')
            });

        }, 1000)
        return this;
    }

    private async friendCondition(userCode: string, condition: FriendCondition): Promise<void> {
        if (userCode.length == 0) return;
        try {
            await this.instance({
                method: 'POST',
                baseURL: BASEURL.BSER,
                endpoint: `/friends/${userCode}/${condition}`,
            })
        } catch (e) {
            throw e
        }

    }

    private async parseMessages(): Promise<iMessageCreate> {
        const response: Channel = await this.instance({
            method: 'GET',
            baseURL: BASEURL.CDN,
            endpoint: `/W_${Account.userCode}/messages/last?category=basic&limit=100`,
            userCode: Account.userCode
        })

        return {
            send: ({ userCode, content }: Receiver) => this.send({ userCode: userCode ?? this.friendUserCode, content: content }),
            message: parse(response.items[0]),
            history: response.items
        }
    }

    public send = ({ content, userCode }: Required<Receiver>): void => {
        this.instance({
            method: 'POST',
            baseURL: BASEURL.BSER,
            endpoint: '/chat/send',
            body: {
                "topic": `W_${userCode}`,
                "msg": JSON.stringify({
                    "payload": JSON.stringify({
                        "senderUserCode": Account.userCode,
                        "chatType": 2,
                        "chattingUIType": 0,
                        "teamUserIds": null,
                        "contents": JSON.stringify({
                            "senderUserInfo": {
                                "userId": Account.userNum,
                                "userCode": Account.userCode,
                                "nickName": Account.userName,
                                "avatar": 100001,
                                "memo": null,
                                "emblemMark": 0,
                                "emblemBg": 0,
                                "emblemOutline": 0
                            },
                            "characterCode": 0,
                            "contents": content,
                            "parameters": null
                        })
                    })
                })
            }
        })
    }

    private messages(): this {
        setInterval(async () => {
            const messages = await this.parseMessages();
            if (!messages.message) return;
            if (this._cache.messages.has(messages.message.id)) return;

            this._cache.messages.add(messages.message.id);

            this.friendUserCode = messages.message.senderUserCode;
            this.emit('messageCreate', messages)
        }, 1000)
        return this;
    }

    public login(): void {
        this.instance({ method: 'GET', baseURL: BASEURL.BSER, endpoint: '/lobby/enterRepeat/?supportLanguage=2&searchTime=0' })
            .then((r) => {
                if (r?.cod == 200) {
                    const user = r.rst.user;
                    this._cache.account.userName = user?.nn ?? 'Nina Bot';
                    this._cache.account.userNum = user.un;
                    this._cache.account.userCode = user.uc;
                }
                this.status(this.gameStatus).memo(this.bio).friendList().messages()
            })
    }
}