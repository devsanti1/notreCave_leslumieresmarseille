window.onload = () => {
  let i = 0
  function createPage(currentCat, currentReg, currentCount) {
    currentPage = document.createElement("div")
    currentPage.classList.add("page")
    currentPage.id = `page${i}`
    let indice = document.createElement("span")
    indice.innerText = i
    indice.classList.add("indice")
    currentPage.appendChild(indice)
    let cat = document.createElement("span")
    cat.classList.add("cat")
    cat.innerText = `- ${currentCat} -`
    currentPage.appendChild(cat)
    let reg = document.createElement("span")
    reg.classList.add("reg")
    reg.innerText = currentReg !== "" ? `- ${currentReg}, ${currentCount} -` : `- ${currentCount} -`
    currentPage.appendChild(reg)
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

      let indice = createPage("Indice", "x", "x")
      indice.removeChild(indice.firstChild)
      indice.removeChild(indice.lastChild)
      let ttl = document.createElement("span")
      ttl.classList.add("ttl")
      ttl.innerText = "Carte de vins"
      indice.insertBefore(ttl, indice.firstChild);
      let luz = document.createElement("img")
      luz.classList.add('luz')
      luz.src = "./luz.png"
      indice.appendChild(luz)
      data = data.filter(x => x.stock === true)
      let currentCat = data[0].category
      let currentCount = data[0].country
      let currentReg = data[0].region
      let currentPage = createPage(currentCat, currentReg, currentCount)
      data.map((x, id) => {
        const vino = document.createElement("div")
        vino.classList.add('card')
        vino.innerHTML = `
        <div class="card-header">
          <span class="wineName">${x.wineName}</span>
          <span class="price">${x.price} €</span>
        </div>
        <div class="card-footer">
          <span class="origin">Origen: ${x.origin}</span>
          <span class="cepage">Cépage: ${x.cepage}</span>
          <span class="terroir">${x.terroir}</span>
        </div>
        `
        if (x.category === "Vins de Macération") {
          vino.classList.add('orange')
        } else if (x.category === "Les Bulles") {
          vino.classList.add('bulles')
        } else if (x.category === "Vins Blancs") {
          vino.classList.add('blancs')
        } else if (x.category === "Vins Rosés") {
          vino.classList.add('roses')
        }

        if (currentCat !== x.category) {
          currentPage = createPage(x.category, x.region, x.country)
        }
        let reg = document.createElement("span")
        if ((currentReg !== x.region || currentCount !== x.country) && !currentPage.lastChild.classList.contains("reg")) {
          reg.classList.add("reg")
          reg.innerText = x.region !== "" ? `- ${x.region}, ${x.country} -` : `- ${x.country} -`
          currentPage.appendChild(reg)
          if (currentPage.scrollHeight > currentPage.clientHeight) {
            currentPage.removeChild(reg);
            currentPage = createPage(x.category, x.region, x.country)
          }
        }
        currentPage.appendChild(vino)
        if (currentPage.scrollHeight > currentPage.clientHeight) {
          currentPage.removeChild(vino);
          if (data[id - 1].region !== x.region || data[id - 1].country !== x.country) {
            currentPage.removeChild(reg)
          }
          currentPage = createPage(x.category, x.region, x.country)
          currentPage.appendChild(vino)
        }
        currentCat = x.category
        currentCount = x.country
        currentReg = x.region
      })



      let categories = document.getElementsByClassName("cat")
      let categoriesO = []
      for (let x = 0; x < categories.length; x++) {
        const category = categories.item(x);
        if (categoriesO.find(cO => cO.catName === category.innerText)) {
          categoriesO[categoriesO.findIndex(cO => cO.catName === category.innerText)].pageFin = parseInt(category.parentElement.id.substring(4))
        } else {
          categoriesO.push({
            catName: category.innerText,
            pageInit: parseInt(category.parentElement.id.substring(4)),
            pageFin: parseInt(category.parentElement.id.substring(4))
          })
        }
      }
      let regions = document.getElementsByClassName("reg")
      let regionsO = []
      for (let x = 0; x < regions.length; x++) {
        const region = regions.item(x);
        regionsO.push({
          regionName: region.innerText,
          page: parseInt(region.parentElement.id.substring(4))
        })
      }
      let lista = document.createElement("ul")
      lista.classList.add('lista')
      console.log(categoriesO);
      categoriesO.shift()
      categoriesO.map(x => {
        let iCat = document.createElement('li')
        if (x.catName.replaceAll("-", "").trim() === "Les Bulles") {
          iCat.classList.add('bulles')
        } else if (x.catName.replaceAll("-", "").trim() === "Vins Blancs") {
          iCat.classList.add('blancs')
        } else if (x.catName.replaceAll("-", "").trim() === "Vins Rosés") {
          iCat.classList.add('roses')
        } else if (x.catName.replaceAll("-", "").trim() === "Vins de Macération") {
          iCat.classList.add('orange', 'd-none')
        }
        let iTitle = document.createElement("span")
        iTitle.innerHTML = `<span>${x.catName.replaceAll("-", "").trim()}</span><span>p${x.pageInit} - p${x.pageFin}</span>`
        iCat.appendChild(iTitle)
        let iRegs = []
        regionsO.filter(r => r.page >= x.pageInit && r.page <= x.pageFin).map(xr => {
          if (iRegs.find(ir => ir.rname === xr.regionName)) {
            iRegs[iRegs.findIndex(ir => ir.rname === xr.regionName)].pages.push(xr.page)
          } else {
            iRegs.push({
              rname: xr.regionName,
              pages: [xr.page]
            })
          }
        })
        let iRegsO = document.createElement("ul")
        iRegs.map(xir => {
          let iReg = document.createElement("li")
          iReg.innerHTML = `<span>${xir.rname.slice(2, -2)}</span>`
          iReg.innerHTML += `<span>p${xir.pages[0]}</span>`
          iRegsO.appendChild(iReg)
        })
        iCat.appendChild(iRegsO)
        lista.appendChild(iCat)
      })
      indice.appendChild(lista)
      let botellas = document.createElement("div")
      botellas.classList.add('botellas')
      while (botellas.children.length < 4) {
        let botella = document.createElement('img')
        botella.src = './botella.png'
        botellas.appendChild(botella)
      }
      indice.appendChild(botellas)
    })
    .catch(error => console.error('Error fetching CSV:', error));
}