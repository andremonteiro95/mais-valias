# Contributing

## Conventional Commits

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>: <description>

[optional body]
```

### Types

| Type       | Description                                              |
|------------|----------------------------------------------------------|
| `feat`     | New feature                                              |
| `fix`      | Bug fix                                                  |
| `docs`     | Documentation changes only                               |
| `style`    | Formatting, missing semicolons, etc. (no logic change)   |
| `refactor` | Code change that is neither a fix nor a feature          |
| `test`     | Adding or updating tests                                 |
| `chore`    | Build process, dependency updates, tooling               |
| `perf`     | Performance improvement                                  |

### Examples

```
feat: add reinvestment exemption calculation
fix: correct coefficient year dropdown binding
docs: add contributing guidelines
chore: update bun lockfile
refactor: extract tax liability into helper function
```
