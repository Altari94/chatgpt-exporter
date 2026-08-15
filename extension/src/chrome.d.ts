declare namespace chrome {
    namespace runtime {
        function getURL(path: string): string
        function sendMessage(message: unknown): Promise<unknown>
        const onMessage: {
            addListener(callback: (message: unknown, sender: unknown, sendResponse: (response: unknown) => void) => boolean): void
        }
    }

    namespace tabs {
        function query(queryInfo: { active: boolean; currentWindow: boolean }): Promise<Array<{ id?: number }>>
        function sendMessage(tabId: number, message: unknown): Promise<unknown>
    }
}
