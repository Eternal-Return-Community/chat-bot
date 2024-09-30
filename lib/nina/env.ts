const { TOKEN, VERSION } = Bun.env;

export default {
    load: (): void => {
        if (!TOKEN || !VERSION) {
            throw new Error('Missing key in env file.')
        }
    },
    TOKEN: TOKEN!,
    VERSION: VERSION!,
}