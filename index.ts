import Client from 'nina';
import type { iMessageCreate } from "nina/interface/iMessageCreate"
import MessageCreate from './src/events/MessageCreate';
import type { iFriend } from 'nina/interface/iFriendList';
import NinaError from 'nina/exceptions/NinaError';

const client = new Client({
    prefix: '!'
});

client.on('friendList', async (friend: iFriend) => {
    try {

        if (friend.receiveFriends.length == 0) return;

        for (const { friendUserCode } of friend.receiveFriends) {
            await friend.accept(friendUserCode)
            client.send({ userCode: friendUserCode, content: 'Olá! Eu me chamo Nina e sou um Chat Bot do ERBS. \nCaso queira usar meus comandos digite: !comandos' })
        }

    } catch (err: unknown) {
        if (err instanceof NinaError) {
            console.error(`${err.name}: ${err.message}`)
            return
        }
        console.error(err)
    }

})

client.on('messageCreate', (message: iMessageCreate) => new MessageCreate(client, message))

client.login();