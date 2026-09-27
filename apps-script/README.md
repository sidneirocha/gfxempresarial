# Integração do formulário BFX

O formulário do site envia os campos diretamente para este Apps Script publicado como **Web App**. O script grava cada solicitação na planilha de respostas e envia uma notificação para `contato@bfxempresarial.com.br`.

Formulário: https://docs.google.com/forms/d/17ekoahw72W65QWBbxxGp6jT_BXaYwyVdk09y0pykXgI/edit

Planilha de respostas: https://docs.google.com/spreadsheets/d/1G47KlQ6QXRdixp0Rm5Me7zDpkTQYT4mDUnzPd_Fae18/edit

Esse fluxo não depende do Google Forms nem do token dinâmico `fbzx`.

A planilha deve manter as colunas nesta ordem: data/hora, nome, e-mail, telefone e mensagem.

## Publicação

1. Abra [script.google.com](https://script.google.com/) e crie um projeto.
2. Cole o conteúdo de `Code.gs` no editor e salve.
3. No seletor de funções, escolha `autorizarServico` e clique em **Executar**.
4. Conceda as permissões de planilha e envio de e-mail solicitadas pelo Google.
5. Em **Implantar > Nova implantação**, escolha **Aplicativo da Web**.
6. Configure **Executar como: Eu** e **Quem pode acessar: Qualquer pessoa**.
7. Clique em **Implantar** e copie a URL terminada em `/exec`.
8. Substitua `COLE_A_URL_DO_WEB_APP_AQUI` em `script.js` pela URL copiada.

Depois de qualquer alteração no `Code.gs`, crie uma nova versão da implantação ou use **Implantar > Gerenciar implantações > Editar > Nova versão**.

## Teste rápido

Abra a URL `/exec` no navegador. Ela deve retornar um JSON semelhante a:

```json
{"success":true,"service":"BFX Empresarial"}
```

Em seguida, envie uma solicitação pelo site e confirme uma nova linha na aba `Respostas ao formulário 1`, um e-mail em `contato@bfxempresarial.com.br` e a resposta ao visitante no modal do site.

O endpoint aplica honeypot, validação de nome, e-mail, telefone e tempo mínimo de preenchimento, além de limitar reenvios do mesmo contato por 60 segundos.
