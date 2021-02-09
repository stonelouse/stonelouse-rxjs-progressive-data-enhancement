// Import stylesheets
import "./style.css";

import { fromEvent, of, merge } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map, delay, exhaustMap, switchMap, takeUntil, tap } from 'rxjs/operators';

console.clear();

const searchBtn = document.getElementById("search");
/* any: workaround for accessing 'value' property below */
const searchInput: any = document.getElementById("searchInput");
const pokemonName = document.getElementById("pokemonName");
const pokemonType = document.getElementById("pokemonType");
const evolutions = document.getElementById("evolutions");
/* any: workaround for accessing 'src' property below */
const pokemonImage: any = document.getElementById("pokemonImage");
const result = document.getElementById("result");

result.style.display = "none";

function getPokemon(name: string) {
  console.log('fetching the pokemon');
  
  /* Creates an Observable from an Ajax (fetch) request */
  return ajax(`https://pokeapi.co/api/v2/pokemon/${name}`).pipe(
    map(pokemon => pokemon.response),
    delay(3000)
  );
}

function getEvolutions(id: number) {
  console.log('fetching the evolutions');
 
  return ajax(`https://pokeapi.co/api/v2/evolution-chain/${id}`).pipe(
    map(pokemon => pokemon.response),
    delay(2000)
  );
}

function addEvolutionsToPokemon(pokemon, evolutions) {
  return {...pokemon, ...evolutions};
}

function addPokemonToUi(pokemon) {
  console.log(pokemon.id, pokemon.name);

  result.style.display = 'block';
  pokemonName.innerText = pokemon.name;
  pokemonImage.src = pokemon.sprites.front_default;
  pokemonType.innerText = pokemon.types[0].type.name;
  evolutions.innerText = `Evolves to: ${pokemon?.chain?.evolves_to[0].species.name || 'loading...'}`;
}

/* fromEvent:
   Creates an Observable that 
   ... emits events of a specific type 
   ... coming from the given event target. 

   search for 'pikachu', 'bulbasaur'
 */
/* ----------------------------------------------------------------
  First approach
  ----p--------pe--- // one stream
 */
// fromEvent(searchBtn, 'click').pipe(
//     map(e=>searchInput.value),
//     switchMap(name => {
//       return getPokemon(name).pipe(
//         switchMap(pokemon => {
//           return getEvolutions(pokemon.id).pipe(
//             map(evolutions => addEvolutionsToPokemon(pokemon, evolutions))
//           )
//         })
//       )
//     })
// ).subscribe(addPokemonToUi);

/* ----------------------------------------------------------------
  Second approach
  ----p------------- // one stream emits pokemon immediately of()
  -------------pe--- // one stream emits the enriched pokemon 
  ----p--------pe--- // and combine these streames (merge())
 */
// fromEvent(searchBtn, 'click').pipe(
//     map(e=>searchInput.value),
//     switchMap(name => {
//       return getPokemon(name).pipe(
//         switchMap(pokemon => {
//           const pokemon$ = of(pokemon);
//           const evolution$ = getEvolutions(pokemon.id).pipe(
//             map(evolutions => addEvolutionsToPokemon(pokemon, evolutions))
//           )
//           return merge(pokemon$, evolution$)
//         }),
//       )
//     })
// ).subscribe(addPokemonToUi);

/* ----------------------------------------------------------------
  Third approach
 */
fromEvent(searchBtn, 'click').pipe(
    map(e=>searchInput.value),
    exhaustMap(name => {
      return getPokemon(name).pipe(
        switchMap(pokemon => {
          const pokemon$ = of(pokemon);
          const evolution$ = getEvolutions(pokemon.id).pipe(
            map(evolutions => addEvolutionsToPokemon(pokemon, evolutions))
          )
          return merge(pokemon$, evolution$)
        }),
      )
    })
).subscribe(addPokemonToUi);

/* ----------------------------------------------------------------
 */
// fromEvent(searchBtn, 'click').pipe(
//   map(e=>searchInput.value),
//   exhaustMap((name) => getPokemon(name).pipe(
//     switchMap(pokemon => {
//       const pokemon$ = of(pokemon);
//       const evolution$ = getEvolutions(pokemon.id).pipe(
//         map(evolutions => {
//           return addEvolutionsToPokemon(pokemon, evolutions);
//         }));
//       return merge(pokemon$, evolution$).pipe();
//     }),
//     takeUntil(fromEvent(searchInput, 'input'))
//   )),
// ).subscribe(addPokemonToUi);