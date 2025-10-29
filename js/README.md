# Como Visualizar o Projeto

## Passo a Passo

1. **Clone ou baixe o repositório** do projeto em seu computador.

2. **Abra o terminal/PowerShell** na pasta raiz do projeto.

3. **Inicie um servidor local** (necessário para o SPA funcionar corretamente):

   **Opção 1 - Python:**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Opção 2 - Node.js (se tiver instalado):**
   ```bash
   npx http-server -p 8000
   ```

   **Opção 3 - PHP (se tiver instalado):**
   ```bash
   php -S localhost:8000
   ```

4. **Abra seu navegador** e acesse:
   ```
   http://localhost:8000
   ```

5. **Navegue pelo projeto** usando os links do menu para testar:
   - A navegação SPA (sem recarregar a página)
   - O formulário de cadastro com validação em tempo real
   - As máscaras de input (CPF, telefone, CEP)

## Importante

⚠️ **Este projeto precisa ser executado através de um servidor local** (não abra o arquivo HTML diretamente no navegador), pois:
- O sistema SPA utiliza `fetch()` que não funciona com `file://` protocol
- As funcionalidades de navegação dinâmica dependem de um servidor HTTP

## Páginas Disponíveis

- `/index.html` ou `/` - Página inicial
- `/projetos.html` - Projetos sociais
- `/cadastro.html` - Formulário de cadastro
