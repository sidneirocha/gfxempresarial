# Integração do formulário BFX

O formulário do site envia os campos diretamente para este Apps Script publicado como **Web App**. O script valida o token do Cloudflare Turnstile, grava cada solicitação na planilha de respostas e envia uma notificação para `contato@bfxempresarial.com.br`.

Os links administrativos do Forms e da planilha não ficam documentados no repositório público. Mantenha-os somente no painel privado do projeto.

Esse fluxo não depende do Google Forms nem do token dinâmico `fbzx`.

A planilha deve manter as colunas nesta ordem: data/hora, nome, e-mail, telefone e mensagem.

## Configuração segura

Não salve o ID da planilha nem o segredo do Turnstile no Git. Em **Configurações do projeto > Propriedades do script**, crie:

- `BFX_SPREADSHEET_ID`: o ID privado da planilha de respostas
- `BFX_TURNSTILE_SECRET`: a chave secreta do widget
- `BFX_TURNSTILE_HOSTNAMES`: `bfxempresarial.com.br,www.bfxempresarial.com.br`

O site key do widget é público e está no HTML; o segredo deve existir somente nas propriedades do Apps Script.

## Publicação

1. Abra [script.google.com](https://script.google.com/) e crie um projeto.
2. Cole o conteúdo de `Code.gs` no editor e salve.
3. Cadastre as propriedades da seção **Configuração segura**.
4. No seletor de funções, escolha `autorizarServico` e clique em **Executar**.
5. Conceda as permissões de planilha, envio de e-mail e requisições externas solicitadas pelo Google.
6. Em **Implantar > Nova implantação**, escolha **Aplicativo da Web**.
7. Configure **Executar como: Eu** e **Quem pode acessar: Qualquer pessoa**.
8. Clique em **Implantar** e copie a URL terminada em `/exec`.
9. Substitua `COLE_A_URL_DO_WEB_APP_AQUI` em `script.js` pela URL copiada.

Depois de qualquer alteração no `Code.gs`, crie uma nova versão da implantação ou use **Implantar > Gerenciar implantações > Editar > Nova versão**.

## Teste rápido

Abra a URL `/exec` no navegador. Ela deve retornar um JSON semelhante a:

```json
{"success":true,"service":"BFX Empresarial"}
```

Em seguida, envie uma solicitação pelo site e confirme uma nova linha na aba `Respostas ao formulário 1`, um e-mail em `contato@bfxempresarial.com.br` e a resposta ao visitante no modal do site.

O endpoint aplica honeypot, Turnstile, validação de nome, e-mail, telefone e tempo mínimo de preenchimento, neutralização de fórmulas na planilha e limite de reenvios do mesmo contato por 60 segundos.
