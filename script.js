const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

const removeRow = (elmnt) => { 
    const id = 'product-' + elmnt.id.match(/(\d+)/)[0];
    document.getElementById(id).remove();
    const prodRows = document.querySelectorAll('.prod-row');
    for (let i = 0; i < prodRows.length; i++) {
        prodRows[i].id = `product-${i + 1}`;
        prodRows[i].querySelector('th').innerHTML = i + 1;
        prodRows[i].querySelector('button').id = `rmv-${i + 1}`;
    }
}

const addRow = () => {
    const tbody = document.getElementById('products');
    const id = tbody.childElementCount + 1;
    const html = `<tr id="product-${id}" class="prod-row">
        <th scope="row">${id}</th>
        <td>
            <select class="form-select form-select-sm">
                <option value="amz" selected>Amazon</option>
                <option value="mcy">Macys</option>
                <option value="wrt">Walmart</option>
                <option value="ebay">Ebay</option>
            </select>
        </td>
        <td>
            <input class="form-control form-control-sm" type="text">
        </td>
        <td>
            <button id="rmv-${id}" type="button" class="btn btn-outline-danger" onClick="removeRow(this)">
                <i class="bi bi-trash-fill"></i>
            </button>
        </td>
    </tr>`;

    if (document.getElementById(`product-${id - 1}`)) {
        document.getElementById(`product-${id - 1}`).insertAdjacentHTML('afterend', html);
    } else {
        tbody.innerHTML = html;
    }
}

const processData = () => {
    const type = document.getElementById('block-type').value;
    let data = '';
    if (type === 'specific') {
        let skuList = [];
        const prodRows = document.querySelectorAll('.prod-row');
        prodRows.forEach(prodRow => {
            let row = {
                product_vendor: prodRow.querySelector('.form-select').value,
                product_sku: prodRow.querySelector('.form-control').value.trim()
            };
            skuList.push(row);
        });
        data = JSON.stringify(skuList).replaceAll(`"`, `'`);
    } else if (type === 'search') {
        const search = {
            vendor: document.getElementById('search-vendor').value,
            term: document.getElementById('search-term').value.trim()
        };
        data = JSON.stringify(search).replaceAll(`"`, `'`);
    }
    const skuString = data;
    const code = `{{
    block class="Magento\\Framework\\View\\Element\\Template"
    title="${document.getElementById('block-title').value.replaceAll(`"`, ``)}"
    type="${document.getElementById('block-type').value}"
    template="${document.getElementById('block-template').value}"
    data="${skuString}"
    template="Magento_Theme::html/slider/landing-product-${document.getElementById('block-template').value}.phtml"
}}`;
    const codeInput = `{{block class="Magento\\Framework\\View\\Element\\Template" title="${document.getElementById('block-title').value.replaceAll(`"`, ``)}" type="${document.getElementById('block-type').value}" template="${document.getElementById('block-template').value}" data="${skuString}" template="Magento_Theme::html/slider/landing-product-${document.getElementById('block-template').value}.phtml"}}`;
    document.getElementById('code').innerHTML = code;
    document.getElementById('code-input').value = codeInput;
}

const loadData = () => {
    const code = document.getElementById('code-input').value;
    const data = /^.*title="(.*)" type="(.*)" template="(.*)" data="(.*)" template=".*$/g.exec(code);
    document.getElementById('block-title').value = data[1];
    document.getElementById('block-type').value = data[2];
    document.getElementById('block-template').value = data[3];
    const products = JSON.parse(data[4].replaceAll(`'`, `"`));
    if (data[2] === 'specific') {
        for (let i = 0; i < products.length; i++) {
            let elmnt = document.getElementById(`product-${i + 1}`);
            if (elmnt) {
                elmnt.querySelector('.form-select').value = products[i].product_vendor;
                elmnt.querySelector('.form-control').value = products[i].product_sku;
            } else {
                addRow();
                elmnt = document.getElementById(`product-${i + 1}`);
                elmnt.querySelector('.form-select').value = products[i].product_vendor;
                elmnt.querySelector('.form-control').value = products[i].product_sku;
            }
        }
    } else if (data[2] === 'search') {
        document.getElementById('search-vendor').value = products['vendor'];
        document.getElementById('search-term').value = products['term'];
    }
    processData();
    changeType();
}

const copyText = (elmnt) => {
    const copyText = document.getElementById('code-input');
    navigator.clipboard.writeText(copyText.value);
    elmnt.className = 'btn btn-success mt-2';
    elmnt.querySelector('i').className = 'bi bi-clipboard-check';
    setTimeout(() => {
        elmnt.className = 'btn btn-primary mt-2';
        elmnt.querySelector('i').className = 'bi bi-clipboard';
        bootstrap.Tooltip.getInstance('#copy-btn').hide();
    }, 2000)
}

const changeType = () => {
    const type = document.getElementById('block-type').value;
    if (type === 'search') {
        document.getElementById('specific-cont').style.display = 'none';
        document.getElementById('search-cont').style.display = 'flex';
    } else {
        document.getElementById('specific-cont').style.display = 'block';
        document.getElementById('search-cont').style.display = 'none';
    }
}

const readCSVFile = () => {
    let files = document.querySelector('#formFile').files;
    if(files.length > 0 ){
        let file = files[0];
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (event) => {
            let csvdata = event.target.result;
            let rowData = csvdata.split("\r\n").map((line) => {
                let lineData = line.split(",").map((value, i) => {
                    console.log(value);
                    console.log(i);
                    value.replace(/\W/g, '');
                    if (i === 0) {
                        value.toLowerCase();
                        switch (value) {
                            case 'macys':
                            case 'mcy':
                                value = 'mcy';
                                break;
                            case 'walmart':
                            case 'wrt':
                                value = 'wrt';
                                break;
                            case 'ebay':
                                value = 'ebay';
                                break;
                            default:
                                value = 'amz';
                        }
                    }
                    return value
                });
                return lineData
            });
            console.log(rowData);
            rowData.shift();
            rowData.forEach((row, i) => {
                let elmnt = document.getElementById(`product-${i + 1}`);
                if (elmnt) {
                    elmnt.querySelector('.form-select').value = row[0];
                    elmnt.querySelector('.form-control').value = row[1];
                } else {
                    addRow();
                    elmnt = document.getElementById(`product-${i + 1}`);
                    elmnt.querySelector('.form-select').value = row[0];
                    elmnt.querySelector('.form-control').value = row[1];
                }
            });
        };

    }
}