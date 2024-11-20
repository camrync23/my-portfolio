<script>
    export let data = {};
    export let hLevel = 2;
</script>

<article>
    <div class="project-year">{data.year}</div>
    <svelte:element this={'h' + hLevel}>
        <a href={data.link} target="_blank" rel="noopener noreferrer">{data.title}</a>
    </svelte:element>
    <img src={data.image} alt={data.title} class="project-image" />
    <p>{data.description}</p>
</article>

<style>
    /* Body Styling */
    body {
        margin-inline: auto;
        padding: 25px;
        accent-color: var(--color-accent);
        background-color: var(--color-accent-light);
    }

    /* Projects Grid Layout */
    .projects {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
    }

    /* Article (Project Card) Styling */
    article {
        display: grid;
        grid-template-rows: auto;
        background-color: #f9f9f9;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 1em;
        transition: box-shadow 0.2s ease-in-out;
    }

    /* Hover Effect for Article */
    article:hover {
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }

    /* Dark Mode Styling */
    @media (prefers-color-scheme: dark) {
        article {
            background-color: #333;
            color: white;
        }

        article:hover {
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
        }
    }

    /* Image Styling */
    .project-image {
        max-width: 100%; /* Responsive - scales within its container */
        height: auto; /* Maintain aspect ratio */
        border-radius: 8px; /* Rounded corners */
        margin: 10px 0; /* Spacing around the image */
        object-fit: cover; /* Ensure image fits neatly */
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Subtle shadow */
    }

    /* Year Styling */
    .project-year {
        font-size: 0.8em;
        color: #d5d2d2; /* Neutral text color */
        margin-bottom: 10px;
        font-family: Baskervville;
        font-variant-numeric: oldstyle-nums;
        text-align: left; /* Left-align the date */
    }

    /* Heading Styles */
    h1 {
        font-size: 4em;
        line-height: 1.1;
        text-wrap: balance;
        margin: 0.5em 0;
    }

    h2 {
        font-size: 2.5em;
        line-height: 1.1;
        text-wrap: balance;
        margin: 0.5em 0;
    }

    h1, h2, h3, h4, h5, h6 {
        line-height: 1.1;
        text-wrap: balance;
        margin-bottom: 0.5em;
    }

    /* Anchor Styling */
    a {
        text-decoration: none;
        color: inherit;
    }

    a:hover, a:focus {
        text-decoration: underline;
    }
</style>
