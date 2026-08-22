# DindaGatos App

Aplicação web para gerenciar hospedagens de gatos: acompanhamento de estadias, controle de medicações e faturamento, com foco em usabilidade para usuários sem experiência técnica.

## Funcionalidades

### Quadro Kanban
Colunas organizadas automaticamente pelo status da estadia:
- **Agendados** — próximas estadias planejadas.
- **Hospedados** — gatos atualmente no hotel.
- **Saindo hoje** — hóspedes que finalizam a estadia no dia.
- **Concluídos** — histórico de estadias finalizadas.

### Busca e filtros
- Busca por nome do gato ou do tutor, em tempo real.
- Filtros rápidos: todos, com medicação ativa, isolados (não socializam) e sociáveis.

### Estadias e precificação
- Cálculo automático da duração da estadia a partir das datas de check-in e check-out.
- Valor de diária configurável por hóspede (padrão R$ 50,00), com total estimado calculado automaticamente.
- Validação que impede definir check-out anterior ao check-in.
- Valores exibidos nos cartões do Kanban e na ficha do hóspede.

### Alerta de medicação
Hóspedes com medicação pendente exibem um indicador visual pulsante no Kanban, para chamar atenção do cuidador.

### Upload de imagens
- Suporte a upload local ou por URL.
- Compressão automática via canvas (redimensionamento para até 256px e qualidade JPEG 0.7), mantendo o arquivo serializado abaixo de 15KB.

### Modo escuro
Tema claro/escuro com detecção da preferência do sistema operacional e persistência da escolha do usuário.

### Backup e restauração
Exportação e importação dos dados em JSON. Persistência local via Zustand (`localStorage`).

## Tecnologias

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/) (com persistência)
- [Lucide React](https://lucide.dev/) (ícones)

## Design responsivo

- Em telas pequenas, o Kanban é exibido em abas deslizantes; em telas maiores, as colunas aparecem lado a lado.
- Modais de visualização se tornam painéis (drawers) de tela cheia em dispositivos móveis.

## Rodando localmente

Pré-requisito: [Node.js](https://nodejs.org/) instalado.

```bash
git clone https://github.com/nicolasaj0/DindaGatosApp.git
cd DindaGatosApp
npm install
npm run dev
```

Acesse a URL exibida no terminal (geralmente `http://localhost:5173`).

Para build de produção:

```bash
npm run build
```

Os arquivos estáticos são gerados na pasta `dist`, prontos para hospedagem (Vercel, Netlify, GitHub Pages etc.).
