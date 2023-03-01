<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import ReactiveQuery from '../src/'
// Your import statement will likely be:
// import ReactiveQuery from 'vue-reactive-query'

const route = useRoute()
const router = useRouter()

const animals = ['Dog', 'Cat', 'Mouse', 'Camel']
const mealtimes = ['Morning', 'Noon', 'Evening']

const query = new ReactiveQuery({ route, router })
  .createStringParam('animal', 'Dog', animals)
  .createStringParam('food', '')
  .createBooleanParam('human', false)
  .createIntParam('calories', 200)
  .createFloatParam('servings', 1)
  .createStringListParam('mealtime', ['Noon'], mealtimes)
  .minifyIdentifiers()

const { animal, food, calories, human, mealtime, servings } = query.refs
</script>

<template>
  <h3>Here is an example <code>string</code> query:</h3>
  <label>
    Favorite food?
    <input type="text" v-model="food" />
  </label>
  {{ food }}

  <h3>Params can be minified if <code>allowedValues</code> is specified:</h3>
  <label>
    Favorite animal?
    <select v-model="animal">
      <option v-for="a in animals" :value="a">{{ a }}</option>
    </select>
  </label>
  {{ animal }}

  <h3>You can also use a minified array of strings:</h3>
  <label>
    <select v-model="mealtime" multiple>
      <option v-for="t in mealtimes" :value="t">{{ t }}</option>
    </select>
  </label>

  <h3><code>integer</code> queries are expressed in base-36 to save space:</h3>
  <label>
    Number of calories?
    <input type="number" v-model="calories" />
  </label>
  {{ calories }}

  <h3><code>floating point</code> queries are left in base 10:</h3>
  <label>
    Number of servings?
    <input type="range" v-model="servings" min="0" max="3" step=".1" />
  </label>
  {{ servings }}

  <h3><code>boolean</code> queries are expressed as 0 or 1:</h3>
  <label>
    Can {{ animal }}s eat {{ food }}?
    <input type="checkbox" v-model="human" />
  </label>
  {{ human }}

  <h3>The class also exposes a mapping of the minified keys:</h3>
  <code>
    {{ query.names }}
  </code>
</template>
