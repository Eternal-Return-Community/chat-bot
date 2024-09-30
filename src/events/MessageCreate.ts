import type Client from "nina";
import type { iMessageCreate } from "nina/interface/iMessageCreate"
import fs from 'node:fs';

export interface iCommand {
    default: Default
}

interface Default {
    name: string;
    description: string;
    alias: Array<string>;
    args: Array<string>;
    enable: boolean
    run(client: Client, channel: iMessageCreate, args: Array<string>): void
}

export default class MessageCreate {

    private readonly _contents: string;
    private readonly _args: Array<string>;
    private readonly _commandName: string;

    constructor(
        private readonly _client: Client,
        private _channel: iMessageCreate
    ) {
        this._contents = this._channel.message?.contents.contents!;
        
        this._args = this._contents.split(' ');
        this._commandName = this._args[0].trim().toLowerCase();

        if (this._commandName.startsWith(this._client.prefix)) {
            this._channel.message!.contents.contents = this._contents.replace(this._args.shift()!, '').trimStart();
            this.run()
        };
    }

    private dirs(dir: string): Array<string> {
        return fs.readdirSync(dir)
    }

    private async run(): Promise<void> {
        for (const dir of this.dirs('./src/commands')) {
            const commands = this.dirs('./src/commands'.concat('/', dir));
            for (const cmd of commands) {
                
                if (!cmd.endsWith('.ts')) continue;
                
                const { default: command }: iCommand = await import(`../commands/${dir}/${cmd}`);
                
                if (!command) continue;
                if (!this.validateCommand(command)) continue;

                if (!command?.enable) {
                    return this._channel.send({ content: `${this._commandName} foi desativado temporariamente.` })
                }

                return command.run(this._client, this._channel, this._args);
            }
        }

    }

    private validateCommand = (command: Default): boolean =>
        this._commandName.slice(this._client.prefix.length) === command.name ||
        command.alias.includes(this._commandName.slice(this._client.prefix.length))
}