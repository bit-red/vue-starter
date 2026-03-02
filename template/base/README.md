[English](#english) | [Português](#português)

---

# English

## Bitred Vue

Vue 3 + TypeScript application scaffolded with [create-bitred-vue](https://github.com/bit-red/vue-starter).

### Getting Started

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |

### Project Structure

```
src/
├── assets/          # Static assets and global CSS
├── components/
│   ├── layouts/     # Layout wrappers (GuestLayout, AuthLayout)
│   ├── shared/      # Shared/reusable components
│   └── ui/          # Shadcn Vue components (kebab-case folders with barrel exports)
├── composables/     # Reusable reactive logic
├── lib/             # Utility functions
├── modules/         # Feature modules (pages, components, composables, router)
├── pages/           # Page components
├── router/          # Routing configuration
├── services/        # API layer (Axios + TanStack Query)
└── stores/          # State management (Pinia)
```

### Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) with the [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension.

### Learn More

- [Vue 3 Docs](https://vuejs.org/)
- [Vite Docs](https://vite.dev/)
- [create-bitred-vue](https://github.com/bit-red/vue-starter)

---

# Português

## Bitred Vue

Aplicação Vue 3 + TypeScript criada com [create-bitred-vue](https://github.com/bit-red/vue-starter).

### Primeiros Passos

```bash
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no navegador.

### Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento com HMR |
| `npm run build` | Verifica tipos e compila para produção |
| `npm run preview` | Pré-visualiza o build de produção |

### Estrutura do Projeto

```
src/
├── assets/          # Assets estáticos e CSS global
├── components/
│   ├── layouts/     # Wrappers de layout (GuestLayout, AuthLayout)
│   ├── shared/      # Componentes compartilhados/reutilizáveis
│   └── ui/          # Componentes Shadcn Vue (pastas kebab-case com barrel exports)
├── composables/     # Lógica reativa reutilizável
├── lib/             # Funções utilitárias
├── modules/         # Módulos de funcionalidade (pages, components, composables, router)
├── pages/           # Componentes de página
├── router/          # Configuração de rotas
├── services/        # Camada de API (Axios + TanStack Query)
└── stores/          # Gerenciamento de estado (Pinia)
```

### Setup de IDE Recomendado

[VS Code](https://code.visualstudio.com/) com a extensão [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

### Saiba Mais

- [Docs Vue 3](https://vuejs.org/)
- [Docs Vite](https://vite.dev/)
- [create-bitred-vue](https://github.com/bit-red/vue-starter)
