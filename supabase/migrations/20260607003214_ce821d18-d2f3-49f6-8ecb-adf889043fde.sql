-- Update the test record with a more common funnel method like 'Bizum'
UPDATE public.saques 
SET metodo_recebimento = 'Bizum',
    valor = 556.52
WHERE numero_pedido = 'SQ-998877';

-- Ensure we can easily update these from the frontend/checkout later
COMMENT ON COLUMN public.saques.metodo_recebimento IS 'Metodo de recebimento (ex: Bizum, PayPal, PIX, Credit Card)';