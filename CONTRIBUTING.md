# Contributing

Thanks for your interest in improving grove. We welcome issues, pull requests, and discussions.

## Getting set up
1. Fork and clone the repo.
2. Install deps:
   ```bash
   npm install
   ```
3. Copy env:
   ```bash
   cp .env.local.example .env.local
   ```
4. Start Convex:
   ```bash
   npx convex dev
   ```
5. Run the app:
   ```bash
   npm run dev
   ```

## Development guidelines
- Keep PRs focused and small.
- Prefer readable, explicit code over cleverness.
- Update docs when behavior changes.

## Tests & checks
Before submitting:
```bash
npm run lint
npm run build
```

## Reporting bugs
Please include:
- Steps to reproduce
- Expected vs. actual behavior
- Logs or screenshots if relevant

## License
By contributing, you agree that your contributions will be licensed under the MIT License.
