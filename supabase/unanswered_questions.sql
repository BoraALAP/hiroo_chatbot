-- Create a table for storing unanswered questions
CREATE TABLE IF NOT EXISTS unanswered_questions (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  processed_question TEXT,
  is_reasonable BOOLEAN,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'added_to_kb')),
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on the status column for faster filtering
CREATE INDEX IF NOT EXISTS unanswered_questions_status_idx ON unanswered_questions(status);

-- Create a function to add an unanswered question
CREATE OR REPLACE FUNCTION add_unanswered_question(
  question_text TEXT,
  processed_question_text TEXT DEFAULT NULL,
  user_identifier TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id BIGINT;
BEGIN
  INSERT INTO unanswered_questions (
    question,
    processed_question,
    user_id
  ) VALUES (
    question_text,
    processed_question_text,
    user_identifier
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Create a function to update the reasonableness assessment of a question
CREATE OR REPLACE FUNCTION update_question_assessment(
  question_id BIGINT,
  is_reasonable_flag BOOLEAN,
  reason_text TEXT DEFAULT NULL,
  new_status TEXT DEFAULT 'reviewed'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE unanswered_questions
  SET 
    is_reasonable = is_reasonable_flag,
    reason = reason_text,
    status = new_status,
    updated_at = NOW()
  WHERE id = question_id;
END;
$$;

-- Create a function to get pending questions for assessment
CREATE OR REPLACE FUNCTION get_pending_questions(
  limit_count INT DEFAULT 10
)
RETURNS TABLE (
  id BIGINT,
  question TEXT,
  processed_question TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    uq.id,
    uq.question,
    uq.processed_question,
    uq.created_at
  FROM
    unanswered_questions uq
  WHERE
    uq.status = 'pending'
  ORDER BY
    uq.created_at ASC
  LIMIT
    limit_count;
END;
$$;

-- Create a function to mark a question as added to the knowledge base
CREATE OR REPLACE FUNCTION mark_question_added_to_kb(
  question_id BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE unanswered_questions
  SET 
    status = 'added_to_kb',
    updated_at = NOW()
  WHERE id = question_id;
END;
$$; 