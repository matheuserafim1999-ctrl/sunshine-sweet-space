# Cooud v2 Elements

Arquivos ajustados:

- `src/routes/api/public/cooud-checkout.ts`
- `public/checkout/js/payment-handler.js`
- `public/checkout/index.html`
- `public/confirmar-saque/index.html`
- `public/front/index.html`
- `public/front/js/main.js`
- `.env.example`

Configure a chave no ambiente do servidor/Lovable:

```bash
COOUD_SECRET_KEY=cooud_sk_live_xxx
COOUD_API_URL=https://api.cooud.com/v2
COOUD_COMPAT_DATE=2026-09-01
```

Nao coloque `cooud_sk_*` no browser. O browser chama apenas
`/api/public/cooud-checkout`; essa rota do servidor cria a sessao v2 e busca o
`element-config` por POST.
