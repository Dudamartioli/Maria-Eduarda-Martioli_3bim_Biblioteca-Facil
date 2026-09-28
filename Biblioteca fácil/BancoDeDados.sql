-- =====================================================================
-- Projeto DW1 - Sistema de Biblioteca (3º bimestre 2026)
--
-- Relacionamentos:
--   autor      1:N livro
--   editora    1:N livro
--   cargo      1:N funcionario
--   pessoa     1:1 funcionario   (funcionario.cpf é PK e FK de pessoa)
--   pessoa     1:1 usuario       (usuario.cpf é PK e FK de pessoa)
--
-- =====================================================================

-- Recria as tabelas do zero (permite rodar o script várias vezes)
DROP TABLE IF EXISTS livro       CASCADE;
DROP TABLE IF EXISTS funcionario CASCADE;
DROP TABLE IF EXISTS usuario     CASCADE;
DROP TABLE IF EXISTS pessoa      CASCADE;
DROP TABLE IF EXISTS cargo       CASCADE;
DROP TABLE IF EXISTS editora     CASCADE;
DROP TABLE IF EXISTS autor       CASCADE;

-- =====================================================================
-- CREATE TABLE
-- =====================================================================

-- Tabelas independentes ------------------------------------------------

CREATE TABLE cargo (
    id_cargo    SERIAL PRIMARY KEY,
    nome_cargo  VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE autor (
    id_autor      SERIAL PRIMARY KEY,
    nome          VARCHAR(100) NOT NULL,
    nacionalidade VARCHAR(50)              -- extra
);

CREATE TABLE editora (
    id_editora    SERIAL PRIMARY KEY,
    nome_editora  VARCHAR(100) NOT NULL,
    cidade        VARCHAR(60)              -- extra
);

CREATE TABLE pessoa (
    cpf              CHAR(11) PRIMARY KEY,
    nome             VARCHAR(100) NOT NULL,
    email            VARCHAR(120) NOT NULL UNIQUE,
    data_nascimento  DATE NOT NULL,
    CONSTRAINT ck_pessoa_cpf CHECK (cpf ~ '^[0-9]{11}$')
);

-- Tabelas com relacionamento 1:N ---------------------------------------

CREATE TABLE livro (
    issn            VARCHAR(9) PRIMARY KEY,   -- formato 1234-5678
    titulo          VARCHAR(150) NOT NULL,
    id_autor        INTEGER NOT NULL,
    id_editora      INTEGER NOT NULL,
    ano_publicacao  INTEGER,                  -- extra
    capa            VARCHAR(255),             -- extra: nome do arquivo da imagem (CRUD com imagens)
    CONSTRAINT ck_livro_issn CHECK (issn ~ '^[0-9]{4}-[0-9]{3}[0-9X]$'),
    CONSTRAINT fk_livro_autor
        FOREIGN KEY (id_autor)   REFERENCES autor (id_autor),
    CONSTRAINT fk_livro_editora
        FOREIGN KEY (id_editora) REFERENCES editora (id_editora)
);

-- Tabelas com relacionamento 1:1 com pessoa ----------------------------

CREATE TABLE funcionario (
    cpf             CHAR(11) PRIMARY KEY,
    salario         NUMERIC(10,2) NOT NULL CHECK (salario >= 0),
    nome_cargo      VARCHAR(60) NOT NULL,
    data_admissao   DATE NOT NULL DEFAULT CURRENT_DATE,   -- extra
    CONSTRAINT fk_funcionario_pessoa
        FOREIGN KEY (cpf)      REFERENCES pessoa (cpf) ON DELETE CASCADE,
    CONSTRAINT fk_funcionario_cargo
        FOREIGN KEY (nome_cargo) REFERENCES cargo (nome_cargo)
);

CREATE TABLE cliente (
    cpf             CHAR(11) PRIMARY KEY,
    data_cadastro   DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT fk_cliente_pessoa
        FOREIGN KEY (cpf) REFERENCES pessoa (cpf) ON DELETE CASCADE
);

-- =====================================================================
-- INSERT INTO (10 registros ou mais por tabela)
-- =====================================================================

INSERT INTO cargo (nome_cargo) VALUES
    ('Gerente'),
    ('Coordenador'),
    ('Bibliotecário'),
    ('Catalogador'),
    ('Atendente'),
    ('Auxiliar de Biblioteca'),
    ('Restaurador'),
    ('Estagiário'),
    ('Segurança'),
    ('Auxiliar de Limpeza');

INSERT INTO autor (nome, nacionalidade) VALUES
    ('Machado de Assis',            'Brasileira'),
    ('Clarice Lispector',           'Brasileira'),
    ('Monteiro Lobato',             'Brasileira'),
    ('Jorge Amado',                 'Brasileira'),
    ('Carlos Drummond de Andrade',  'Brasileira'),
    ('Cecília Meireles',            'Brasileira'),
    ('Graciliano Ramos',            'Brasileira'),
    ('Rachel de Queiroz',           'Brasileira'),
    ('Lygia Fagundes Telles',       'Brasileira'),
    ('João Guimarães Rosa',         'Brasileira');

INSERT INTO editora (nome_editora, cidade) VALUES
    ('Companhia das Letras', 'São Paulo'),
    ('Editora Record',       'Rio de Janeiro'),
    ('Rocco',                'Rio de Janeiro'),
    ('Editora Globo',        'São Paulo'),
    ('Intrínseca',           'Rio de Janeiro'),
    ('Editora Ática',        'São Paulo'),
    ('Editora Moderna',      'São Paulo'),
    ('Nova Fronteira',       'Rio de Janeiro'),
    ('L&PM Editores',        'Porto Alegre'),
    ('Editora Sextante',     'Rio de Janeiro');

INSERT INTO livro (issn, titulo, id_autor, id_editora, ano_publicacao, capa) VALUES
    ('2345-0001', 'Dom Casmurro',                 1,  1, 1899, 'dom-casmurro.jpg'),
    ('2345-0002', 'A Hora da Estrela',            2,  2, 1977, 'a-hora-da-estrela.jpg'),
    ('2345-0003', 'Reinações de Narizinho',       3,  3, 1931, 'reinacoes-de-narizinho.jpg'),
    ('2345-0004', 'Capitães da Areia',            4,  4, 1937, 'capitaes-da-areia.jpg'),
    ('2345-0005', 'A Rosa do Povo',               5,  5, 1945, 'a-rosa-do-povo.jpg'),
    ('2345-0006', 'Romanceiro da Inconfidência',  6,  6, 1953, 'romanceiro-da-inconfidencia.jpg'),
    ('2345-0007', 'Vidas Secas',                  7,  7, 1938, 'vidas-secas.jpg'),
    ('2345-0008', 'O Quinze',                     8,  8, 1930, 'o-quinze.jpg'),
    ('2345-0009', 'As Meninas',                   9,  9, 1973, 'as-meninas.jpg'),
    ('2345-0010', 'Grande Sertão: Veredas',      10, 10, 1956, 'grande-sertao-veredas.jpg');

-- 20 pessoas: as 10 primeiras serão funcionários, as 10 últimas usuários
INSERT INTO pessoa (cpf, nome, email, data_nascimento) VALUES
    ('10000000001', 'Ana Paula Souza',        'ana.souza@email.com',        '1988-03-12'),
    ('10000000002', 'Bruno Henrique Lima',    'bruno.lima@email.com',       '1990-07-25'),
    ('10000000003', 'Carla Mendes Ribeiro',   'carla.ribeiro@email.com',    '1985-11-02'),
    ('10000000004', 'Daniel Oliveira Santos', 'daniel.santos@email.com',    '1992-01-18'),
    ('10000000005', 'Eduarda Ferreira Costa', 'eduarda.costa@email.com',    '1995-09-30'),
    ('10000000006', 'Felipe Araújo Martins',  'felipe.martins@email.com',   '1987-05-14'),
    ('10000000007', 'Gabriela Nunes Barbosa', 'gabriela.barbosa@email.com', '1993-12-08'),
    ('10000000008', 'Henrique Duarte Pinto',  'henrique.pinto@email.com',   '1980-04-21'),
    ('10000000009', 'Isabela Rocha Carvalho', 'isabela.carvalho@email.com', '1998-06-05'),
    ('10000000010', 'João Victor Almeida',    'joao.almeida@email.com',     '1991-10-17'),
    ('10000000011', 'Karina Batista Lopes',   'karina.lopes@email.com',     '2001-02-27'),
    ('10000000012', 'Lucas Moreira Teixeira', 'lucas.teixeira@email.com',   '1999-08-19'),
    ('10000000013', 'Mariana Castro Freitas', 'mariana.freitas@email.com',  '2003-05-09'),
    ('10000000014', 'Nicolas Gomes Andrade',  'nicolas.andrade@email.com',  '2000-11-23'),
    ('10000000015', 'Olívia Cardoso Pereira', 'olivia.pereira@email.com',   '1996-03-31'),
    ('10000000016', 'Pedro Henrique Melo',    'pedro.melo@email.com',       '2002-07-14'),
    ('10000000017', 'Queila Vieira Monteiro', 'queila.monteiro@email.com',  '1994-09-06'),
    ('10000000018', 'Rafael Correia Dias',    'rafael.dias@email.com',      '1997-01-29'),
    ('10000000019', 'Sofia Ramos Cavalcanti', 'sofia.cavalcanti@email.com', '2004-04-12'),
    ('10000000020', 'Thiago Barros Fonseca',  'thiago.fonseca@email.com',   '1989-12-25');

INSERT INTO funcionario (cpf, salario, nome_cargo, data_admissao) VALUES
    ('10000000001', 7500.00, 'Gerente', '2018-02-01'),
    ('10000000002', 5200.00, 'Coordenador', '2019-05-13'),
    ('10000000003', 4300.00, 'Bibliotecário', '2020-08-03'),
    ('10000000004', 3600.00, 'Catalogador', '2021-01-11'),
    ('10000000005', 2400.00, 'Atendente', '2022-03-07'),
    ('10000000006', 2200.00, 'Auxiliar de Biblioteca', '2022-09-19'),
    ('10000000007', 3800.00, 'Restaurador', '2023-02-06'),
    ('10000000008', 1500.00, 'Estagiário', '2024-01-15'),
    ('10000000009', 2600.00, 'Segurança', '2024-06-03'),
    ('10000000010', 1900.00, 'Auxiliar de Limpeza', '2025-02-10');

INSERT INTO cliente (cpf, data_cadastro) VALUES
    ('10000000011', '2025-02-03'),
    ('10000000012', '2025-03-17'),
    ('10000000013', '2025-04-22'),
    ('10000000014', '2025-06-09'),
    ('10000000015', '2025-08-14'),
    ('10000000016', '2025-10-01'),
    ('10000000017', '2026-01-20'),
    ('10000000018', '2026-03-05'),
    ('10000000019', '2026-05-18'),
    ('10000000020', '2026-08-25');