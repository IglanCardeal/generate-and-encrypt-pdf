<div align="center">

# Gerador de PDFs Seguros

<img src="./docs/pdf-encrypt.png" alt="drawing" width="200"/>

## A partir de arquivos HTML e templates Handlebars

</div>

Este projeto tem com intuito de ser uma boa consulta para tomar como base para casos em que é necessário implementar funções para geração de arquivos PDFs com base em templates ou arquivos HTML, no `Node.js`.

## Sobre

O projeto possui 3 endpoints de API para gerar arquivos PDF, variando desde PDFs gerados por um template estático de HTML até a geração de PDFs com dados dinâmicos resultando em string no formato Base64. Um dos endpoint permite gerar PDF com dados informados no corpo da requisição e ainda oferecendo a opção de adicionar uma senha ao arquivo gerado.

Um simples servidor HTTP feito em Express foi criado para oferecer os endpoints na porta padrão `3000` e são usadas as seguintes rotas com as devidas funcionalidades:

- `POST /dynamic`, para criar um PDF com base em dados fornecidos no corpo da requisição.

- `GET /64`, para gerar um PDF protegido em Base64 com dados fixos pré-determinados para exemplo.

- `GET /static`, para gerar um PDF com corpo estático.

## Detalhes
