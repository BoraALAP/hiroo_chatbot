-- Create a function to execute SQL statements
-- Note: This requires superuser privileges, so you may need to run this manually in the Supabase SQL editor
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$; 