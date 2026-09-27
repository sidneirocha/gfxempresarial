# Integração do formulário BFX

O frontend está conectado diretamente ao Google Forms BFX, seguindo o mesmo fluxo usado pela VibeSoft: uma requisição `POST` para `/formResponse` com os IDs dos campos.

Formulário: https://docs.google.com/forms/d/17ekoahw72W65QWBbxxGp6jT_BXaYwyVdk09y0pykXgI/edit

Planilha de respostas: https://docs.google.com/spreadsheets/d/1G47KlQ6QXRdixp0Rm5Me7zDpkTQYT4mDUnzPd_Fae18/edit

IDs atualmente configurados:

- Nome: `entry.1972608986`
- E-mail: `entry.1380888189`
- Telefone: `entry.512800247`
- Mensagem: `entry.1321566934`

O arquivo `Code.gs` permanece como alternativa caso seja necessário migrar futuramente para um endpoint próprio com validação antispam no servidor.

## Publicação

1. Abra [script.google.com](https://script.google.com/) e crie um projeto.
2. Cole o conteúdo de `Code.gs` no editor e salve.
3. Em **Implantar > Nova implantação**, escolha **Aplicativo da Web**.
4. Configure **Executar como: Eu** e **Quem pode acessar: Qualquer pessoa**.
5. Autorize o envio de e-mails quando o Google solicitar.
6. Copie a URL terminada em `/exec`.
7. Substitua `COLE_A_URL_DO_WEB_APP_AQUI` em `script.js` pela URL copiada.

O script envia as mensagens para `contato@gfxempresarial.com.br`, usa o e-mail do visitante apenas como `Reply-To` e mantém a proteção no servidor contra honeypot, preenchimento automatizado, telefone sem DDD, envio rápido e repetição por 60 segundos.
