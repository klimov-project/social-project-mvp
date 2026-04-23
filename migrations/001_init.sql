CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  login VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'USER',
  refer_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_login ON users(login);
CREATE INDEX idx_users_refer_id ON users(refer_id);

CREATE TABLE accounts (
  id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(100) UNIQUE NOT NULL,
  avatar TEXT NULL,
  bio TEXT NULL,
  reputation_score DECIMAL(3,2) DEFAULT 0.00,
  deals_count INTEGER DEFAULT 0,
  positive_feedback_percent INTEGER DEFAULT 0,
  verifications JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_username ON accounts(username);
CREATE INDEX idx_accounts_reputation ON accounts(reputation_score DESC);
