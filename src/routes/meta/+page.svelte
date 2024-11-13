<script>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import Pie from '$lib/Pie.svelte';

  let data = [];
  let commits = [];
  let stats = {};
  let hoveredIndex = -1;
  let hoveredCommit = {};
  let mouseX = 0;
  let mouseY = 0;
  let brushSelection = null;
  let selectedPoints = new Set();
  let selectedCommits = [];  // Declare an empty array to store selected commits
  let svg;
  let selectedLines = [];  // New reactive variable to track selected lines
  let languageBreakdown = [];  // Language breakdown based on selected lines
  let totalLinesEdited = 0; 

  let width = 800, height = 300;
  let margin = { top: 10, right: 10, bottom: 30, left: 40 };

  let usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
  };
  usableArea.width = usableArea.right - usableArea.left;
  usableArea.height = usableArea.bottom - usableArea.top;

  let xScale, yScale;
  let xAxis, yAxis, xAxisGridlines, yAxisGridlines;

  // Load the data when the component is mounted
  onMount(async () => {
    try {
      data = await d3.csv('loc.csv', (row) => ({
        ...row,
        datetime: new Date(row.datetime),
        hourFrac: new Date(row.datetime).getHours() + new Date(row.datetime).getMinutes() / 60,
      }));

      commits = d3.groups(data, (d) => d.commit);

      stats.totalLOC = data.length;
      stats.totalCommits = commits.length;
      stats.totalFiles = d3.group(data, (d) => d.file).size;

      let fileLengths = d3.rollups(
        data,
        (v) => d3.mean(v, (d) => d.line),
        (d) => d.file
      );
      stats.averageFileLength = d3.mean(fileLengths, (d) => d[1]);

      let workByPeriod = d3.rollups(
        data,
        (v) => v.length,
        (d) => {
          let hour = d.datetime.getHours();
          if (hour >= 5 && hour < 12) return 'Morning';
          if (hour >= 12 && hour < 17) return 'Afternoon';
          if (hour >= 17 && hour < 21) return 'Evening';
          return 'Night';
        }
      );
      stats.maxPeriod = workByPeriod.reduce((a, b) => a[1] > b[1] ? a : b, [])[0];

      let workByDayOfWeek = d3.rollups(
        data,
        (v) => v.length,
        (d) => d.datetime.toLocaleString('en', { weekday: 'long' })
      );
      stats.maxDayOfWeek = workByDayOfWeek.reduce((a, b) => a[1] > b[1] ? a : b, [])[0];

      xScale = d3.scaleTime()
        .domain(d3.extent(data, (d) => d.datetime))
        .range([usableArea.left, usableArea.right])
        .nice();

      yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);
    } catch (error) {
      console.error('Error loading or processing data:', error);
    }
  });

  // Track mouse movement for tooltip positioning
  onMount(() => {
    const svgElement = document.querySelector('svg');

    svgElement.addEventListener('mousemove', (e) => {
      mouseX = e.clientX + 10;
      mouseY = e.clientY + 10;

      const tooltip = document.querySelector('.tooltip');
      if (tooltip) {
        tooltip.style.left = `${mouseX}px`;
        tooltip.style.top = `${mouseY}px`;
      }
    });
  });

  $: hoveredCommit = commits[hoveredIndex] ? commits[hoveredIndex][1][0] : hoveredCommit;

  $: {
    if (xScale && yScale) {
      d3.select(xAxis).call(d3.axisBottom(xScale));
      d3.select(yAxis).call(d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00'));
      d3.select(yAxisGridlines)
        .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
      d3.select(xAxisGridlines)
        .call(d3.axisBottom(xScale).tickFormat('').tickSize(-usableArea.height));
    }

    if (svg) {
      d3.select(svg).call(d3.brush().on('start brush end', brushed));
      d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
    }
  }
  
  $: selectedLines = (selectedCommits.length > 0 ? selectedCommits : commits).flatMap(commit =>
  commit[1].map(d => ({
    language: getLanguage(d.file), // Get language based on file extension
    lines: d.line
  }))
);

// Helper function to get the language type based on the file extension
function getLanguage(file) {
  if (file.endsWith('.js')) return 'JavaScript';
  if (file.endsWith('.html')) return 'HTML';
  if (file.endsWith('.css')) return 'CSS';
  if (file.endsWith('.svelte')) return 'Svelte';
  return 'Other';  // Default case for unknown file types
}

$: languageBreakdown = d3.rollups(
  selectedLines,
  (v) => d3.sum(v, (d) => d.lines),  // Sum the lines for each language
  (d) => d.language  // Group by language
);

// Total number of lines edited (for proportion calculation)
$: totalLinesEdited = d3.sum(languageBreakdown, (d) => d[1]);

// Format the proportion as a percentage with one decimal place
$: formattedLanguageBreakdown = languageBreakdown.map(([language, lines]) => ({
  language,
  lines,
  proportion: totalLinesEdited > 0 ? (lines / totalLinesEdited) : 0,  // Proportion of total lines edited
  formattedProportion: d3.format(".1~%")(totalLinesEdited > 0 ? (lines / totalLinesEdited) : 0)  // Format as percentage
}));
  

  // Brush function: Update selectedPoints and selectedCommits
  // Brush function: Update selectedPoints and selectedCommits
function brushed(event) {
  const selection = event.selection;
  if (!selection) return;

  const [x0, y0] = selection[0];
  const [x1, y1] = selection[1];

  selectedPoints.clear();
  selectedCommits = [];  // Reset the selected commits

  // Check which commits are within the selection bounds and update selectedCommits
  commits.forEach((commit, index) => {
    const cx = xScale(commit[1][0].datetime);
    const cy = yScale(commit[1][0].hourFrac);

    if (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1) {
      selectedPoints.add(index);
      selectedCommits.push(commit);  // Add the commit to the selectedCommits array
    }
  });

  updateDots();
}

  function updateDots() {
    d3.select(svg)
      .selectAll('.dots circle')
      .data(commits)
      .attr('fill', (d, index) => selectedPoints.has(index) ? 'orange' : 'steelblue');
  }

  $: pieChartData = Array.from(languageBreakdown).map(([language, lines]) => ({ label: language, value: lines }));
</script>

<main>
  <h1>Meta-Analysis of Codebase</h1>

  <!-- Stats Section -->
  <div class="profile-box">
    <h2>Repository Statistics</h2>
    <dl class="profile-stats">
      <div class="stat">
        <dt>Total <abbr title="Lines of code">LOC</abbr></dt>
        <dd>{stats.totalLOC}</dd>
      </div>

      <div class="stat">
        <dt>Total Commits</dt>
        <dd>{stats.totalCommits}</dd>
      </div>

      <div class="stat">
        <dt>Total Files</dt>
        <dd>{stats.totalFiles}</dd>
      </div>

      <div class="stat">
        <dt>Average File Length</dt>
        <dd>{stats.averageFileLength ? stats.averageFileLength.toFixed(2) : 'N/A'} lines</dd>
      </div>

      <div class="stat">
        <dt>Most Work Done During</dt>
        <dd>{stats.maxPeriod}</dd>
      </div>

      <div class="stat">
        <dt>Most Work Done On</dt>
        <dd>{stats.maxDayOfWeek}</dd>
      </div>
    </dl>
  </div>

  <!-- Scatterplot Section -->
  <h2>Commits by Time of Day</h2>
  <svg bind:this={svg} viewBox="0 0 {width} {height}">
    <!-- Y Axis Gridlines -->
    <g transform="translate({usableArea.left}, 0)" bind:this={yAxisGridlines} />
    
    <!-- X axis -->
    <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
    
    <!-- Y axis -->
    <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
    
    <!-- Scatterplot Dots -->
    <g class="dots">
      {#each commits as commit, index}
        <circle
          cx="{xScale(commit[1][0].datetime)}"
          cy="{yScale(commit[1][0].hourFrac)}"
          r="5"
          fill="{selectedPoints.has(index) ? 'orange' : 'steelblue'}"
          on:mouseenter={() => hoveredIndex = index}
          on:mouseleave={() => hoveredIndex = -1}
        />
      {/each}
    </g>
  </svg>

  <!-- Count of selected commits -->
  <p>{selectedCommits.length > 0 ? `${selectedCommits.length} commits selected` : "No commits selected"}</p>

  <!-- Language Breakdown Section -->
<div class="profile-box">
  <h1>Language Breakdown of Edited Lines</h1>
  <Pie data={pieChartData} />
    {#each formattedLanguageBreakdown as { language, lines, formattedProportion }}
      <div class="language-stat">
        <span class="language">{language}</span>
        <span class="lines">{lines} lines</span>
        <span class="proportion">({formattedProportion})</span>
      </div>
    {/each}
</div>
  
  <!-- Tooltip Section -->
  {#if hoveredIndex !== -1}
    <dl class="info tooltip">
      <dt>Commit</dt>
      <dd><a href="{ hoveredCommit.url }" target="_blank">{ hoveredCommit.commit }</a></dd>

      <dt>Date</dt>
      <dd>{ hoveredCommit.datetime?.toLocaleString("en", {dateStyle: "full"}) }</dd>

      <dt>Time</dt>
      <dd>{ hoveredCommit.datetime?.toLocaleTimeString("en") }</dd>

      <dt>Author</dt>
      <dd>{ hoveredCommit.author }</dd>

      <dt>Lines Edited</dt>
      <dd>{ hoveredCommit.line }</dd>
    </dl>
  {/if}
</main>

<style>
  :root {
    --border-color: #ccc;
    --background-color: #f9f9f9;
    --text-color: #000;
    --tooltip-bg-color: rgba(255, 255, 255, 0.9);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --border-color: #444;
      --background-color: #333;
      --text-color: #fff;
      --tooltip-bg-color: rgba(255, 255, 255, 0.8);
    }
  }

  .profile-box {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
    background-color: var(--background-color);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
    max-width: 1000px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }

  .profile-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .stat {
    display: contents;
  }

  dt {
    grid-row: 1;
    font-weight: bold;
    text-align: center;
    color: var(--text-color);
  }

  dd {
    grid-row: 2;
    text-align: center;
    color: var(--text-color);
  }

  svg {
    width: 100%;
    height: 100%;
    overflow: visible;
    margin-top: 30px;
  }

  .dots circle {
    transition: fill 0.3s, transform 200ms;
    transform-origin: center;
    transform-box: fill-box;
  }

  .dots circle:hover {
    fill: orange;
    transform: scale(1.5);
  }

  .dots circle.selected {
    fill: orange;  /* Change color to orange for selected commits */
    transform: scale(1.5); /* Optional: Scale up selected commits */
  }

  .gridlines .x-gridlines line,
  .gridlines .y-gridlines line {
    stroke: #ddd;
    stroke-width: 0.5;
    shape-rendering: crispEdges;
  }

  .tooltip {
    position: fixed;
    z-index: 10;
    padding: 10px;
    background-color: var(--tooltip-bg-color);
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    pointer-events: none;
    transition-duration: 500ms;
    transition-property: opacity, visibility;
    font-size: 14px;
    color: var(--text-color);
  }

  .info {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 8px;
    margin: 0;
  }

  .tooltip[hidden] {
    opacity: 0;
    visibility: hidden;
  }

  @keyframes marching-ants {
    to {
      stroke-dashoffset: -8; /* 5 + 3 */
    }
  }

  svg :global(.selection) {
    fill-opacity: 10%;
    stroke: white;
    stroke-opacity: 70%;
    stroke-dasharray: 5 3;
    animation: marching-ants 2s linear infinite;
  }
  .language-stat {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.language-stat span {
  font-weight: normal;
  color: var(--text-color);
}
</style>
