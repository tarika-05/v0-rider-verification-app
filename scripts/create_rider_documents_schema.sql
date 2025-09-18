-- Create riders table for user profiles
CREATE TABLE IF NOT EXISTS public.riders (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table for storing uploaded documents
CREATE TABLE IF NOT EXISTS public.rider_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID NOT NULL REFERENCES public.riders(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('license', 'registration', 'insurance', 'identity', 'vehicle_photo')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id)
);

-- Create QR codes table for verification
CREATE TABLE IF NOT EXISTS public.rider_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID NOT NULL REFERENCES public.riders(id) ON DELETE CASCADE,
  qr_code_data TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable Row Level Security
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_qr_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for riders table
CREATE POLICY "riders_select_own" ON public.riders
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "riders_insert_own" ON public.riders
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "riders_update_own" ON public.riders
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for rider_documents table
CREATE POLICY "documents_select_own" ON public.rider_documents
  FOR SELECT USING (auth.uid() = rider_id);

CREATE POLICY "documents_insert_own" ON public.rider_documents
  FOR INSERT WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "documents_update_own" ON public.rider_documents
  FOR UPDATE USING (auth.uid() = rider_id);

CREATE POLICY "documents_delete_own" ON public.rider_documents
  FOR DELETE USING (auth.uid() = rider_id);

-- Allow fuel stations and police to view documents for verification
CREATE POLICY "documents_view_for_verification" ON public.rider_documents
  FOR SELECT USING (verification_status = 'verified');

-- RLS Policies for rider_qr_codes table
CREATE POLICY "qr_codes_select_own" ON public.rider_qr_codes
  FOR SELECT USING (auth.uid() = rider_id);

CREATE POLICY "qr_codes_insert_own" ON public.rider_qr_codes
  FOR INSERT WITH CHECK (auth.uid() = rider_id);

-- Allow fuel stations and police to read QR codes for verification
CREATE POLICY "qr_codes_view_for_verification" ON public.rider_qr_codes
  FOR SELECT USING (is_active = TRUE AND expires_at > NOW());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rider_documents_rider_id ON public.rider_documents(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_documents_type ON public.rider_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_rider_qr_codes_rider_id ON public.rider_qr_codes(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_qr_codes_active ON public.rider_qr_codes(is_active, expires_at);

-- Create trigger to auto-create rider profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_rider()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.riders (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_rider ON auth.users;

CREATE TRIGGER on_auth_user_created_rider
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_rider();
