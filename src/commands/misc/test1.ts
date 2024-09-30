import type Client from "nina"
import type { iMessageCreate } from "nina/interface/iMessageCreate"

export default {
    name: 'test1',
    description: 'Test command',
    alias: ['t'],
    args: [],
    enable: false,
    run(_: Client, channel: iMessageCreate): void {
        channel.send({ content: '123' })
    }
}