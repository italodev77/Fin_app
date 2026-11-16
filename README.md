# Fin_app

App Android de controle financeiro pessoal: contas fixas, dívidas e parcelas, receita líquida, lançamentos avulsos e avisos de vencimento. Os dados ficam no aparelho (SQLite), sem login e sem internet.

## Stack

- React Native + Expo (TypeScript) com Expo Router
- `expo-sqlite` para persistência
- `expo-notifications` para avisos locais agendados
- Zustand para estado
- Jest para as regras de negócio

Valores monetários são guardados em centavos (inteiros) e formatados em pt-BR só na interface.

## Estrutura

```
app/            rotas (tabs: início, contas, dívidas, receita, ajustes; modais)
src/domain/     regras puras: receita, geração mensal, resumo, dívidas, notificações, backup
src/db/         schema, migrações, repositórios e seed
src/services/   agendamento de notificações
src/store/      estado global
src/hooks/      carregamento de dados por mês
src/ui/         componentes e tema
tests/          testes das regras de negócio
```

## Desenvolvimento

```bash
npm install
npm run lint
npm run typecheck
npm test
```

Notificações e SQLite exigem um build nativo (não funciona no Expo Go):

```bash
npx expo run:android
```

## Instalar no aparelho

APK pelo EAS:

```bash
npx eas build -p android --profile preview
```

Ou build local com o aparelho conectado por USB (depuração ativada):

```bash
npx expo run:android --variant release
```

## Notificações no Android

Para os avisos chegarem no horário com o app fechado, em aparelhos Xiaomi/POCO libere em Configurações > Apps > Fin: início automático, economia de bateria "Sem restrições" e permissão de alarmes e lembretes.

## Backup

Em Ajustes é possível exportar todos os dados para um arquivo JSON e importá-lo depois, substituindo os dados atuais.
