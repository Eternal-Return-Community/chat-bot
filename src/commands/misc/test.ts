import type Client from "nina"
import type { iMessageCreate } from "nina/interface/iMessageCreate"

export default {
    name: 'test',
    description: 'Test command',
    alias: ['t'],
    args: [],
    enable: true,
    run(_: Client, channel: iMessageCreate): void {
        channel.send({ content: 'Test command' })
    }
}