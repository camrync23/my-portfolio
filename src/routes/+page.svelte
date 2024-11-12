<script>
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
  
    let data = [];
    let commits = [];
    let stats = {};
    let hoveredIndex = -1;  // Track which commit is hovered
    let hoveredCommit = {};  // Store data for the hovered commit
    let mouseX = 0;
    let mouseY = 0;
  
    // Set up the dimensions of the chart
    let width = 1000, height = 600;
    let margin = { top: 10, right: 10, bottom: 30, left: 40 };
  
    // Usable area after accounting for margins
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
  
    onMount(async () => {
      try {
        // Load and process the CSV data
        data = await d3.csv('loc.csv', (row) => ({
          ...row,
          datetime: new Date(row.datetime),
          hourFrac: new Date(row.datetime).getHours() + new Date(row.datetime).getMinutes() / 60,
        }));
  
        // Group commits by their commit ID
        commits = d3.groups(data, (d) => d.commit);
  
        // Calculate stats
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
  
        // Create scales for scatterplot
        xScale = d3.scaleTime()
          .domain(d3.extent(data, (d) => d.datetime))
          .range([usableArea.left, usableArea.right])
          .nice();
  
        yScale = d3.scaleLinear()
          .domain([0, 24]) // From 0 to 24 hours of the day
          .range([usableArea.bottom, usableArea.top]); // Flip the scale for top-to-bottom axis
  
      } catch (error) {
        console.error('Error loading or processing data:', error);
      }
    });
  
    // Update tooltip position based on mouse movement
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
  
    // Update hover commit info
    $: hoveredCommit = commits[hoveredIndex] ? commits[hoveredIndex][1][0] : hoveredCommit;
  
    // Render the axes and scatterplot
    $: {
      if (xScale && yScale) {
        d3.select(xAxis).call(d3.axisBottom(xScale));
        d3.select(yAxis).call(d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00'));
  
        // Render y-axis gridlines
        d3.select(yAxisGridlines)
          .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
  
        // Render x-axis gridlines
        d3.select(xAxisGridlines)
          .call(d3.axisBottom(xScale).tickFormat('').tickSize(-usableArea.height));
      }
    }
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
    <svg viewBox="0 0 {width} {height}">
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
            fill="steelblue"
            on:mouseenter={() => hoveredIndex = index}
            on:mouseleave={() => hoveredIndex = -1}
          />
        {/each}
      </g>
    </svg>
  
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
  </style>
  
  