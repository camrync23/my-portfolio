<script>
    import projects from '$lib/projects.json';
    import Project from '$lib/Project.svelte';
</script>

<svelte:head>
  <title>Welcome!</title>
</svelte:head>

<h1>Camryn Curtis</h1>
 <p>Hi! My name is Camryn, I am 26 years old, and I live in San Diego, California. 
        I am a student at UC San Diego pursuing a Master's Degree in Data Science. 
        I love quilting, baking, and exploring nature and museums with my husband Andrew.</p>
<img src="image/lab1image.jpeg" alt="My husband and I visiting the National Naval Aviation Museum in Pensacola Florida" width ="400" height="300">

<h2>Latest Projects</h2>
<div class="projects highlights">
    {#each projects.slice(0, 3) as project}
    <Project data={project} hLevel={3} />
    {/each}
  </div>