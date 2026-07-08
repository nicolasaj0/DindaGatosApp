# 🐾 DindaGatos App

O **DindaGatos App** é um sistema web moderno, fluido e intuitivo desenvolvido para gerenciar e organizar hospedagens de gatos. Projetado com foco em usabilidade para usuários leigos, o aplicativo simplifica a gestão de rotinas de hotelaria felina, acompanhamento de estadias, controle de medicações e faturamento.

---

## ✨ Principais Funcionalidades

### 📋 Quadro Kanban Inteligente
Acompanhe o fluxo das hospedagens em tempo real através de colunas organizacionais automáticas:
- **Agendados**: Próximas estadias planejadas.
- **Hospedados**: Gatos que estão atualmente no hotel.
- **Saindo Hoje**: Hóspedes que finalizam a estadia no dia corrente.
- **Concluídos**: Histórico de estadias finalizadas.

### 🔍 Busca e Filtros Rápidos (Tempo Real)
- **Barra de Pesquisa**: Encontre qualquer hóspede instantaneamente digitando o nome do gato ou do tutor.
- **Filtros Rápidos**: Triagem com um clique para focar em grupos específicos:
  - **Todos**: Exibição completa.
  - **Medicamentos** 💊: Exibe apenas os gatos com tratamento ativo.
  - **Isolados** 🔒: Exibe apenas gatos que não socializam com outros.
  - **Sociáveis** 🤝: Exibe apenas gatos liberados para socialização.

### 💰 Gerenciador de Estadias e Precificação
- **Cálculo Automático de Diárias**: Insira as datas de check-in e check-out e o sistema calcula a duração exata da estadia.
- **Valor da Diária Personalizável**: Defina valores individuais por hóspede (padrão de R$ 50,00) e veja o valor total estimado na hora.
- **Visualização Rápida**: Valores exibidos diretamente nos cartões Kanban e detalhados na ficha do hóspede.
- **Validação de Segurança**: Bloqueio inteligente que impede o agendamento de check-out antes da data de check-in.

### 🚨 Alerta Visual Pulsante de Medicamentos
- Gatos hospedados que possuem medicação pendente exibem um alerta vermelho pulsante (`animate-pulse`) no Kanban, chamando a atenção do cuidador imediatamente para garantir que nenhum horário seja esquecido.

### 🖼️ Upload e Otimização de Imagens
- Suporte para upload de fotos locais e URLs da internet.
- **Compressão Automática via Canvas**: Redimensiona e otimiza imagens localmente (largura/altura máxima de 256px e qualidade JPEG 0.7) mantendo os arquivos serializados abaixo de 15KB para não sobrecarregar o armazenamento local.

### 🌗 Modo Escuro Premium (Dark Mode)
- Interface com tema claro e escuro.
- Detecção automática da preferência do sistema operacional e persistência de escolha.
- Transições de cores suaves para uma experiência noturna confortável.

### 💾 Backup e Restauração de Dados
- **Salvar Cópia (Backup)**: Exporta todos os registros das hospedagens em formato JSON.
- **Restaurar Cópia**: Importa cópias de segurança anteriores com facilidade.
- Persistência total em estado local (`localStorage` via Zustand persist).

---

## 🛠️ Tecnologias Utilizadas

- **Core**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build/Bundler**: [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) (Estilos e componentes sob medida)
- **Gerenciamento de Estado**: [Zustand](https://zustand-demo.pmnd.rs/) (com persistência automática)
- **Ícones**: [Lucide React](https://lucide.dev/)

---

## 📱 Design Responsivo e Mobile-First

O aplicativo foi otimizado para funcionar perfeitamente em celulares e tablets, sem prejudicar a experiência em telas grandes:
- **Visualização em Abas no Mobile**: Em telas pequenas, o Kanban é exibido através de abas deslizantes de fácil clique. Em telas maiores, as colunas são exibidas lado a lado automaticamente.
- **Fichas e Modais Adaptativos**: Os modais de visualização tornam-se painéis deslizantes (Drawers) de tela cheia em dispositivos móveis, facilitando a navegação com gestos de toque.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em sua máquina.

### Passos para Instalação e Execução

1. **Clonar o Repositório:**
   ```bash
   git clone https://github.com/nicolasaj0/DindaGatosApp.git
   cd DindaGatosApp
   ```

2. **Instalar Dependências:**
   ```bash
   npm install
   ```

3. **Executar o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a URL gerada no terminal (geralmente `http://localhost:5173`) no seu navegador.

4. **Compilar para Produção (Build):**
   ```bash
   npm run build
   ```
   A pasta `dist` será gerada com os arquivos estáticos prontos para hospedagem (Vercel, Netlify, Github Pages, etc.).

---

## 📐 Diretrizes de Desenvolvimento e Regras do Projeto

Caso queira estender ou modificar o código deste projeto, siga as diretrizes técnicas estabelecidas:

- **Fuso Horário e Datas**: Nunca formate datas `YYYY-MM-DD` instanciando `new Date(dateStr)` diretamente (evita bugs de fuso horário deslocando o dia em -1). Utilize splits de string para formatação direta ou funções locais helpers de `getFullYear()`, `getMonth() + 1`, `getDate()`.
- **Modo Leitura por Padrão**: Modais de visualização de registros devem sempre abrir em modo leitura para evitar exclusões ou alterações acidentais. Inclua um botão explícito para ativar o modo de edição.
- **Otimização de Mídias**: Qualquer imagem local carregada no estado deve obrigatoriamente passar pelo utilitário de compressão em canvas antes de ser serializada.
- **Sem Jargões Técnicos**: Use sempre termos amigáveis para usuários não-técnicos (ex: "Salvar Cópia (Backup)" em vez de "Exportar JSON").
