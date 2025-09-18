-- Create the rider_documents table for storing uploaded document metadata
CREATE TABLE IF NOT EXISTS public.rider_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rider_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    upload_status TEXT DEFAULT 'uploaded',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rider_documents_rider_id ON public.rider_documents(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_documents_document_type ON public.rider_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_rider_documents_created_at ON public.rider_documents(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.rider_documents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous uploads (for now - can be restricted later)
CREATE POLICY "Allow anonymous uploads" ON public.rider_documents
    FOR ALL USING (true);

-- Create policy to allow reading documents
CREATE POLICY "Allow reading documents" ON public.rider_documents
    FOR SELECT USING (true);
