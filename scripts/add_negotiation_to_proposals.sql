-- Migration script to add negotiation columns to the proposals table

-- Add negotiation_rounds column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'proposals' AND column_name = 'negotiation_rounds') THEN
        ALTER TABLE proposals ADD COLUMN negotiation_rounds JSONB;
    END IF;
END $$;

-- Add current_round column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'proposals' AND column_name = 'current_round') THEN
        ALTER TABLE proposals ADD COLUMN current_round INTEGER DEFAULT 1;
    END IF;
END $$;