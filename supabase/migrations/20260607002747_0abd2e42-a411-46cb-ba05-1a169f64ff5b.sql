-- Create the saques table
CREATE TABLE IF NOT EXISTS public.saques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_pedido TEXT UNIQUE NOT NULL,
    email_cliente TEXT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Em processamento',
    posicao_fila INTEGER NOT NULL,
    total_solicitacoes INTEGER NOT NULL DEFAULT 1250,
    metodo_recebimento TEXT NOT NULL DEFAULT 'PIX',
    previsao_dias INTEGER NOT NULL DEFAULT 7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Grant access
GRANT SELECT ON public.saques TO anon, authenticated;
GRANT ALL ON public.saques TO service_role;

-- Enable RLS
ALTER TABLE public.saques ENABLE ROW LEVEL SECURITY;

-- Allow public read access by order number
CREATE POLICY "Permitir consulta pública por número do pedido" 
ON public.saques FOR SELECT 
TO public 
USING (true);

-- Insert a test order from "yesterday" (relative to system date June 7, 2026)
INSERT INTO public.saques (numero_pedido, email_cliente, valor, status, posicao_fila, created_at)
VALUES ('SQ-998877', 'teste@exemplo.com', 450.00, 'Em processamento', 125, '2026-06-06 14:30:00+00');