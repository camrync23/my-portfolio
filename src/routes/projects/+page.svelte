<script>
    import projects from '$lib/projects.json';
    import Project from '$lib/Project.svelte';
</script>


<svelte:head>
  <title>My Projects</title>
</svelte:head>

<h1>{projects.length} Projects </h1>

    <div class="projects">
        {#each projects as p}
            <Project data={p} />
       {/each}
    </div>

<style>
    .projects {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 20px;
}

.project-tile {
    background: var(--box-background);
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
}

.project-tile:hover {
    transform: scale(1.05);
}

@media (max-width: 900px) {
    .projects {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 600px) {
    .projects {
        grid-template-columns: 1fr;
    }
}
</style>