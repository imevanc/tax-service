import { pool } from "./pool";

export const initDatabase = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query(`
            CREATE TABLE IF NOT EXISTS transactions
            (
                id
                           SERIAL
                    PRIMARY
                        KEY,
                event_type
                           VARCHAR(20)              NOT NULL,
                date       TIMESTAMP WITH TIME ZONE NOT NULL,
                invoice_id VARCHAR(255),
                data       JSONB                    NOT NULL,
                created_at TIMESTAMP
                               WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

    await client.query(`
            CREATE TABLE IF NOT EXISTS amendments
            (
                id
                           SERIAL
                    PRIMARY
                        KEY,
                date
                           TIMESTAMP
                               WITH
                               TIME
                               ZONE
                                        NOT
                                            NULL,
                invoice_id
                           VARCHAR(255) NOT NULL,
                item_id    VARCHAR(255) NOT NULL,
                cost       INTEGER      NOT NULL,
                tax_rate   REAL         NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

    console.log("[DB] Database initialised successfully");
  } catch (err) {
    console.error("[DB] Error initialising database:", err);
    throw err;
  } finally {
    client.release();
  }
};
