-- Chat History Main Table (one entry per user per day)
CREATE TABLE IF NOT EXISTS chat_history_main (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, date)
);

-- Chat Logs Table
CREATE TABLE IF NOT EXISTS chat_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    sequence_number INTEGER NOT NULL,
    is_ai BOOLEAN NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id, date) REFERENCES chat_history_main(user_id, date) ON DELETE CASCADE,
    UNIQUE(user_id, date, sequence_number)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_date ON chat_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_chat_logs_sequence ON chat_logs(user_id, date, sequence_number);
