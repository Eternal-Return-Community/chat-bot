import Account from "./Account";

class Cache extends Set { };

export default {
    account: Account,
    messages: new Cache()
}
