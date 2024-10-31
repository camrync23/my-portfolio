<script>
  import projects from '$lib/projects.json';
  import Project from '$lib/Project.svelte';

  let username = 'camrync23';
  let profileData;
  let errorMessage = '';

  // Fetch data when the component mounts
  async function fetchProfileData() {
      try {
          const response = await fetch(`https://api.github.com/users/${username}`);
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          profileData = await response.json();
      } catch (error) {
          errorMessage = error.message;
      }
  }

  // Call the fetch function
  fetchProfileData();
</script>

<svelte:head>
  <title>Welcome!</title>
</svelte:head>

<h1>Camryn Curtis</h1>
<p>
  Hi! My name is Camryn, I am 26 years old, and I live in San Diego, California.
  I am a student at UC San Diego pursuing a Master's Degree in Data Science.
  I love quilting, baking, and exploring nature and museums with my husband Andrew.
</p>
<img src="image/lab1image.jpeg" alt="My husband and I visiting the National Naval Aviation Museum in Pensacola Florida" width="400" height="300">

<h2>Latest Projects</h2>
<div class="projects highlights">
  {#each projects.slice(0, 3) as project}
      <Project data={project} hLevel={3} />
  {/each}
</div>

{#if profileData}
<section>
  <h2>Profile Stats for @{username}</h2>
  <div class="profile-box">
      <dl class="profile-stats">
          <div class="stat">
              <dt>Followers</dt>
              <dd>{profileData.followers}</dd>
          </div>
          <div class="stat">
              <dt>Following</dt>
              <dd>{profileData.following}</dd>
          </div>
          <div class="stat">
              <dt>Public Repos</dt>
              <dd>{profileData.public_repos}</dd>
          </div>
          <div class="stat">
              <dt>Public Gists</dt>
              <dd>{profileData.public_gists}</dd>
          </div>
      </dl>
  </div>
</section>
{:else if errorMessage}
  <p class="error">Something went wrong: {errorMessage}</p>
{:else}
  <p>Loading profile data...</p>
{/if}

<style>
  :root {
      --border-color: #ccc;
      --background-color: #f9f9f9;
      --text-color: #000;
  }

  @media (prefers-color-scheme: dark) {
      :root {
          --border-color: #444;
          --background-color: #333;
          --text-color: #fff;
      }
  }

  .profile-box {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
      background-color: var(--background-color);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      margin-top: 20px;
      max-width: 600px; /* Limit the maximum width */
      width: 100%; /* Make it responsive */
      margin-left: auto; /* Center the box */
      margin-right: auto; /* Center the box */
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
      color: var(--text-color); /* Use text color variable */
  }

  dd {
      grid-row: 2;
      text-align: center;
      color: var(--text-color); /* Use text color variable */
  }
</style>