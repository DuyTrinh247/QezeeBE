-- Add file_url column to pdf_files table
ALTER TABLE pdf_files 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN pdf_files.file_url IS 'External URL for PDF file (alternative to file_path)';
