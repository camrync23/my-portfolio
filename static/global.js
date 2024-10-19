console.log('IT’S ALIVE!');

let pages = [
  { url: './', title: 'Home' },
  { url: 'projects', title: 'Projects' },
  { url: 'contact', title: 'Contact' },
  { url: 'resume', title: 'Resume' },
  { url: 'https://github.com/camrync23', title: 'Github' }
];

let nav = document.createElement('nav');
document.body.prepend(nav);


for (let p of pages) {
  let url = p.url;
  let title = p.title;

 
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }

  if (!a.host.startsWith(location.host)) {
    a.target = "_blank";
  }
  nav.append(a);
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select>
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>`
  );
  
  
const select = document.querySelector('.color-scheme select');

if ("colorScheme" in localStorage) {
    const savedScheme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', savedScheme);
    select.value = savedScheme; // Update the select element to match the saved preference
} else {
    // Set default to automatic
    select.value = 'light dark';
}

select.addEventListener('input', function (event) {

    console.log('color scheme changed to', event.target.value);
 document.documentElement.style.setProperty('color-scheme', event.target.value);

  localStorage.colorScheme = event.target.value;
});

const form = document.getElementById('contact-form');

form?.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    const data = new FormData(form);
    const params = [];

    for (let [name, value] of data) {
        // Use encodeURIComponent to encode each value
        params.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
    }

    // Build the final URL
    const url = `${form.action}?${params.join('&')}`;
    console.log('Constructed URL:', url);
    location.href = url; // Open the mail client with the built URL
});