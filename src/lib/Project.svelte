<script>
    export let data = {};
    export let hLevel = 2;
</script>

<article>
    <svelte:element this={'h' + hLevel}>{data.title}</svelte:element>
    <img src={data.image} alt={data.title} />
    <p>{data.description}</p>
    <div class="project-year">{data.year}</div>
</article>


<style>
    body {
        margin-inline: auto;
        padding: 25px;
        accent-color: var(--color-accent);
        background-color: var(--color-accent-light);
    }
     .projects {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
    }

    article {
        display: grid;
        grid-template-rows: subgrid;
        grid-row: span 3;
        background-color: #f9f9f9;
        border:1px solid #ccc;
        border-radius: 8px;
        padding: 1em;
        transition: box-shadow 0.2s ease-in-out;
    }

    .project-year {
        font-size: 0.8em;
        color: whitesmoke;
        margin-bottom: 10px;
        font-family:Baskervville;
        font-variant-numeric: oldstyle-nums;
    }
    
    @media (prefers-color-scheme: dark) {
        article {
            background-color: #333;
            color: white;
        }

        article:hover {
            box-shadow: 0 0 10px rgba(255,255,255,0.2);
        }
    }

    article:hover {
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
    }
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

    h1,h2,h3,h4,h5,h6 {
        line-height: 1.1;
        text-wrap: balance;
        margin-bottom: 0.5em;
    }
</style>