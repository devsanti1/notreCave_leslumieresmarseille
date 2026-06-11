window.onload = () => {
  let i = 0
  function createPage(currentSection, currentSubcategory) {
    currentPage = document.createElement("div")
    currentPage.classList.add("page")
    currentPage.id = `page${i}`
    let cSec = document.createElement("div")
    cSec.classList.add("sec")
    if (currentSection.precio === "2,00 €") {
      currentPage.classList.add("sec2")
    }
    cSec.innerHTML = `
      <span>${currentSection.contenido}</span>
      <span class="infoSection">${currentSection.info?.replaceAll("_", "<br/>")}</span>
      `
    currentPage.appendChild(cSec)
    let insta = document.createElement("div")
    insta.classList.add("insta")
    insta.innerHTML = `
      <b>Restaurant Les Lumières Marseille - 34, Grand Rue, 13002 - +33 4 91 90 69 98</b><br/>
      <i class="fa-brands fa-instagram" aria-hidden="true"></i>
      <span>leslumieres_marseille</span>
    `
    currentPage.appendChild(insta)
    menu.appendChild(currentPage)
    i++
    return currentPage
  }
  let menu = document.getElementById("menu")



  // OBTENER DATOS DESDE GOOGLE SHEETS COMO CSV
  const csvUrl = 'https://docs.google.com/spreadsheets/d/1RMnQGtcex4skLIYlWR75GvYwrW2lG0zvFzkxnI7FIuU/export?format=csv';
  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      // Parse CSV handling commas inside quoted fields
      function parseCSV(text) {
        const rows = [];
        let row = [];
        let field = '';
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
              field += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            row.push(field);
            field = '';
          } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (field !== '' || row.length > 0) {
              row.push(field);
              rows.push(row);
              row = [];
              field = '';
            }
            // Handle \r\n
            if (char === '\r' && text[i + 1] === '\n') i++;
          } else {
            field += char;
          }
        }
        // Add last field/row if needed
        if (field !== '' || row.length > 0) {
          row.push(field);
          rows.push(row);
        }
        return rows;
      }
      const rows = parseCSV(csvText);
      let data = [];
      rows.forEach((row, index) => {
        if (index === 0) {
          return;
        }
        const menuData = {
          seccion: row[0],
          tipo: row[1],
          contenido: row[2],
          info: row[3],
          precio: row[4],
        };
        data.push(menuData);
      });

      let secciones = data.filter(x => x.tipo === "Seccion")
      let categorias = data.filter(x => x.tipo === "Subcategoria")
      let platos = data.filter(x => x.tipo === "Plato")

      // PORTADA
      let portada = createPage("Portada", "x", "x")
      portada.innerHTML = `
        <span class="ttl">Menu Les Lumières</span>
      `

      //PAGINACIÓN
      let currentSec = secciones.filter(x => x.seccion === platos[0].seccion.split("-")[0])[0]
      let currentSub = categorias.filter(x => x.seccion === platos[0].seccion)[0]
      let currentPage = createPage(currentSec, currentSub)
      let sub = document.createElement("div")
      sub.classList.add("sub")
      sub.innerText = currentSub.contenido?.toLowerCase()
      currentPage.appendChild(sub)
      platos.map((x, id) => {
        const plato = document.createElement("div")
        plato.classList.add('card')
        plato.innerHTML = `
        <div class="card-header">
          <div>
            <span class="platoName">${x.contenido}</span>
            <i class="infoPlato">${x.info.replaceAll("_", "<br/>")}</i>
          </div>
          <span class="price">${x.precio}</span>
        </div>
        `
        if (currentSec.seccion !== x.seccion.split("-")[0]) {
          currentSec = secciones.filter(z => z.seccion === x.seccion.split("-")[0])[0]
          currentSub = categorias.filter(z => z.seccion === x.seccion)[0]
          currentPage = createPage(currentSec, currentSub)
          sub = document.createElement("div")
          currentSub = categorias.filter(z => z.seccion === x.seccion)[0]
          sub.classList.add("sub")
          sub.innerText = currentSub.contenido?.toLowerCase()
          currentPage.appendChild(sub)
        }
        if (currentSub.seccion !== x.seccion) {
          sub = document.createElement("div")
          currentSub = categorias.filter(z => z.seccion === x.seccion)[0]
          sub.classList.add("sub")
          sub.innerText = currentSub.contenido?.toLowerCase()
          currentPage.appendChild(sub)
        }
        if (currentPage.scrollHeight > currentPage.clientHeight) {
          currentPage.removeChild(sub);
          currentPage = createPage(currentSec, currentSub)
        }
        sub.appendChild(plato)
        if (currentPage.scrollHeight > currentPage.clientHeight) {
          currentPage.removeChild(sub);
          currentPage = createPage(currentSec, currentSub)
          sub.appendChild(plato)
        }
      })
    })
    .catch(error => console.error('Error fetching CSV:', error));
}