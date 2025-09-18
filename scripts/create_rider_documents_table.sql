-- Create the rider_documents table for storing document upload information
CREATE TABLE IF NOT EXISTS public.rider_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  qr_code TEXT,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on rider_id for faster queries
CREATE INDEX IF NOT EXISTS idx_rider_documents_rider_id ON public.rider_documents(rider_id);

-- Create an index on upload_date for sorting
CREATE INDEX IF NOT EXISTS idx_rider_documents_upload_date ON public.rider_documents(upload_date);

-- Enable Row Level Security
ALTER TABLE public.rider_documents ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (since we're using anonymous uploads)
CREATE POLICY "Allow all operations on rider_documents" ON public.rider_documents
FOR ALL USING (true) WITH CHECK (true);
