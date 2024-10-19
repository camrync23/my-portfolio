

<script>
    import {page} from '$app/stores';
    import '../style.css';

  let pages = [
  { url: './', title: 'Home' },
  { url: './projects', title: 'Projects' },
  { url: './contact', title: 'Contact' }, 
  { url: './resume', title: 'Resume' },
  { url: 'https://github.com/camrync23', title: 'Github' }
    ];  
</script>

<nav>
    {#each pages as p }
    <a href={p.url} target={p.url.startsWith("http") ? "_blank" : null} class:current={'.' + $page.route.id === p.url}> {p.title}</a>
    {/each}
</nav> 

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

</style>

<slot />