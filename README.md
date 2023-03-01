# vue-reactive-query

- Includes TypeScript types
- Query parameters in the URL will change when the state changes
- Keys in the query can be minified (eg: `['horse', 'house']` -> `['h', 'u']`)
- When possible, query values are also minified
- Query parameters will remove themselves from the URL entirely when set back to
  their default value
- Values are preserved on page reloads, or when the user copies and pastes the
  URL in their browser

## [Demo](https://cjcarrick.github.io/vue-reactive-query)

## Install:

```sh
npm install vue-reactive-query
```

## Use:

```javascript
import ReactiveQuery from 'vue-reactive-query'

const query = new ReactiveQuery({ route, router })
  .createStringParam('name', '')
  .minifyIdentifiers()

const { name } = query.refs
```

## Find a full example in `example/`
