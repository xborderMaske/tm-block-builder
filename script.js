const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

const removeRow = (elmnt) => { 
    const id = 'product-' + elmnt.id.match(/(\d+)/)[0];
    document.getElementById(id).remove();
    const prodRows = document.querySelectorAll(".prod-row");
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
    let skuList = [];
    const prodRows = document.querySelectorAll(".prod-row");
    prodRows.forEach(prodRow => {
        let row = {
            product_vendor: prodRow.querySelector('.form-select').value,
            product_sku: prodRow.querySelector('.form-control').value.trim()
        };
        skuList.push(row);
    });
    const skuString = JSON.stringify(skuList).replaceAll(`"`, `'`)
    const code = `{{
    block class="Magento\\Framework\\View\\Element\\Template"
    title="${document.getElementById('slider-title').value.replaceAll(`"`, ``)}"
    type="specific"
    sku_list="${skuString}"
    template="Magento_Theme::html/slider/home-product-slider.phtml"
}}`;
    document.getElementById("code-input").value = code;
}

const loadData = () => {
    const code = document.getElementById("code-input").value.replace(/\s/g,'');
    const data = /.*title="(.*)"type.*sku_list="(\[\{.*\}\])"/g.exec(code);
    document.getElementById('slider-title').value = data[1];
    const products = JSON.parse(data[2].replaceAll(`'`, `"`));
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
}

const copyText = (elmnt) => {
    const copyText = document.getElementById("code-input");
    navigator.clipboard.writeText(copyText.value);
    elmnt.className = 'btn btn-success mt-2';
    elmnt.querySelector('i').className = 'bi bi-clipboard-check';
    setTimeout(() => {
        elmnt.className = 'btn btn-primary mt-2';
        elmnt.querySelector('i').className = 'bi bi-clipboard';
        bootstrap.Tooltip.getInstance('#copy-btn').hide();
    }, 2000)
}