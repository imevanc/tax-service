export const logger = {
    info: (message: string, meta?: any) => {
        console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '');
    },
    error: (message: string, error?: any) => {
        console.error(`[ERROR] ${message}`, error ? JSON.stringify(error) : '');
    }
};