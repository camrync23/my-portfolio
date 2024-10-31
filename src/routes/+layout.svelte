<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import '../style.css';

  let pages = [
      { url: './', title: 'Home' },
      { url: './projects', title: 'Projects' },
      { url: './contact', title: 'Contact' },
      { url: './resume', title: 'Resume' },
      { url: 'https://github.com/camrync23', title: 'Github' }
  ];

  // Step 1.4: Safely access localStorage
  let localStorage = globalThis.localStorage ?? {};

  // Read the color scheme from localStorage
  let colorScheme = localStorage.colorScheme ?? 'light dark';

  // Declare root to access <html> element
  let root = globalThis?.document?.documentElement;

  onMount(() => {
      // Apply the initial color scheme from localStorage
      root?.style.setProperty('color-scheme', colorScheme);
  });

  // Reactive statement to apply color scheme
  $: root?.style.setProperty('color-scheme', colorScheme);

  // Reactive statement to save color scheme to localStorage
  $: localStorage.colorScheme = colorScheme; // Save to localStorage

  // Update colorScheme when select changes
  function updateColorScheme(event) {
      colorScheme = event.target.value;
  }
</script>

<nav>
  {#each pages as p}
      <a href={p.url} target={p.url.startsWith("http") ? "_blank" : null} class:current={'.' + $page.route.id === p.url}>{p.title}</a>
  {/each}
</nav>

<div class="color-scheme">
  <select bind:value={colorScheme} on:input={updateColorScheme}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="light dark">Automatic</option>
  </select>
</div>

<style>
nav {
  display: flex;
  margin-bottom: 20px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: var(--border-color);
}

nav a {
  flex: 1;
  text-decoration: none;
  color: inherit;
  text-align: center;
  padding: 0.5em;
  margin-bottom: 5px;
}

nav a:hover {
  border-bottom: 0.4em solid var(--color-accent);
  color: var(--color-accent);
}

nav .current {
  border-bottom: 0.4em solid var(--color-accent);
  color: var(--color-accent);
  text-decoration: underline;
}

.color-scheme {
  position: absolute; /* Fixed positioning */
  top: 5px;          /* Adjusts the distance from the top */
  right: 5px;        /* Adjusts the distance from the right */
  font-size: 0.8em;  /* Adjusts the font size */
  padding: 5px;      /* Optional: adds some padding */
  border-radius: 5px; /* Optional: rounds the corners */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Optional: adds a shadow */
}
</style>

<slot />