<svelte:head>
  <title>Contact me</title>
</svelte:head>

<h1>Contact</h1>
<form id="contact-form" action="mailto:cscurtis@ucsd.edu" method="GET">
    <label for="subject">Subject:</label>
    <input type="text" id="subject" name="subject" required>
    <label for="message">Message:</label>
    <textarea id="message" name="body" rows = "4" required></textarea>
    <button type="submit">Submit</button>
</form>