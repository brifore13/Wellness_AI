-- Chat History Main Table
CREATE TABLE IF NOT EXISTS chat_history_main (
    date DATE PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat Logs Table
CREATE TABLE IF NOT EXISTS chat_logs (
    id SERIAL PRIMARY KEY,
    date DATE REFERENCES chat_history_main(date) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    is_ai BOOLEAN NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, sequence_number)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_logs_date ON chat_logs(date);
CREATE INDEX IF NOT EXISTS idx_chat_logs_sequence ON chat_logs(date, sequence_number);