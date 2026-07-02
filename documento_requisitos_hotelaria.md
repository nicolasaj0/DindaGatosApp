# Especificação Técnica e Documento de Requisitos: Gestão de Hotelaria Felina

**Instrução Inicial para a IA de Desenvolvimento:**
Atue como um Desenvolvedor Full-Stack Sênior e Especialista em UI/UX. O objetivo deste prompt é iniciar o desenvolvimento de uma aplicação web de gestão interna para um hotel de gatos, substituindo planilhas tradicionais por uma interface interativa, visual e amigável.

---

## 1. Contexto e Visão Geral
*   **Problema:** O gerenciamento atual via planilhas (Excel) é confuso e pouco prático para o dia a dia.
*   **Solução:** Um sistema em formato **Dashboard/Kanban** exclusivo para a administração.
*   **Foco principal:** Facilidade de uso, interações drag-and-drop, organização visual por cores e alertas automatizados de check-in/check-out.

---

## 2. Arquitetura e Stack Tecnológico Sugerido
Para garantir uma interface fluida, moderna e de fácil manutenção, utilize as seguintes tecnologias na geração do código:
*   **Frontend / Framework:** React.js (via Vite) ou Next.js.
*   **Estilização e UI:** Tailwind CSS (para prototipagem rápida e design responsivo).
*   **Drag and Drop (DnD):** `@dnd-kit/core` (moderno, acessível e flexível) ou `react-beautiful-dnd`.
*   **Ícones:** `lucide-react`.
*   **Banco de Dados / Estado Local:** Para este MVP inicial, utilize `LocalStorage` ou `IndexedDB` (via Zustand ou Context API) para persistência no navegador, ou um banco local simples como SQLite.

---

## 3. Modelo de Dados Principal
A estrutura de dados deve focar na entidade central `Hospedagem`. Abaixo está uma sugestão da interface em TypeScript para guiar a lógica:

```typescript
interface Hospedagem {
  id: string;                      // Identificador único
  nomeGato: string;
  nomeTutor: string;
  fotoUrl?: string;                // URL da foto do pet (opcional)
  dataCheckIn: string;             // ISO Date ou timestamp
  dataCheckOut: string;            // ISO Date ou timestamp
  status: 'agendado' | 'hospedado' | 'saindo_hoje' | 'concluido'; // Colunas do Kanban
  
  // Perfil e Comportamento
  perfil: {
    sociabilidade: 'sociavel' | 'isolado'; // Crucial para alocação
    personalidade: string;                 // Ex: Calmo, Medroso, Agressivo
    dieta: string;                         // Quantidade e restrições alimentares
    observacoes: string;                   // Manias, brincadeiras favoritas
    medicamentos?: string;                 // Horários e dosagens (se aplicável)
  }
}
```

---

## 4. Requisitos de Interface (UI) e Experiência do Usuário (UX)

### 4.1. Dashboard e Lembretes (Header/Sidebar)
*   **Painel de Alertas:** Uma seção em destaque que filtra e exibe automaticamente:
    *   *Entradas de Hoje:* Gatos que farão check-in.
    *   *Saídas de Hoje:* Gatos cujo `dataCheckOut` é a data atual.
    *   *Alertas Médicos:* Lembretes de horários de medicação (opcional para o MVP, mas previsto).

### 4.2. Visão Principal (Quadro Kanban)
*   A tela central não deve ser uma tabela, mas sim um quadro com colunas baseadas no `status` (Ex: Agendados, Hospedados, Saindo Hoje).
*   Os gatos são representados por **Cards (Cartões)**.
*   **Interatividade (Drag & Drop):** O administrador deve poder alterar o status de um gato simplesmente arrastando o cartão de uma coluna para outra.

### 4.3. Design dos Cartões (Cards)
*   Devem ser limpos, mostrando informações essenciais: Nome, Foto (se houver) e Data de Saída.
*   **Sistema de Tags Visuais (Cores):** Utilizar badges coloridos para bater o olho e identificar o perfil.
    *   *Verde:* Sociável.
    *   *Vermelho:* Isolado / Não juntar com outros.
    *   *Amarelo/Laranja:* Requer medicação.

### 4.4. Operações de CRUD (Manipulação Descomplicada)
*   **Inserção (Create):** Botão proeminente "Novo Hóspede". Abre um modal limpo com um formulário simples.
*   **Edição/Visualização (Read/Update):** Ao clicar em um card no Kanban, abre-se um modal detalhado (slide-over ou central) com todo o perfil do gato, permitindo edição rápida.
*   **Exclusão/Finalização (Delete):** Botão de "Finalizar Estadia" ou "Excluir". Deve sempre possuir um prompt de confirmação ("Tem certeza?") para evitar erros acidentais.

---

## 5. Instruções de Entrega para a IA
1.  **Passo 1:** Crie a estrutura base do estado (mocks de dados baseados na interface acima).
2.  **Passo 2:** Desenvolva o layout principal do Dashboard (Header com alertas + Colunas do Kanban).
3.  **Passo 3:** Implemente o componente do Card individual com as tags coloridas.
4.  **Passo 4:** Adicione a funcionalidade de Drag and Drop.

*Por favor, forneça o código modularizado (separando componentes) para facilitar a implementação.*
