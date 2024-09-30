import EventEmitter from 'node:events';
import NinaError from './exceptions/NinaError';
import env from './env';

type Methods = 'GET' | 'POST';

export enum BASEURL {
    BSER = 'https://bser-rest-release.bser.io/api',
    CDN = 'https://cdn.eternalreturn.io/clubChatRelease/topics'
}

type Params = {
    method: Methods
    baseURL: BASEURL;
    endpoint?: string;
    body?: any
    userCode?: string
}

export default abstract class HTTPClient extends EventEmitter {

    constructor() {
        super({ captureRejections: false })
        this.renewalSession()
    }

    protected async instance({ method, baseURL, endpoint, body, userCode = '' }: Params): Promise<any> {
        const response = await fetch(this.uri(baseURL, endpoint), {
            method,
            headers: {
                'Content-Type': 'application/json',
                'token': env.TOKEN,
                'user': userCode,
                'X-BSER-SessionKey': env.TOKEN,
                'X-BSER-Version': env.VERSION,
                'X-BSER-AuthProvider': 'STEAM'
            },
            body: JSON.stringify(body) ?? null
        })

        if (response.status != 200) {
            throw new Error(response.statusText)
        }

        const data = await response.json();

        if (data?.cod >= 1000) {
            throw new NinaError(data.msg)
        }

        return data;
    }

    protected renewalSession = (): void => {
        setInterval(() => this.instance({
            method: 'POST',
            baseURL: BASEURL.BSER,
            endpoint: '/external/renewalSession'
        }), 1 * 30000)
    }

    private uri = (baseURL: string, endpoint?: string) => endpoint ? ''.concat(baseURL, endpoint) : baseURL;

}