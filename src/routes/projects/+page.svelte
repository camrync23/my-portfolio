<script>
    import projects from '$lib/projects.json';
    import Project from '$lib/Project.svelte';
    import Pie from '../../lib/Pie.svelte';
    import * as d3 from 'd3';
  
    let selectedYearIndex = -1;  // Store the selected index of the pie chart
    let selectedYear;            // Store the selected year based on the index
    let query = '';
    let pieData = [];
    
    // Reactive statement to group filtered projects by year and count them
    $: {
      const rolledData = d3.rollups(
        filteredProjects,
        (v) => v.length,  // Count the number of projects in each group
        (d) => d.year     // Group by year
      );
  
      // Prepare pie data from rolled data
      pieData = Array.from(rolledData).map(([year, count]) => ({
        value: count,
        label: year
      }));
    }
  
    // Reactive statement to filter projects based on the search query
    let filteredProjects;
    $: filteredProjects = projects.filter((project) => {
      let values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query.toLowerCase());
    });
  
    // Reactive statement to set the selected year based on the selected index
    $: selectedYear = selectedYearIndex > -1 ? pieData[selectedYearIndex].label : null;
  
    // Reactive statement to filter projects by the selected year
    $: filteredByYear = selectedYear
      ? projects.filter(project => project.year === selectedYear)
      : filteredProjects;
  </script>
  
  <svelte:head>
    <title>My Projects</title>
  </svelte:head>
  
  <h1>{projects.length} Projects</h1>
  
  <!-- Pie chart component with data and binding the selectedIndex -->
  <Pie data={pieData} bind:selectedIndex={selectedYearIndex} />
  
  <!-- Display the selected year -->
  {#if selectedYear}
    <h2>Showing projects for {selectedYear}</h2>
  {/if}
  
  <!-- Search input to filter projects by query -->
  <input
    type="search"
    bind:value={query}
    aria-label="Search projects"
    placeholder="🔍 Search projects…"
    class="search-input"
  />
  
  <!-- Display filtered projects (either by search or by selected year) -->
  <div class="projects">
    {#each filteredByYear as p}
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
  
    .project-tile img {
      max-width: 100%; /* Responsive */
      height: auto; /* Maintain aspect ratio */
      border-radius: 5px; /* Optional: round corners */
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
  
    .search-input {
      width: 100%;
      max-width: 900px;
      padding: 12px;
      font-size: 1.2em;
      border: 2px solid;  /* Use a blue border */
      border-radius: 8px;  /* Round the corners more */
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);  /* Add a subtle shadow */
      margin: 20px auto;
    }
  
    .search-input:focus {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);  /* Bigger shadow on focus */
    }

  </style>
