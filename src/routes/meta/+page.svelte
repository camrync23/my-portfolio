<script>
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    
    let data = [];
    let commits = [];
    let stats = {};
  
    onMount(async () => {
      try {
        // Read the CSV file and convert necessary fields to the appropriate types
        data = await d3.csv('loc.csv', (row) => ({
          ...row,
          line: Number(row.line),  // Ensure line is a number
          depth: Number(row.depth),  // Ensure depth is a number
          length: Number(row.length),  // Ensure length is a number
          date: new Date(row.date + 'T00:00' + row.timezone),  // Parse date
          datetime: new Date(row.datetime),  // Parse datetime
        }));
        
        // Group data by commit
        commits = d3.groups(data, (d) => d.commit);
  
        // Transform grouped data into a structured commit object
        commits = commits.map(([commit, lines]) => {
          let first = lines[0];
          let { author, date, time, timezone, datetime } = first;
  
          let ret = {
            id: commit,
            url: 'https://github.com/vis-society/lab-7/commit/' + commit,
            author,
            date,
            time,
            timezone,
            datetime,
            hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
            totalLines: lines.length,
          };
  
          // Define 'lines' as a non-enumerable property to store the lines modified by this commit
          Object.defineProperty(ret, 'lines', {
            value: lines,
            configurable: true,
            writable: true,
            enumerable: false,
          });
  
          return ret;
        });
  
        // Calculate total lines of code (LOC)
        stats.totalLOC = data.length;
  
        // Calculate total number of commits
        stats.totalCommits = commits.length;
  
        // Calculate total number of distinct files
        stats.totalFiles = d3.group(data, (d) => d.file).size;
  
        // Calculate average file length (in lines)
        let fileLengths = d3.rollups(
          data,
          (v) => d3.mean(v, (d) => d.line),
          (d) => d.file
        );
        stats.averageFileLength = d3.mean(fileLengths, (d) => d[1]);
  
        // Calculate time of day when most work is done
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
        stats.maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
  
        // Calculate day of the week that most work is done
        let workByDayOfWeek = d3.rollups(
          data,
          (v) => v.length,
          (d) => d.datetime.toLocaleString('en', { weekday: 'long' })
        );
        stats.maxDayOfWeek = d3.greatest(workByDayOfWeek, (d) => d[1])?.[0];
  
      } catch (error) {
        console.error('Error loading and processing CSV:', error);
      }
    });
  </script>
  
  <main>
    <h1>Meta-Analysis of Codebase</h1>
  
    <!-- Display total lines of code -->
    <dl class="stats">
      <dt>Total <abbr title="Lines of code">LOC</abbr></dt>
      <dd>{stats.totalLOC}</dd>
  
      <!-- Display total number of commits -->
      <dt>Total Commits</dt>
      <dd>{stats.totalCommits}</dd>
  
      <!-- Display total number of files -->
      <dt>Total Files</dt>
      <dd>{stats.totalFiles}</dd>
  
      <!-- Display average file length (in lines) -->
      <dt>Average File Length</dt>
      <dd>{stats.averageFileLength ? stats.averageFileLength.toFixed(2) : 'N/A'} lines</dd>
  
      <!-- Display time of day that most work is done -->
      <dt>Most Work Done During</dt>
      <dd>{stats.maxPeriod}</dd>
  
      <!-- Display day of the week that most work is done -->
      <dt>Most Work Done On</dt>
      <dd>{stats.maxDayOfWeek}</dd>
    </dl>
  
  </main>

  <style>
    /* Basic styling for the stats table */
    .stats-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
  
    .stats-table th, .stats-table td {
      padding: 8px 16px;
      border: 1px solid #ddd;
      text-align: left;
    }
  
    .stats-table th {
      background-color: #f4f4f4;
    }
  
    .stats-table td {
      background-color: #fafafa;
    }
  
    .stats-table tr:nth-child(even) td {
      background-color: #f9f9f9;
    }
  </style>