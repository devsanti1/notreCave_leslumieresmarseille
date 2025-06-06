window.onload = () => {
  let i = 0
  function createPage() {
    currentPage = document.createElement("div")
    currentPage.classList.add("page")
    currentPage.id = `page${i}`
    winelist.appendChild(currentPage)
    i++
    return currentPage
  }
  let winelist = document.getElementById("wine-list")


  const csvUrl = 'https://docs.google.com/spreadsheets/d/1PFlgyrA8CWxwKSIBEkv_MwEcHHX5pGJ95_A1eFwd2P4/export?format=csv';

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      console.log(csvText);
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
      console.log(rows);

      rows.forEach((row, index) => {
        if (index === 0) {
          return;
        }
        const wineData = {
          wineName: row[0],
          price: parseFloat(row[1]),
          category: row[2],
          origin: row[3],
          cepage: row[4],
          terroir: row[5],
          country: row[6],
          region: row[7],
          stock: row[8] === "TRUE"
        };
        data.push(wineData);
      });
      console.log(data);
      data = data.filter(x => x.stock === true)
      let currentPage = createPage()
      data.map((x, id) => {
        const vino = document.createElement("div")
        vino.classList.add('card')
        vino.innerHTML = `
        <div class="card-header">
          <span class="wineName">${x.wineName}</span>
          <div>
          <span class="point"></span>
            <span class="price">${x.price} €</span>
          </div>
        </div>
        <div class="card-footer">
          <span class="origin">Origen: ${x.origin}</span>
          <span class="cepage">Cépage: ${x.cepage}</span>
          <span class="terroir">${x.terroir}</span>
        </div>
        `
        if (x.cepage.includes("❂")) {
          vino.classList.add('orange')
        } else if (x.category === "Les Bulles") {
          vino.classList.add('bulles')
        } else if (x.category === "Vins Blancs") {
          vino.classList.add('blancs')
        } else if (x.category === "Vins Rosés") {
          vino.classList.add('roses')
        } else {
          vino.classList.add('rouges')
        }
        currentPage.appendChild(vino)
        if (currentPage.scrollHeight > currentPage.clientHeight) {
          currentPage.removeChild(vino);
          currentPage = createPage()
          currentPage.appendChild(vino)
        }
      })
    })
    .catch(error => console.error('Error fetching CSV:', error));
}