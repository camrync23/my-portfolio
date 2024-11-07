<script>
  import * as d3 from 'd3'; // Import D3
  export let data = [];
  export let selectedIndex = -1;

  // Create the pie generator and specify how to access the value
  let sliceGenerator = d3.pie().value(d => d.value);

  // Generate the arc data for the slices
  $: arcData = sliceGenerator(data);

  // Create the arc generator
  const arcGenerator = d3.arc()
      .innerRadius(0) // Inner radius for pie (0 for full circle)
      .outerRadius(50); // Outer radius for the arc

  // Calculate the paths for each slice
  $: arcs = arcData.map(d => arcGenerator(d));

  // Use D3's color scale for better color handling
  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  // Function to toggle selection
  function toggleSelection(index) {
    selectedIndex = selectedIndex === index ? -1 : index;
  }
</script>

<div class="container">
  <!-- Pie chart -->
  <svg viewBox="-50 -50 100 100">
    {#each arcs as arc, index}
      <path
        d={arc}
        fill={colors(index)}
        class:selected={selectedIndex === index}  
        on:click={() => toggleSelection(index)}  
        style="cursor: pointer;" 
      />
    {/each}
  </svg>

  <!-- Legend -->
  <ul class="legend">
    {#each data as d, index}
      <li
        style="--color: {colors(index)}"
        class:selected={selectedIndex === index}  
        on:click={() => toggleSelection(index)}  
      > <span class="swatch"></span>
        {d.label} <em>({d.value})</em>
      </li>
    {/each}
  </ul>
</div>

<style>
  .container {
    display: flex; /* Use flex layout for the container */
    align-items: center; /* Center items vertically */
    gap: 20px; /* Space between pie chart and legend */
    flex-wrap: wrap; /* Allow wrapping on smaller screens */
  }

  svg {
    max-width: 20em; /* Limit width of the SVG */
    margin-block: 2em;
    overflow: visible;
  }

  /* Smooth transition for opacity change */
  path {
    transition: 300ms;
    opacity: 1;
  }

  /* Fade out non-hovered slices */
  path:hover {
    opacity: 1;
  }

  svg:hover path:not(:hover) {
    opacity: 0.2;
  }

  /* Styling for the legend */
  .legend {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(9em, 1fr));
    border: 1px solid #ccc;
    padding: 1em;
    margin-top: 1em;
    border-radius: 8px;
    flex: 1; /* Allow the legend to take remaining space */
  }

  .legend li {
    display: flex;
    align-items: center;
    gap: 0.5em;
    cursor: pointer; /* Make legend items clickable */
  }

  /* Circular swatch for the legend */
  .swatch {
    display: inline-block;
    width: 1em;
    height: 1em;
    background-color: var(--color);
    border-radius: 50%;
  }

  /* Styling for the selected wedge and legend item */
  .selected {
    --color: red !important;  /* Highlight color */
    fill: var(--color);  /* Apply the color to the wedge */
    font-weight: bold;  /* Highlight the selected legend item */
  }

  /* Highlight selected legend items */
  .legend .selected {
    color: var(--color);  /* Apply the same color to the legend item */
  }

 
</style>