import type { iMessageCreate } from "nina/interface/iMessageCreate"
import type { iCommand } from "../../events/MessageCreate";
import fs from 'node:fs';
import type Client from "nina";

export default {
    name: 'commands',
    description: 'List of Commands',
    alias: ['cmd', 'comandos'],
    args: [],
    enable: true,
    async run(client: Client, channel: iMessageCreate, args: Array<string>): Promise<void> {
        
        const listCommands: Array<string> = [];

        const dirs = fs.readdirSync(__dirname + '../..');
        
        for(const dir of dirs) {
            const commands = fs.readdirSync(__dirname + `../../${dir}`)
            for(const cmd of commands) {
                
                if (!cmd.endsWith('.ts')) continue;
                
                const { default: command }: iCommand = await import(__dirname + `../../${dir}/${cmd}`);
                
                if (!command || !command?.enable) continue;
                if (command.name === 'commands') continue;

                const args = command.args.length >= 1 ? `[${command.args.join(', ')}]` : '';
                listCommands.push(`${client.prefix}${command.name} ${args}`)
            }
        }
        
        if(listCommands.length == 0) {   
            return channel.send({ content: 'Atualmente não tem nenhum comando disponível.' });
        }
        
        channel.send({ content: `Lista de comandos: ${listCommands.join(', ')}` });
    }

}